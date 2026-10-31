import { DemoProvider } from '../../apps/api/src/services/ai/demoProvider';
import type { SourceData } from '../../apps/api/src/services/ai';

describe('Information Gap & Contradiction Detection Engine', () => {
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

  test('generates grounded key facts referencing actual source IDs', async () => {
    const output = await provider.analyzeResearch(
      'What should a student verify before applying for a scholarship?',
      'Check deadlines and eligibility',
      mockSources
    );

    expect(output.summary.keyFacts.length).toBeGreaterThan(0);
    output.summary.keyFacts.forEach((fact) => {
      expect(fact.statement.length).toBeGreaterThan(10);
      expect(fact.sourceIds.length).toBeGreaterThan(0);
      // Ensure referenced source IDs are present in mockSources
      fact.sourceIds.forEach((sid) => {
        expect(['src-1', 'src-2']).toContain(sid);
      });
    });
  });

  test('identifies critical unaddressed information gaps with action recommendations', async () => {
    const output = await provider.analyzeResearch(
      'What should a student verify before applying for a scholarship?',
      undefined,
      mockSources
    );

    expect(output.gaps.length).toBeGreaterThan(0);
    output.gaps.forEach((gap) => {
      expect(gap.title).toBeDefined();
      expect(gap.description).toBeDefined();
      expect(gap.importance).toBeDefined();
      expect(gap.suggestedAction).toBeDefined();
      expect(gap.evidenceReviewed).toBeDefined();
    });
  });

  test('detects explicit cross-source contradictions with both claim positions', async () => {
    const output = await provider.analyzeResearch(
      'What should a student verify before applying for a scholarship?',
      undefined,
      mockSources
    );

    expect(output.contradictions.length).toBeGreaterThan(0);
    output.contradictions.forEach((conflict) => {
      expect(conflict.claimA.statement).toBeDefined();
      expect(conflict.claimB.statement).toBeDefined();
      expect(conflict.explanation).toBeDefined();
      expect(conflict.status).toBeDefined();
    });
  });

  test('flags temporal freshness warnings for older or undated content', async () => {
    const output = await provider.analyzeResearch(
      'What should a student verify before applying for a scholarship?',
      undefined,
      mockSources
    );

    expect(output.freshnessWarnings.length).toBeGreaterThan(0);
    output.freshnessWarnings.forEach((warning) => {
      expect(warning.sourceId).toBeDefined();
      expect(warning.reason).toBeDefined();
      expect(warning.explanation).toBeDefined();
    });
  });
});

