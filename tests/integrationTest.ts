import app from '../apps/api/src/app';
import { EventEmitter } from 'events';

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

// In-memory mock HTTP dispatcher for Express
function dispatch(
  method: string,
  url: string,
  body?: any
): Promise<{ status: number; body: any }> {
  return new Promise((resolve) => {
    const req: any = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = {
      'content-type': 'application/json',
      host: 'localhost',
    };
    req.socket = { remoteAddress: '127.0.0.1' };
    req.connection = req.socket;
    req.ip = '127.0.0.1';
    req.body = body || {};

    let statusCode = 200;
    const resHeaders: Record<string, string> = {};

    const res: any = {
      statusCode: 200,
      setHeader(name: string, value: string) {
        resHeaders[name.toLowerCase()] = value;
      },
      getHeader(name: string) {
        return resHeaders[name.toLowerCase()];
      },
      removeHeader(name: string) {
        delete resHeaders[name.toLowerCase()];
      },
      status(code: number) {
        statusCode = code;
        res.statusCode = code;
        return res;
      },
      json(data: any) {
        resolve({ status: statusCode, body: data });
      },
      send(data?: any) {
        resolve({ status: statusCode, body: data });
      },
      end(data?: any) {
        resolve({ status: statusCode, body: data });
      },
    };

    app.handle(req, res);
  });
}

async function runIntegration() {
  console.log('\n========================================');
  console.log(' RUNNING END-TO-END IN-MEMORY API TEST');
  console.log('========================================\n');

  // 1. Health check
  console.log('Step 1: Testing Health Check (/api/v1/health)');
  const healthRes = await dispatch('GET', '/api/v1/health');
  assert(healthRes.status === 200, 'Health endpoint status 200');
  assert(healthRes.body.success === true, 'Health response success: true');
  assert(healthRes.body.data.status === 'healthy', 'System reported healthy');

  // 2. Create Research Session
  console.log('\nStep 2: Creating Research Session (/api/v1/research)');
  const createRes = await dispatch('POST', '/api/v1/research', {
    question: 'What should a student verify before applying for a scholarship?',
    objective: 'Discover hidden displacement rules and deadline contradictions',
    sourceUrls: [
      'https://studentaid.gov/scholarships-eligibility-overview',
      'https://fastweb.com/application-deadlines',
    ],
  });
  assert(createRes.status === 201, 'Research creation status 201');
  assert(createRes.body.success === true, 'Research created successfully');
  const sessionId = createRes.body.data.id;
  assert(typeof sessionId === 'string' && sessionId.length > 0, 'Valid session ID generated');
  assert(createRes.body.data.sources.length === 2, 'Two initial sources registered');

  // 3. Add Additional Source
  console.log('\nStep 3: Appending Source URL (/api/v1/research/:id/sources)');
  const addSrcRes = await dispatch('POST', `/api/v1/research/${sessionId}/sources`, {
    urls: ['https://irs.gov/scholarship-tax-rules'],
  });
  assert(addSrcRes.status === 200, 'Source addition status 200');
  assert(addSrcRes.body.data.sources.length === 3, 'Total sources updated to 3');

  // 4. Run Gap Detection Analysis
  console.log('\nStep 4: Executing Analysis Pipeline (/api/v1/research/:id/analyze)');
  const analyzeRes = await dispatch('POST', `/api/v1/research/${sessionId}/analyze`);
  assert(analyzeRes.status === 200, 'Analysis status 200');
  assert(analyzeRes.body.data.status === 'completed', 'Session status updated to completed');

  const analysis = analyzeRes.body.data.analysis;
  assert(analysis !== undefined, 'Analysis payload attached to session');
  assert(analysis.gaps.length > 0, 'Information gaps identified');
  assert(analysis.contradictions.length > 0, 'Contradictions detected');
  assert(analysis.freshnessWarnings.length > 0, 'Freshness warnings generated');
  assert(analysis.summary.keyFacts.length > 0, 'Core facts grounded');

  const checklist = analyzeRes.body.data.checklist;
  assert(checklist.length > 0, 'Verification checklist compiled');
  const firstCheckId = checklist[0].id;

  // 5. Toggle Checklist Task
  console.log('\nStep 5: Updating Verification Checklist State');
  const toggleRes = await dispatch(
    'PATCH',
    `/api/v1/research/${sessionId}/checklist/${firstCheckId}/toggle`
  );
  assert(toggleRes.status === 200, 'Toggle checklist status 200');
  assert(toggleRes.body.data.completed === true, 'Checklist item marked as completed');

  // 6. Add Custom Verification Task
  console.log('\nStep 6: Adding User-Created Verification Task');
  const customTaskRes = await dispatch(
    'POST',
    `/api/v1/research/${sessionId}/checklist`,
    {
      title: 'Check with department dean on award stacking limits',
      description: 'Verify if engineering stipend displaces tuition grant',
      priority: 'high',
    }
  );
  assert(customTaskRes.status === 201, 'Custom task created status 201');
  assert(customTaskRes.body.data.isCustom === true, 'Item tagged as user custom task');

  // 7. Get Report
  console.log('\nStep 7: Retrieving Full Dossier Report (/api/v1/research/:id/report)');
  const reportRes = await dispatch('GET', `/api/v1/research/${sessionId}/report`);
  assert(reportRes.status === 200, 'Report retrieval status 200');
  assert(reportRes.body.data.session.id === sessionId, 'Report contains matching session data');

  // 8. Delete Research Session
  console.log('\nStep 8: Deleting Research Session (/api/v1/research/:id)');
  const deleteRes = await dispatch('DELETE', `/api/v1/research/${sessionId}`);
  assert(deleteRes.status === 204, 'Session deletion status 204');

  console.log('\n========================================');
  console.log(` INTEGRATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runIntegration().catch((e) => {
  console.error('Integration test failed:', e);
  process.exit(1);
});
