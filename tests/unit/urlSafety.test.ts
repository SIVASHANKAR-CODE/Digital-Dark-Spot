import { isUrlSafe } from '../../apps/api/src/utils/urlSafety';

describe('URL Safety & SSRF Guardrails', () => {
  test('allows legitimate public HTTP/HTTPS URLs', () => {
    expect(isUrlSafe('https://studentaid.gov').safe).toBe(true);
    expect(isUrlSafe('https://en.wikipedia.org/wiki/Scholarship').safe).toBe(true);
    expect(isUrlSafe('http://example.com/guide').safe).toBe(true);
  });

  test('blocks loopback and localhost destinations', () => {
    expect(isUrlSafe('http://localhost:3000').safe).toBe(false);
    expect(isUrlSafe('http://127.0.0.1/admin').safe).toBe(false);
    expect(isUrlSafe('http://[::1]/secret').safe).toBe(false);
  });

  test('blocks private RFC1918 subnet destinations', () => {
    expect(isUrlSafe('http://10.0.0.1/internal').safe).toBe(false);
    expect(isUrlSafe('http://192.168.1.1').safe).toBe(false);
    expect(isUrlSafe('http://172.16.0.5').safe).toBe(false);
  });

  test('blocks cloud metadata endpoints', () => {
    expect(isUrlSafe('http://169.254.169.254/latest/meta-data').safe).toBe(false);
  });

  test('rejects unsupported protocols (file, ftp, javascript)', () => {
    expect(isUrlSafe('file:///etc/passwd').safe).toBe(false);
    expect(isUrlSafe('ftp://ftp.example.com').safe).toBe(false);
    expect(isUrlSafe('javascript:alert(1)').safe).toBe(false);
  });
});

