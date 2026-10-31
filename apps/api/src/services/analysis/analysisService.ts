import { getAIProvider, SourceData } from '../ai';
import { generateId } from '../../utils/idGenerator';
import type {
  AnalysisResult,
  AnalysisSummary,
  Finding,
  InformationGap,
  Contradiction,
  FreshnessWarning,
  VerificationItem,
  ChecklistItem,
  ResearchSession,
  Source,
} from '../../types';

/**
 * Run AI analysis on a research session's extracted sources.
 */
export async function analyzeResearch(session: ResearchSession): Promise<AnalysisResult> {
  // 1. Validate session has sources with extracted content
  const extractedSources = session.sources.filter(
    (s: Source) => s.status === 'extracted' && s.contentExcerpt
  );

  if (extractedSources.length === 0) {
    throw new Error('No sources with extracted content available for analysis');
  }

  console.log(
    `[AnalysisService] Analyzing ${extractedSources.length} sources for session ${session.id}`
  );

  // 2. Prepare source data array
  const sourceData: SourceData[] = extractedSources.map((s: Source) => ({
    id: s.id,
    url: s.url,
    title: s.title || 'Untitled',
    domain: s.domain,
    content: s.contentExcerpt || '',
    publishedDate: s.publishedDate,
  }));

  // 3. Get AI provider
  const provider = getAIProvider();

  try {
    // 4. Call provider
    const aiOutput = await provider.analyzeResearch(
      session.question,
      session.objective,
      sourceData
    );

    // 5. Validate and build the result
    const validSourceIds = new Set(extractedSources.map((s: Source) => s.id));
    const analysisId = generateId();

    // Build key facts with IDs
    const keyFacts = (aiOutput.summary?.keyFacts || []).map((kf) => ({
      id: generateId(),
      statement: kf.statement,
      sourceIds: kf.sourceIds.filter((id: string) => validSourceIds.has(id)),
      confidence: kf.confidence,
    }));

    const summary: AnalysisSummary = {
      overview: aiOutput.summary?.overview || 'Analysis completed.',
      keyFacts,
      totalFindings: (aiOutput.findings || []).length,
      totalGaps: (aiOutput.gaps || []).length,
      totalContradictions: (aiOutput.contradictions || []).length,
      totalFreshnessWarnings: (aiOutput.freshnessWarnings || []).length,
      confidenceNote:
        aiOutput.summary?.confidenceNote ||
        'Confidence levels are estimates based on available evidence.',
    };

    // Build findings with IDs
    const findings: Finding[] = (aiOutput.findings || []).map((f) => ({
      id: generateId(),
      type: f.type,
      title: f.title,
      description: f.description,
      sourceIds: f.sourceIds.filter((id: string) => validSourceIds.has(id)),
      evidence: (f.evidence || [])
        .filter((e) => validSourceIds.has(e.sourceId))
        .map((e) => ({
          sourceId: e.sourceId,
          text: e.text,
          relevance: e.relevance,
        })),
      confidence: f.confidence,
    }));

    // Build gaps with IDs
    const gaps: InformationGap[] = (aiOutput.gaps || []).map((g) => ({
      id: generateId(),
      title: g.title,
      description: g.description,
      importance: g.importance,
      category: g.category,
      evidenceReviewed: g.evidenceReviewed,
      confidence: g.confidence,
      suggestedAction: g.suggestedAction,
      relatedSourceIds: g.relatedSourceIds.filter((id: string) => validSourceIds.has(id)),
    }));

    // Build contradictions with IDs
    const contradictions: Contradiction[] = (aiOutput.contradictions || []).map((c) => ({
      id: generateId(),
      title: c.title,
      description: c.description,
      claimA: c.claimA,
      claimB: c.claimB,
      severity: c.severity,
      explanation: c.explanation,
      status: c.status,
      suggestedResolution: c.suggestedResolution,
    }));

    // Build freshness warnings with IDs
    const freshnessWarnings: FreshnessWarning[] = (aiOutput.freshnessWarnings || [])
      .filter((fw) => validSourceIds.has(fw.sourceId))
      .map((fw) => ({
        id: generateId(),
        sourceId: fw.sourceId,
        title: fw.title,
        reason: fw.reason,
        publishedDate: fw.publishedDate,
        explanation: fw.explanation,
        severity: fw.severity,
      }));

    // Build verification items with IDs
    const verificationItems: VerificationItem[] = (aiOutput.verificationItems || []).map(
      (vi) => ({
        id: generateId(),
        title: vi.title,
        description: vi.description,
        priority: vi.priority,
        category: vi.category,
        sourceIds: vi.sourceIds.filter((id: string) => validSourceIds.has(id)),
        suggestedAction: vi.suggestedAction,
      })
    );

    const analysisResult: AnalysisResult = {
      id: analysisId,
      researchId: session.id,
      status: 'completed',
      summary,
      findings,
      gaps,
      contradictions,
      freshnessWarnings,
      verificationItems,
      limitations: aiOutput.limitations || [],
      processedAt: new Date().toISOString(),
      sourceCount: extractedSources.length,
      modelUsed: provider.name,
    };

    console.log(
      `[AnalysisService] Analysis complete: ${findings.length} findings, ${gaps.length} gaps, ${contradictions.length} contradictions`
    );

    return analysisResult;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown analysis error';
    console.error(`[AnalysisService] Analysis failed: ${message}`);

    // Return partial/failed result
    return {
      id: generateId(),
      researchId: session.id,
      status: 'failed',
      summary: {
        overview: `Analysis failed: ${message}`,
        keyFacts: [],
        totalFindings: 0,
        totalGaps: 0,
        totalContradictions: 0,
        totalFreshnessWarnings: 0,
        confidenceNote: 'Analysis could not be completed.',
      },
      findings: [],
      gaps: [],
      contradictions: [],
      freshnessWarnings: [],
      verificationItems: [],
      limitations: [`Analysis failed: ${message}`],
      processedAt: new Date().toISOString(),
      sourceCount: extractedSources.length,
      modelUsed: provider.name,
    };
  }
}

/**
 * Generate checklist items from verification items in the analysis.
 */
export function generateChecklistItems(verificationItems: VerificationItem[]): ChecklistItem[] {
  return verificationItems.map((vi) => ({
    id: generateId(),
    title: vi.title,
    description: vi.description,
    priority: vi.priority,
    completed: false,
    sourceIds: vi.sourceIds,
    isCustom: false,
    createdAt: new Date().toISOString(),
  }));
}
