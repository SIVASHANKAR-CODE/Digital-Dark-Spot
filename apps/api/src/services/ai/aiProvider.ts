/**
 * AI Provider interface and shared types for analysis.
 */

export interface SourceData {
  id: string;
  url: string;
  title: string;
  domain: string;
  content: string;
  publishedDate?: string;
}

export interface AIAnalysisOutput {
  summary: {
    overview: string;
    keyFacts: Array<{
      statement: string;
      sourceIds: string[];
      confidence: 'high' | 'medium' | 'low' | 'uncertain';
    }>;
    confidenceNote: string;
  };
  findings: Array<{
    type: 'fact' | 'claim' | 'opinion' | 'statistic';
    title: string;
    description: string;
    sourceIds: string[];
    evidence: Array<{
      sourceId: string;
      text: string;
      relevance: 'direct' | 'supporting' | 'contextual';
    }>;
    confidence: 'high' | 'medium' | 'low' | 'uncertain';
  }>;
  gaps: Array<{
    title: string;
    description: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    category: 'missing_detail' | 'unanswered_question' | 'insufficient_evidence' | 'missing_perspective' | 'missing_data' | 'unexplored_aspect';
    evidenceReviewed: string;
    confidence: 'high' | 'medium' | 'low' | 'uncertain';
    suggestedAction: string;
    relatedSourceIds: string[];
  }>;
  contradictions: Array<{
    title: string;
    description: string;
    claimA: { statement: string; sourceId: string; excerpt: string };
    claimB: { statement: string; sourceId: string; excerpt: string };
    severity: 'critical' | 'high' | 'medium' | 'low';
    explanation: string;
    status: 'confirmed_conflict' | 'possible_conflict' | 'needs_investigation';
    suggestedResolution: string;
  }>;
  freshnessWarnings: Array<{
    sourceId: string;
    title: string;
    reason: 'outdated_content' | 'missing_date' | 'rapidly_evolving_topic' | 'superseded_information';
    publishedDate?: string;
    explanation: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  verificationItems: Array<{
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    sourceIds: string[];
    suggestedAction: string;
  }>;
  limitations: string[];
}

/**
 * Interface for AI analysis providers.
 */
export interface AIProvider {
  readonly name: string;

  analyzeResearch(
    question: string,
    objective: string | undefined,
    sources: SourceData[]
  ): Promise<AIAnalysisOutput>;
}
