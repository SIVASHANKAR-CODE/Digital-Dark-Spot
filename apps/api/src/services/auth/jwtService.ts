import jwt from 'jsonwebtoken';
import config from '../../config';
import type { UserRole } from '../../types';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export function generateAuthToken(payload: {
  userId: string;
  email: string;
  role: UserRole;
}): { token: string; expiresIn: string } {
  const token = jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    config.jwtSecret,
    {
      expiresIn: '7d',
    }
  );

  return {
    token,
    expiresIn: config.jwtExpiresIn,
  };
}

export function verifyAuthToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Authentication token has expired. Please sign in again.');
    }
    throw new Error('Invalid authentication token.');
  }
}

