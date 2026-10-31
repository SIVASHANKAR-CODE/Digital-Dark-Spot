import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';
import { isUrlSafe, sanitizeUrl } from '../../utils/urlSafety';
import config from '../../config';

export interface ExtractionResult {
  success: boolean;
  title?: string;
  content?: string;
  excerpt?: string;
  metadata?: {
    author?: string;
    description?: string;
    publishedDate?: string;
    wordCount?: number;
  };
  error?: string;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const FETCH_TIMEOUT_MS = 10000;
const MAX_CONTENT_CHARS = 50000;
const EXCERPT_LENGTH = 500;
const MAX_REDIRECTS = 3;
const USER_AGENT = 'DigitalDarkSpot/1.0 (Research Analysis Bot)';

/**
 * Extract content from a URL.
 * Validates URL safety, fetches HTML, parses with cheerio, sanitizes output.
 */
export async function extractContent(url: string): Promise<ExtractionResult> {
  // 1. Validate URL safety
  const safetyCheck = isUrlSafe(url);
  if (!safetyCheck.safe) {
    return {
      success: false,
      error: `URL blocked: ${safetyCheck.reason}`,
    };
  }

  const cleanUrl = sanitizeUrl(url);

  try {
    // 2. Fetch with manual redirect handling for safety checks
    const html = await fetchWithSafeRedirects(cleanUrl);

    // 3. Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, header, aside, iframe, noscript, svg').remove();
    $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();
    $('.nav, .navbar, .footer, .sidebar, .ad, .advertisement, .cookie-banner').remove();

    // Extract title
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      $('h1').first().text().trim() ||
      'Untitled';

    // Extract metadata
    const author =
      $('meta[name="author"]').attr('content') ||
      $('meta[property="article:author"]').attr('content') ||
      $('[rel="author"]').first().text().trim() ||
      undefined;

    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      undefined;

    const publishedDate =
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[name="date"]').attr('content') ||
      $('meta[name="publish-date"]').attr('content') ||
      $('time[datetime]').first().attr('datetime') ||
      undefined;

    // Extract body text — prefer <article>, then <main>, then <body>
    let bodyText = '';
    const articleEl = $('article');
    const mainEl = $('main');

    if (articleEl.length > 0) {
      bodyText = articleEl.text();
    } else if (mainEl.length > 0) {
      bodyText = mainEl.text();
    } else {
      bodyText = $('body').text();
    }

    // Clean and normalize whitespace
    bodyText = bodyText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(bodyText, {
      allowedTags: [],
      allowedAttributes: {},
    });

    // Truncate content
    const content = sanitizedContent.slice(0, MAX_CONTENT_CHARS);
    const excerpt = sanitizedContent.slice(0, EXCERPT_LENGTH);
    const wordCount = sanitizedContent.split(/\s+/).filter(Boolean).length;

    return {
      success: true,
      title: title.slice(0, 500),
      content,
      excerpt,
      metadata: {
        author,
        description: description?.slice(0, 1000),
        publishedDate,
        wordCount,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown extraction error';
    console.error(`[ContentExtractor] Failed to extract content from ${cleanUrl}: ${message}`);
    return {
      success: false,
      error: `Extraction failed: ${message}`,
    };
  }
}

/**
 * Fetch URL with manual redirect following, checking each hop for safety.
 */
async function fetchWithSafeRedirects(url: string): Promise<string> {
  let currentUrl = url;
  let redirectCount = 0;

  while (redirectCount <= MAX_REDIRECTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      // Handle redirects manually
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          throw new Error(`Redirect ${response.status} without Location header`);
        }

        // Resolve relative URLs
        const redirectUrl = new URL(location, currentUrl).toString();

        // Safety-check the redirect destination
        const redirectSafety = isUrlSafe(redirectUrl);
        if (!redirectSafety.safe) {
          throw new Error(`Redirect blocked: ${redirectSafety.reason}`);
        }

        currentUrl = redirectUrl;
        redirectCount++;
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      // Check content length
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > MAX_SIZE) {
        throw new Error(`Content too large: ${contentLength} bytes (max ${MAX_SIZE})`);
      }

      const text = await response.text();
      if (text.length > MAX_SIZE) {
        throw new Error(`Downloaded content too large: ${text.length} bytes`);
      }

      return text;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`Too many redirects (max ${MAX_REDIRECTS})`);
}
