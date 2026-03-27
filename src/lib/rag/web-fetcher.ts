/**
 * On-demand web fetcher for Canadian government regulation pages.
 * Fetches HTML from laws-lois.justice.gc.ca and inspection.canada.ca,
 * extracts main text content, and caches results.
 *
 * Used as a fallback when DB-stored regulation sections are insufficient.
 */

import { TimeBasedCache, hashKey } from "@/lib/cache";

const FETCH_TIMEOUT_MS = 8_000;
const MAX_CONTENT_CHARS = 6_000;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Cache for fetched + extracted page content */
const pageCache = new TimeBasedCache<string>({
  ttlMs: CACHE_TTL_MS,
  maxEntries: 50,
});

/**
 * Fetch a government regulation page and extract its text content.
 * Returns empty string on failure (never throws).
 */
export async function fetchAndExtract(url: string): Promise<string> {
  const cacheKey = `web_${hashKey(url)}`;
  const cached = pageCache.get(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "OHMAZE/1.0 (Canadian food compliance research tool)",
        Accept: "text/html",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Web fetch failed for ${url}: HTTP ${response.status}`);
      return "";
    }

    const html = await response.text();
    const content = extractMainContent(html);

    if (content.length > 0) {
      pageCache.set(cacheKey, content);
    }

    return content;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn(`Web fetch error for ${url}: ${message}`);
    return "";
  }
}

/**
 * For Justice Laws TOC pages, extract links to content sub-pages
 * and fetch the most relevant ones.
 */
export async function fetchRegulationWithSubpages(
  baseUrl: string,
  maxPages: number = 2,
): Promise<string> {
  // First fetch the main/TOC page
  const mainContent = await fetchAndExtract(baseUrl);

  // If the main page has substantial regulation content, return it.
  // Justice Laws TOC pages are ~500 chars but contain no useful regulation text.
  // Look for actual regulation text indicators, not just length.
  const hasRegulationContent = mainContent.length > 1000 &&
    !mainContent.includes("Table of Contents") &&
    !mainContent.startsWith("Table of Contents");
  if (hasRegulationContent) {
    return mainContent;
  }

  // Otherwise, look for sub-page links (page-1.html, page-2.html pattern)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(baseUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "OHMAZE/1.0 (Canadian food compliance research tool)",
        Accept: "text/html",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) return mainContent;

    const html = await response.text();

    // Extract page links from Justice Laws TOC
    const pageLinks = extractSubpageLinks(html, baseUrl);
    const pagesToFetch = pageLinks.slice(0, maxPages);

    if (pagesToFetch.length === 0) return mainContent;

    // Fetch sub-pages in parallel
    const subPageContents = await Promise.all(
      pagesToFetch.map((link) => fetchAndExtract(link)),
    );

    const combined = [mainContent, ...subPageContents]
      .filter((c) => c.length > 0)
      .join("\n\n---\n\n");

    return truncateContent(combined);
  } catch {
    return mainContent;
  }
}

/**
 * Extract sub-page links from a Justice Laws table of contents page.
 * Looks for patterns like "page-1.html", "page-2.html".
 */
function extractSubpageLinks(html: string, baseUrl: string): readonly string[] {
  const pagePattern = /href=["']([^"']*page-\d+\.html[^"']*)["']/gi;
  const links = new Set<string>();
  let match;

  while ((match = pagePattern.exec(html)) !== null) {
    const href = match[1];
    // Resolve relative URLs
    if (href.startsWith("http")) {
      links.add(href);
    } else {
      const base = baseUrl.endsWith("/") ? baseUrl : baseUrl.replace(/\/[^/]*$/, "/");
      links.add(new URL(href, base).toString());
    }
  }

  // Sort by page number and deduplicate
  return [...links].sort((a, b) => {
    const numA = parseInt(a.match(/page-(\d+)/)?.[1] ?? "0", 10);
    const numB = parseInt(b.match(/page-(\d+)/)?.[1] ?? "0", 10);
    return numA - numB;
  });
}

/**
 * Extract main text content from HTML.
 * Strips navigation, scripts, styles, and HTML tags.
 * Optimized for Canadian government websites.
 */
function extractMainContent(html: string): string {
  let content = html;

  // Try to extract just the main content area
  // Justice Laws uses <main> or id="wb-cont"
  // CFIA uses <main> with class="container"
  const mainMatch =
    content.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ??
    content.match(/<div[^>]*id=["']wb-cont["'][^>]*>([\s\S]*?)<\/div>\s*<\/main>/i) ??
    content.match(/<article[^>]*>([\s\S]*?)<\/article>/i);

  if (mainMatch) {
    content = mainMatch[1];
  }

  // Remove elements that don't contain regulation text
  content = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Convert some HTML elements to readable text
  content = content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, " | ")
    .replace(/<\/th>/gi, " | ");

  // Strip remaining HTML tags
  content = content.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  content = content
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");

  // Clean up whitespace
  content = content
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return truncateContent(content);
}

/**
 * Truncate content to stay within LLM context budget.
 */
function truncateContent(text: string): string {
  if (text.length <= MAX_CONTENT_CHARS) return text;

  // Try to cut at a paragraph boundary
  const cutPoint = text.lastIndexOf("\n\n", MAX_CONTENT_CHARS);
  if (cutPoint > MAX_CONTENT_CHARS * 0.5) {
    return text.slice(0, cutPoint) + "\n\n[Content truncated...]";
  }

  return text.slice(0, MAX_CONTENT_CHARS) + "\n\n[Content truncated...]";
}

/** Export cache for testing/monitoring */
export { pageCache };
