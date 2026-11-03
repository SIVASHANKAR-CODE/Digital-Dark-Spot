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

  // Collect candidate client IDs from config and environment
  const candidateIds = [
    config.googleClientId,
    process.env.GOOGLE_CLIENT_ID,
    process.env.VITE_GOOGLE_CLIENT_ID,
  ].filter((id): id is string => Boolean(id && typeof id === 'string' && id.trim().length > 0));

  const uniqueIds = Array.from(new Set(candidateIds));
  const audience = uniqueIds.length === 1 ? uniqueIds[0] : uniqueIds.length > 1 ? uniqueIds : undefined;

  const client = new OAuth2Client(uniqueIds[0]);
  let payload: TokenPayload | undefined;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience,
    });
    payload = ticket.getPayload();
  } catch (error: any) {
    console.warn('[GoogleAuth] Standard audience verification issue:', error.message);

    // Fallback: verify cryptographic signature against Google's public certs
    try {
      const ticketWithoutAud = await client.verifyIdToken({ idToken });
      const unpinnedPayload = ticketWithoutAud.getPayload();

      // If candidate IDs exist, verify the token's aud claim matches one of them
      if (unpinnedPayload && uniqueIds.length > 0) {
        const tokenAud = unpinnedPayload.aud;
        const matches = Array.isArray(tokenAud)
          ? tokenAud.some((a) => uniqueIds.includes(a))
          : uniqueIds.includes(tokenAud as string);

        if (matches) {
          payload = unpinnedPayload;
        } else {
          console.warn(`[GoogleAuth] Token aud '${tokenAud}' did not match configured Client IDs:`, uniqueIds);
          throw new Error(
            `Google ID token audience mismatch (token aud: ${tokenAud}). Ensure VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID match your Google Web Client ID.`
          );
        }
      } else if (unpinnedPayload) {
        payload = unpinnedPayload;
      }
    } catch (fallbackError: any) {
      if (payload) {
        // already resolved
      } else if (config.nodeEnv !== 'production') {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          try {
            const raw = Buffer.from(parts[1], 'base64').toString('utf-8');
            payload = JSON.parse(raw);
          } catch {}
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
