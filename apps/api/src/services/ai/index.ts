import { AIProvider } from './aiProvider';
import { GeminiProvider } from './geminiProvider';
import { DemoProvider } from './demoProvider';
import config from '../../config';

/**
 * Factory function to get the appropriate AI provider.
 * Returns GeminiProvider if API key is configured, otherwise DemoProvider.
 */
export function getAIProvider(): AIProvider {
  if (config.geminiApiKey) {
    console.log('[AIProvider] Using Gemini provider');
    return new GeminiProvider();
  }

  console.log('[AIProvider] No AI API key configured — using Demo provider');
  return new DemoProvider();
}

export { AIProvider, SourceData, AIAnalysisOutput } from './aiProvider';
export { GeminiProvider } from './geminiProvider';
export { DemoProvider } from './demoProvider';
