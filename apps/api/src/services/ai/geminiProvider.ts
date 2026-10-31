import { AIProvider, AIAnalysisOutput, SourceData } from './aiProvider';
import config from '../../config';

/**
 * Gemini AI Provider — calls Google Generative Language API.
 */
export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private readonly apiKey: string;
  private readonly modelUrl: string;

  constructor() {
    this.apiKey = config.geminiApiKey;
    this.modelUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  }

  async analyzeResearch(
    question: string,
    objective: string | undefined,
    sources: SourceData[]
  ): Promise<AIAnalysisOutput> {
    const prompt = this.buildPrompt(question, objective, sources);

    console.log(`[GeminiProvider] Analyzing research with ${sources.length} sources`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${this.modelUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        if (response.status === 429) {
          throw new Error('Gemini API rate limit exceeded. Please try again later.');
        }
        throw new Error(`Gemini API error (${response.status}): ${errorBody.slice(0, 500)}`);
      }

      const data = (await response.json()) as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      // Parse JSON from response
      const parsed = this.parseJsonResponse(text);

      // Validate source ID references
      const validSourceIds = new Set(sources.map((s) => s.id));
      const validated = this.validateSourceReferences(parsed, validSourceIds);

      console.log('[GeminiProvider] Analysis complete');
      return validated;
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildPrompt(
    question: string,
    objective: string | undefined,
    sources: SourceData[]
  ): string {
    const sourceList = sources
      .map(
        (s, i) =>
          `--- Source ${i + 1} ---\nID: ${s.id}\nTitle: ${s.title}\nDomain: ${s.domain}\nPublished Date: ${s.publishedDate || 'Unknown'}\nContent:\n${s.content.slice(0, 10000)}\n`
      )
      .join('\n');

    const validIds = sources.map((s) => s.id).join(', ');

    return `You are an expert research analyst specializing in information gap detection.

## Research Question
${question}

${objective ? `## Research Objective\n${objective}\n` : ''}

## Sources to Analyze
${sourceList}

## Instructions
Analyze the provided sources thoroughly and produce a JSON analysis with the following structure.

CRITICAL RULES:
1. ONLY reference source IDs from this list: [${validIds}]. Do NOT invent or fabricate any source IDs.
2. Label findings as "potential" when evidence is limited — never state uncertain things as confirmed facts.
3. Never invent URLs, citations, or claim sources contain information they do not.
4. If sources are insufficient, say so in limitations.

Produce a JSON object with these keys:

{
  "summary": {
    "overview": "A comprehensive overview of what the sources collectively tell us about the research question",
    "keyFacts": [
      {
        "statement": "A key fact extracted from sources",
        "sourceIds": ["source_id_1"],
        "confidence": "high|medium|low|uncertain"
      }
    ],
    "confidenceNote": "A note about overall confidence in the analysis"
  },
  "findings": [
    {
      "type": "fact|claim|opinion|statistic",
      "title": "Finding title",
      "description": "Detailed description",
      "sourceIds": ["source_id_1"],
      "evidence": [
        { "sourceId": "source_id_1", "text": "relevant excerpt", "relevance": "direct|supporting|contextual" }
      ],
      "confidence": "high|medium|low|uncertain"
    }
  ],
  "gaps": [
    {
      "title": "Gap title",
      "description": "What information is missing",
      "importance": "critical|high|medium|low",
      "category": "missing_detail|unanswered_question|insufficient_evidence|missing_perspective|missing_data|unexplored_aspect",
      "evidenceReviewed": "What was reviewed to identify this gap",
      "confidence": "high|medium|low|uncertain",
      "suggestedAction": "How to fill this gap",
      "relatedSourceIds": ["source_id_1"]
    }
  ],
  "contradictions": [
    {
      "title": "Contradiction title",
      "description": "Description of the conflict",
      "claimA": { "statement": "First claim", "sourceId": "source_id_1", "excerpt": "Relevant text" },
      "claimB": { "statement": "Opposing claim", "sourceId": "source_id_2", "excerpt": "Relevant text" },
      "severity": "critical|high|medium|low",
      "explanation": "Why these claims conflict",
      "status": "confirmed_conflict|possible_conflict|needs_investigation",
      "suggestedResolution": "How to resolve"
    }
  ],
  "freshnessWarnings": [
    {
      "sourceId": "source_id_1",
      "title": "Warning title",
      "reason": "outdated_content|missing_date|rapidly_evolving_topic|superseded_information",
      "publishedDate": "date or null",
      "explanation": "Why this is a concern",
      "severity": "critical|high|medium|low"
    }
  ],
  "verificationItems": [
    {
      "title": "Item to verify",
      "description": "What needs checking",
      "priority": "critical|high|medium|low",
      "category": "factual_accuracy|source_credibility|data_currency|cross_reference",
      "sourceIds": ["source_id_1"],
      "suggestedAction": "How to verify"
    }
  ],
  "limitations": [
    "Limitation 1",
    "Limitation 2"
  ]
}

Respond with ONLY the JSON object, no additional text.`;
  }

  private parseJsonResponse(text: string): AIAnalysisOutput {
    // Try to parse directly
    try {
      return JSON.parse(text);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim());
      }
      // Try to find JSON object in the response
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(text.slice(firstBrace, lastBrace + 1));
      }
      throw new Error('Failed to parse JSON from Gemini response');
    }
  }

  /**
   * Strip any source ID references that don't match actual provided source IDs.
   */
  private validateSourceReferences(
    output: AIAnalysisOutput,
    validIds: Set<string>
  ): AIAnalysisOutput {
    const filterIds = (ids: string[]): string[] =>
      ids.filter((id) => validIds.has(id));

    const filterIdOrDefault = (id: string): string =>
      validIds.has(id) ? id : Array.from(validIds)[0] || id;

    return {
      ...output,
      summary: {
        ...output.summary,
        keyFacts: (output.summary?.keyFacts || []).map((kf) => ({
          ...kf,
          sourceIds: filterIds(kf.sourceIds || []),
        })),
      },
      findings: (output.findings || []).map((f) => ({
        ...f,
        sourceIds: filterIds(f.sourceIds || []),
        evidence: (f.evidence || [])
          .filter((e) => validIds.has(e.sourceId))
          .map((e) => ({ ...e, sourceId: e.sourceId })),
      })),
      gaps: (output.gaps || []).map((g) => ({
        ...g,
        relatedSourceIds: filterIds(g.relatedSourceIds || []),
      })),
      contradictions: (output.contradictions || []).map((c) => ({
        ...c,
        claimA: { ...c.claimA, sourceId: filterIdOrDefault(c.claimA?.sourceId) },
        claimB: { ...c.claimB, sourceId: filterIdOrDefault(c.claimB?.sourceId) },
      })),
      freshnessWarnings: (output.freshnessWarnings || []).filter((fw) =>
        validIds.has(fw.sourceId)
      ),
      verificationItems: (output.verificationItems || []).map((vi) => ({
        ...vi,
        sourceIds: filterIds(vi.sourceIds || []),
      })),
      limitations: output.limitations || [],
    };
  }
}
