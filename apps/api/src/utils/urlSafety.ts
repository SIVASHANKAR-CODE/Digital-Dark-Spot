/**
 * URL safety validation utilities.
 * Prevents SSRF by blocking private/loopback/link-local addresses
 * and cloud metadata endpoints.
 */

export interface UrlSafetyResult {
  safe: boolean;
  reason?: string;
}

/** Private IPv4 ranges */
const PRIVATE_IPV4_PATTERNS = [
  /^127\./,                    // Loopback
  /^10\./,                     // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
  /^192\.168\./,               // 192.168.0.0/16
  /^169\.254\./,               // Link-local
  /^0\./,                      // Current network
];

/** Blocked hostnames */
const BLOCKED_HOSTNAMES = [
  'localhost',
  'localhost.localdomain',
  '0.0.0.0',
  '[::1]',
  'metadata.google.internal',
  'metadata.google.com',
];

/**
 * Check whether a hostname looks like a private/reserved IPv6 address.
 */
function isPrivateIPv6(hostname: string): boolean {
  const stripped = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (stripped === '::1' || stripped === '::') return true;
  if (stripped.startsWith('fc') || stripped.startsWith('fd')) return true;   // fc00::/7
  if (stripped.startsWith('fe80')) return true;                              // fe80::/10
  return false;
}

/**
 * Validate that a URL is safe to fetch (no SSRF).
 */
export function isUrlSafe(url: string): UrlSafetyResult {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { safe: false, reason: 'Invalid URL format' };
  }

  // Protocol check
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { safe: false, reason: `Unsupported protocol: ${parsed.protocol}` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block known dangerous hostnames
  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return { safe: false, reason: `Blocked hostname: ${hostname}` };
  }

  // Block cloud metadata endpoint IP
  if (hostname === '169.254.169.254') {
    return { safe: false, reason: 'Cloud metadata endpoint is blocked' };
  }

  // Check private IPv4
  for (const pattern of PRIVATE_IPV4_PATTERNS) {
    if (pattern.test(hostname)) {
      return { safe: false, reason: `Private/reserved IP address: ${hostname}` };
    }
  }

  // Check private IPv6
  if (isPrivateIPv6(hostname)) {
    return { safe: false, reason: `Private/reserved IPv6 address: ${hostname}` };
  }

  // Block credentials in URL
  if (parsed.username || parsed.password) {
    return { safe: false, reason: 'URLs with embedded credentials are not allowed' };
  }

  return { safe: true };
}

/**
 * Sanitize a URL: ensure proper encoding, strip credentials.
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Strip credentials
    parsed.username = '';
    parsed.password = '';
    return parsed.toString();
  } catch {
    return url;
  }
}
