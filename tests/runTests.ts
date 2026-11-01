import { isUrlSafe } from '../apps/api/src/utils/urlSafety';
import { DemoProvider } from '../apps/api/src/services/ai/demoProvider';
import { userStore } from '../apps/api/src/models/userStore';
import { generateAuthToken, verifyAuthToken } from '../apps/api/src/services/auth/jwtService';
import type { SourceData } from '../apps/api/src/services/ai';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n========================================');
  console.log(' RUNNING DIGITAL DARK SPOT TEST SUITE');
  console.log('========================================\n');

  console.log('1. URL Safety & SSRF Guardrail Tests:');
  assert(isUrlSafe('https://studentaid.gov').safe === true, 'Public HTTPS URL permitted');
  assert(isUrlSafe('http://example.com/guide').safe === true, 'Public HTTP URL permitted');
  assert(isUrlSafe('http://localhost:3000').safe === false, 'Localhost blocked');
  assert(isUrlSafe('http://127.0.0.1/admin').safe === false, '127.0.0.1 blocked');
  assert(isUrlSafe('http://10.0.0.1/internal').safe === false, 'RFC1918 10.x blocked');
  assert(isUrlSafe('http://192.168.1.1').safe === false, 'RFC1918 192.168.x blocked');
  assert(isUrlSafe('http://172.16.0.5').safe === false, 'RFC1918 172.16.x blocked');
  assert(isUrlSafe('http://169.254.169.254/latest/meta-data').safe === false, 'Cloud metadata endpoint blocked');
  assert(isUrlSafe('file:///etc/passwd').safe === false, 'file:// protocol blocked');
  assert(isUrlSafe('javascript:alert(1)').safe === false, 'javascript: protocol blocked');

  console.log('\n2. AI Grounding & Gap Detection Tests:');
  const provider = new DemoProvider();
  const mockSources: SourceData[] = [
    {
      id: 'src-1',
      url: 'https://studentaid.gov/overview',
      title: 'Federal Student Aid Guidelines',
      domain: 'studentaid.gov',
      content: 'Federal guidelines for scholarships and eligibility criteria for college students.',
      publishedDate: '2023-08-15',
    },
    {
      id: 'src-2',
      url: 'https://fastweb.com/deadlines',
      title: 'Scholarship Deadlines Calendar',
      domain: 'fastweb.com',
      content: 'Application deadlines must be postmarked before March 15. GPA minimum is 3.5.',
      publishedDate: '2024-01-10',
    },
  ];

  const output = await provider.analyzeResearch(
    'What should a student verify before applying for a scholarship?',
    'Check deadlines and displacement rules',
    mockSources
  );

  assert(output.summary.keyFacts.length > 0, 'Key facts extracted');
  assert(output.gaps.length > 0, 'Information gaps detected');
  assert(output.contradictions.length > 0, 'Cross-source contradictions detected');
  assert(output.freshnessWarnings.length > 0, 'Freshness warnings generated');
  assert(output.verificationItems.length > 0, 'Verification checklist items generated');

  // Verify source ID references strictly match input sources
  const validIds = new Set(['src-1', 'src-2']);
  let allSourceIdsValid = true;
  output.summary.keyFacts.forEach((kf) => {
    kf.sourceIds.forEach((sid) => {
      if (!validIds.has(sid)) allSourceIdsValid = false;
    });
  });
  assert(allSourceIdsValid, 'All fact source IDs strictly match ingested sources (no hallucinated citations)');

  // Verify gap structure
  const gap = output.gaps[0];
  assert(typeof gap.title === 'string' && gap.title.length > 5, 'Gap has descriptive title');
  assert(typeof gap.suggestedAction === 'string' && gap.suggestedAction.length > 5, 'Gap provides actionable verification step');

  // Verify contradiction structure
  const conflict = output.contradictions[0];
  assert(typeof conflict.claimA.statement === 'string', 'Conflict includes Claim A position');
  assert(typeof conflict.claimB.statement === 'string', 'Conflict includes Claim B position');
  assert(typeof conflict.explanation === 'string', 'Conflict includes discrepancy root cause analysis');

  console.log('\n3. Google & Session Authentication Tests:');
  // Test A: Create Google user
  const googleUser = await userStore.createGoogleUser({
    googleId: 'google_sub_1092837465',
    email: 'newuser@google.com',
    name: 'Ada Lovelace',
    avatar: 'https://lh3.googleusercontent.com/a/photo.jpg',
  });
  assert(googleUser.email === 'newuser@google.com', 'Google user registered with verified email');
  assert(googleUser.role === 'user', 'New Google user assigned safe unprivileged role');
  assert(googleUser.authProvider === 'google', 'Provider accurately recorded as google');
  assert(googleUser.emailVerified === true, 'Google email marked verified');

  // Test B: Token generation & verification
  const { token } = generateAuthToken({
    userId: googleUser.id,
    email: googleUser.email,
    role: googleUser.role,
  });
  const decoded = verifyAuthToken(token);
  assert(decoded.userId === googleUser.id, 'JWT token decodes valid user ID');
  assert(decoded.role === 'user', 'JWT preserves user role');

  // Test C: Account linking for existing email
  const linkedUser = await userStore.createGoogleUser({
    googleId: 'google_sub_linked_999',
    email: 'newuser@google.com', // same email
    name: 'Ada Lovelace Updated',
    avatar: 'https://lh3.googleusercontent.com/updated.jpg',
  });
  assert(linkedUser.id === googleUser.id, 'Account linked without creating duplicate user record');
  assert(linkedUser.googleId === 'google_sub_linked_999', 'Google ID linked successfully');

  // Test D: Local registration duplicate check
  let duplicateThrew = false;
  try {
    await userStore.createLocalUser({
      name: 'Duplicate',
      email: 'newuser@google.com',
      passwordHash: 'hash123',
    });
  } catch {
    duplicateThrew = true;
  }
  assert(duplicateThrew, 'Duplicate email registration rejected');

  console.log('\n========================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
