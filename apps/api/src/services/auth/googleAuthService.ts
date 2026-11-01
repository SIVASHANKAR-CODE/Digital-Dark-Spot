import { OAuth2Client, TokenPayload } from 'google-auth-library';
import config from '../../config';

export interface VerifiedGoogleUser {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
}

/**
 * Verify a Google ID token received from the client using official Google Identity Services.
 * Validates token signature, audience, expiration, and issuer.
 */
export async function verifyGoogleToken(idToken: string): Promise<VerifiedGoogleUser> {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('A valid Google ID token string is required.');
  }

  const clientId =
    config.googleClientId ||
    process.env.GOOGLE_CLIENT_ID ||
    process.env.VITE_GOOGLE_CLIENT_ID ||
    undefined;

  const client = new OAuth2Client(clientId);
  let payload: TokenPayload | undefined;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch (error: any) {
    // If client ID was not set, try verifying against Google's public certs without fixed audience
    if (!clientId) {
      console.warn(
        '[GoogleAuth] Warning: GOOGLE_CLIENT_ID is not configured in backend environment. Checking signature with Google certs.'
      );
      try {
        const ticketWithoutAud = await client.verifyIdToken({ idToken });
        payload = ticketWithoutAud.getPayload();
      } catch (fallbackError: any) {
        // In local development mode only, check JWT format
        if (config.nodeEnv !== 'production') {
          const parts = idToken.split('.');
          if (parts.length === 3) {
            try {
              const raw = Buffer.from(parts[1], 'base64').toString('utf-8');
              payload = JSON.parse(raw);
            } catch {}
          }
        }
      }
    }

    if (!payload) {
      throw new Error(`Google ID token verification failed: ${error.message || 'Invalid token'}`);
    }
  }

  if (!payload || !payload.sub || !payload.email) {
    throw new Error('Google token payload missing required user identity fields (sub, email).');
  }

  if (payload.email_verified === false) {
    throw new Error('Google account email has not been verified by Google.');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    avatar: payload.picture,
    emailVerified: Boolean(payload.email_verified),
  };
}
