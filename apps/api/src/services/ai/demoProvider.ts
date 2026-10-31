import { AIProvider, AIAnalysisOutput, SourceData } from './aiProvider';

/**
 * Demo AI Provider — returns realistic demo analysis data.
 * Works without any API keys configured.
 */
export class DemoProvider implements AIProvider {
  readonly name = 'demo';

  async analyzeResearch(
    question: string,
    objective: string | undefined,
    sources: SourceData[]
  ): Promise<AIAnalysisOutput> {
    console.log(`[DemoProvider] Generating demo analysis for: "${question.slice(0, 80)}..."`);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const sourceIds = sources.map((s) => s.id);
    const primarySourceId = sourceIds[0] || 'demo-source';
    const secondarySourceId = sourceIds[1] || sourceIds[0] || 'demo-source';
    const tertiarySourceId = sourceIds[2] || sourceIds[0] || 'demo-source';

    return {
      summary: {
        overview: `[DEMO] Analysis of ${sources.length} source(s) regarding: "${question}". ${
          objective ? `Research objective: ${objective}. ` : ''
        }The provided sources offer partial coverage of the topic. Key information was extracted and cross-referenced, revealing several areas where further investigation would strengthen the research.`,
        keyFacts: [
          {
            statement: `[DEMO] The primary source provides foundational information on the research topic from ${sources[0]?.domain || 'the source domain'}.`,
            sourceIds: [primarySourceId],
            confidence: 'medium',
          },
          {
            statement: `[DEMO] Multiple perspectives are represented across the ${sources.length} source(s) analyzed, though coverage varies in depth.`,
            sourceIds: sourceIds.slice(0, 2),
            confidence: 'medium',
          },
          {
            statement: '[DEMO] Some claims in the sources would benefit from additional verification through authoritative references.',
            sourceIds: [primarySourceId],
            confidence: 'low',
          },
          {
            statement: '[DEMO] The topic appears to have evolving information that may require periodic re-evaluation.',
            sourceIds: sourceIds.slice(0, 2),
            confidence: 'uncertain',
          },
        ],
        confidenceNote:
          '[DEMO] This is demonstration data. Confidence levels are illustrative only. Connect a real AI provider (Gemini) for actual analysis.',
      },
      findings: [
        {
          type: 'fact',
          title: '[DEMO] Primary Source Information',
          description: `The primary source (${sources[0]?.title || 'Source 1'}) provides relevant information about the research question. The content covers key aspects but may not represent the complete picture.`,
          sourceIds: [primarySourceId],
          evidence: [
            {
              sourceId: primarySourceId,
              text: sources[0]?.content?.slice(0, 200) || 'Content excerpt from primary source.',
              relevance: 'direct',
            },
          ],
          confidence: 'medium',
        },
        {
          type: 'claim',
          title: '[DEMO] Cross-Source Consistency',
          description:
            'The sources generally align on basic facts but differ in emphasis and detail level. This is a common pattern that suggests the need for additional corroborating sources.',
          sourceIds: sourceIds.slice(0, 2),
          evidence: [
            {
              sourceId: primarySourceId,
              text: 'Evidence from primary source supports the main claims.',
              relevance: 'direct',
            },
            {
              sourceId: secondarySourceId,
              text: 'Secondary source provides supporting context.',
              relevance: 'supporting',
            },
          ],
          confidence: 'medium',
        },
        {
          type: 'opinion',
          title: '[DEMO] Interpretive Differences',
          description:
            'Sources present different interpretive frameworks for understanding the topic. These differences may reflect legitimate scholarly debate or differing editorial perspectives.',
          sourceIds: [secondarySourceId],
          evidence: [
            {
              sourceId: secondarySourceId,
              text: 'Source presents an interpretive perspective on the topic.',
              relevance: 'contextual',
            },
          ],
          confidence: 'low',
        },
      ],
      gaps: [
        {
          title: '[DEMO] Limited Source Diversity',
          description:
            'The current set of sources may not represent the full range of perspectives on this topic. Additional sources from different domains or viewpoints would strengthen the analysis.',
          importance: 'high',
          category: 'missing_perspective',
          evidenceReviewed: `Reviewed ${sources.length} source(s) from ${new Set(sources.map((s) => s.domain)).size} domain(s).`,
          confidence: 'high',
          suggestedAction:
            'Search for additional sources from academic databases, government reports, or independent research organizations.',
          relatedSourceIds: sourceIds.slice(0, 2),
        },
        {
          title: '[DEMO] Quantitative Data Absent',
          description:
            'The sources lack specific quantitative data, statistics, or measurable evidence that would substantiate the claims made.',
          importance: 'medium',
          category: 'missing_data',
          evidenceReviewed: 'All provided sources were reviewed for statistical or quantitative content.',
          confidence: 'medium',
          suggestedAction:
            'Look for sources that include specific numbers, percentages, or data-driven analysis related to the research question.',
          relatedSourceIds: [primarySourceId],
        },
        {
          title: '[DEMO] Historical Context Not Covered',
          description:
            'The sources focus on current information without providing sufficient historical context that would help understand the evolution of this topic.',
          importance: 'medium',
          category: 'unexplored_aspect',
          evidenceReviewed: 'Reviewed all sources for historical references and timeline information.',
          confidence: 'medium',
          suggestedAction:
            'Seek sources that provide historical background and timeline of developments related to this topic.',
          relatedSourceIds: [tertiarySourceId],
        },
      ],
      contradictions:
        sources.length >= 2
          ? [
              {
                title: '[DEMO] Potential Emphasis Discrepancy',
                description:
                  'Sources appear to emphasize different aspects of the topic, which could indicate underlying disagreements in interpretation.',
                claimA: {
                  statement: 'The primary source emphasizes one aspect of the topic.',
                  sourceId: primarySourceId,
                  excerpt: 'Excerpt from primary source perspective.',
                },
                claimB: {
                  statement: 'The secondary source emphasizes a different aspect.',
                  sourceId: secondarySourceId,
                  excerpt: 'Excerpt from secondary source perspective.',
                },
                severity: 'low',
                explanation:
                  'This may reflect different editorial priorities rather than factual contradiction.',
                status: 'needs_investigation',
                suggestedResolution:
                  'Compare both perspectives with an authoritative third-party source to determine if this represents a genuine disagreement.',
              },
            ]
          : [],
      freshnessWarnings: [
        {
          sourceId: primarySourceId,
          title: '[DEMO] Publication Date Verification Needed',
          reason: 'missing_date',
          explanation:
            'The publication date could not be reliably determined from the source metadata. Information currency cannot be fully assessed.',
          severity: 'medium',
        },
        ...(sources.length > 1
          ? [
              {
                sourceId: secondarySourceId,
                title: '[DEMO] Topic May Have Evolved',
                reason: 'rapidly_evolving_topic' as const,
                publishedDate: sources[1]?.publishedDate,
                explanation:
                  'This topic area may be subject to rapid changes. Verify that the information is still current.',
                severity: 'low' as const,
              },
            ]
          : []),
      ],
      verificationItems: [
        {
          title: '[DEMO] Verify Primary Claims',
          description:
            'The main claims from the primary source should be cross-referenced with authoritative databases or official sources.',
          priority: 'high',
          category: 'factual_accuracy',
          sourceIds: [primarySourceId],
          suggestedAction:
            'Check claims against official government databases, peer-reviewed publications, or recognized authority websites.',
        },
        {
          title: '[DEMO] Assess Source Credibility',
          description:
            'Evaluate the credibility and potential biases of each source used in this analysis.',
          priority: 'medium',
          category: 'source_credibility',
          sourceIds: sourceIds,
          suggestedAction:
            'Research the reputation, funding, and editorial policies of each source domain.',
        },
        {
          title: '[DEMO] Confirm Data Currency',
          description:
            'Ensure all referenced information is still current and has not been superseded by newer findings.',
          priority: 'medium',
          category: 'data_currency',
          sourceIds: [primarySourceId],
          suggestedAction:
            'Search for the latest publications or updates on this topic from the same and related sources.',
        },
        {
          title: '[DEMO] Cross-Reference Key Statistics',
          description:
            'Any statistical claims or numbers mentioned should be verified against original data sources.',
          priority: 'high',
          category: 'cross_reference',
          sourceIds: sourceIds.slice(0, 2),
          suggestedAction:
            'Locate the original research papers or data sets that underlie any quoted statistics.',
        },
      ],
      limitations: [
        'This analysis uses demonstration data. Connect an AI provider for live analysis.',
        `Only ${sources.length} source(s) were analyzed. A comprehensive analysis typically requires 5-10 diverse sources.`,
        'Demo mode cannot perform semantic analysis of source content. Results are illustrative templates.',
        'Source credibility assessment requires a real AI provider with web knowledge.',
      ],
    };
  }
}
