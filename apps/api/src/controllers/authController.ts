import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { userStore } from '../models/userStore';
import { verifyGoogleToken } from '../services/auth/googleAuthService';
import { generateAuthToken } from '../services/auth/jwtService';
import type { ApiResponse, AuthResponseData, UserProfile } from '../types';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * Handle Google OAuth 2.0 / Google Identity Services authentication.
 * Verifies ID token on server, links or creates user account, returns JWT.
 */
export async function googleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Google ID token is required' },
      });
    }

    // 1. Verify token with Google's official library
    const googleUser = await verifyGoogleToken(idToken);

    // 2. Lookup existing user by Google ID or verified Email
    let user = await userStore.findByGoogleId(googleUser.googleId);

    if (!user) {
      // Check if an account already exists with this email
      const existingByEmail = await userStore.findByEmail(googleUser.email);
      if (existingByEmail) {
        // Link Google identity to the existing account safely (preserving password & role)
        user = await userStore.linkGoogleAccount(existingByEmail.id, {
          googleId: googleUser.googleId,
          avatar: googleUser.avatar,
        });
      } else {
        // Create new user account with default unprivileged role
        user = await userStore.createGoogleUser({
          googleId: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.avatar,
        });
      }
    } else {
      // Returning user - update last login timestamp
      await userStore.updateLastLogin(user.id);
    }

    // 3. Generate application JWT
    const { token, expiresIn } = generateAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response: ApiResponse<AuthResponseData> = {
      success: true,
      data: {
        user: userStore.toProfile(user),
        token,
        expiresIn,
      },
      meta: { timestamp: new Date().toISOString() },
    };

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'GOOGLE_AUTH_FAILED',
        message: error.message || 'Google authentication failed',
      },
    });
  }
}

/**
 * Handle standard email + password login.
 */
export async function localLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await userStore.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    // Verify password if local password hash exists
    if (user.passwordHash) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
        });
      }
    } else if (user.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'GOOGLE_ACCOUNT',
          message: 'This account was registered with Google. Please use Continue with Google.',
        },
      });
    }

    await userStore.updateLastLogin(user.id);

    const { token, expiresIn } = generateAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response: ApiResponse<AuthResponseData> = {
      success: true,
      data: {
        user: userStore.toProfile(user),
        token,
        expiresIn,
      },
      meta: { timestamp: new Date().toISOString() },
    };

    return res.status(200).json(response);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle new local account registration.
 */
export async function localRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;

    const existing = await userStore.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists. Please sign in.',
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await userStore.createLocalUser({
      name,
      email,
      passwordHash,
    });

    const { token, expiresIn } = generateAuthToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const response: ApiResponse<AuthResponseData> = {
      success: true,
      data: {
        user: userStore.toProfile(newUser),
        token,
        expiresIn,
      },
      meta: { timestamp: new Date().toISOString() },
    };

    return res.status(201).json(response);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Retrieve verified session of currently authenticated user.
 */
export async function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
    });
  }

  const response: ApiResponse<UserProfile> = {
    success: true,
    data: req.user,
    meta: { timestamp: new Date().toISOString() },
  };

  return res.json(response);
}

