const USER_AGENT = "RabbitHoleApp/1.0 (rabbit-hole-explorer)";

const headers: HeadersInit = {
  "User-Agent": USER_AGENT,
  Accept: "application/json",
};

const FETCH_TIMEOUT_MS = 8000;

function fetchWithTimeout(
  url: string,
  opts: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...opts,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
}

export interface ArticleSummary {
  title: string;
  displaytitle: string;
  description?: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls: {
    desktop: { page: string };
    mobile: { page: string };
  };
  pageid: number;
}

export async function getRandomArticle(): Promise<ArticleSummary> {
  const res = await fetchWithTimeout(
    "https://en.wikipedia.org/api/rest_v1/page/random/summary",
    { headers, redirect: "follow" }
  );
  if (!res.ok) throw new Error(`Failed to get random article: ${res.status}`);
  return res.json();
}

export async function getArticleSummary(
  title: string
): Promise<ArticleSummary> {
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  const res = await fetchWithTimeout(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
    { headers }
  );
  if (!res.ok)
    throw new Error(`Failed to get summary for "${title}": ${res.status}`);
  return res.json();
}

export async function getArticleLinks(title: string): Promise<string[]> {
  const params = new URLSearchParams({
    action: "query",
    titles: title,
    prop: "links",
    plnamespace: "0",
    pllimit: "500",
    format: "json",
    origin: "*",
  });

  const res = await fetchWithTimeout(
    `https://en.wikipedia.org/w/api.php?${params.toString()}`,
    { headers }
  );
  if (!res.ok)
    throw new Error(`Failed to get links for "${title}": ${res.status}`);

  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) return [];

  const pageId = Object.keys(pages)[0];
  const links = pages[pageId]?.links;
  if (!links) return [];

  return links.map((l: { title: string }) => l.title);
}

export async function getPageViews(title: string): Promise<number> {
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);

  const fmt = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

  try {
    const res = await fetchWithTimeout(
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${encoded}/daily/${fmt(start)}/${fmt(end)}`,
      { headers }
    );
    if (!res.ok) return -1;

    const data = await res.json();
    const items = data.items || [];
    const total = items.reduce(
      (sum: number, item: { views: number }) => sum + item.views,
      0
    );
    return total;
  } catch {
    return -1;
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[\d+\]/g, "")
    .replace(/&#\d+;/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks whether extracted text reads like a real sentence vs. garbage
 * (CSS rules, number dumps, code fragments, etc.).
 */
function isReadableText(text: string): boolean {
  const digits = (text.match(/\d/g) || []).length;
  if (digits / text.length > 0.4) return false;

  if (/\{[^}]*[:{;][^}]*\}/.test(text)) return false;

  if (/\.mw-parser-output/.test(text)) return false;

  const words = text.split(/\s+/);
  const shortTokens = words.filter((w) => w.length <= 2).length;
  if (words.length > 5 && shortTokens / words.length > 0.6) return false;

  const alpha = (text.match(/[a-zA-Z]/g) || []).length;
  if (alpha / text.length < 0.3) return false;

  return true;
}

function hasLinkTo(html: string, toTitle: string): boolean {
  const toEncoded = toTitle.replace(/ /g, "_");
  return (
    html.includes(`/wiki/${toEncoded}`) ||
    html.includes(`/wiki/${encodeURIComponent(toEncoded)}`) ||
    new RegExp(`title="${escapeRegex(toTitle)}"`, "i").test(html)
  );
}

/**
 * Fetches the full article HTML of `fromTitle` and extracts the text block
 * that contains the hyperlink to `toTitle`. Searches paragraphs first
 * (best context), then list items, then table rows.
 */
export async function getLinkContext(
  fromTitle: string,
  toTitle: string
): Promise<string | null> {
  const params = new URLSearchParams({
    action: "parse",
    page: fromTitle,
    prop: "text",
    format: "json",
    origin: "*",
  });

  try {
    const res = await fetchWithTimeout(
      `https://en.wikipedia.org/w/api.php?${params.toString()}`,
      { headers }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const html: string | undefined = data.parse?.text?.["*"];
    if (!html) return null;

    const selectors: [RegExp, number][] = [
      [/<p[^>]*>[\s\S]*?<\/p>/gi, 30],
      [/<li[^>]*>[\s\S]*?<\/li>/gi, 25],
      [/<tr[^>]*>[\s\S]*?<\/tr>/gi, 15],
    ];

    for (const [pattern, minLen] of selectors) {
      const matches = html.match(pattern) || [];
      for (const block of matches) {
        if (hasLinkTo(block, toTitle)) {
          const text = stripHtml(block);
          if (text.length > minLen && isReadableText(text)) {
            return text.length > 400 ? text.slice(0, 397) + "..." : text;
          }
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

const BORING_PATTERNS = [
  /^List of /,
  /^Index of /,
  /^Outline of /,
  /^Category:/,
  /^Template:/,
  /^Wikipedia:/,
  /^Portal:/,
  /^File:/,
  /^Help:/,
  /^Draft:/,
  /^\d{4}$/,
  /^\d{4} in /,
  /^\d{1,2} /,
  /disambiguation/i,
  /^ISO \d/,
];

export function isBoringTitle(title: string): boolean {
  if (title.length < 4) return true;
  return BORING_PATTERNS.some((p) => p.test(title));
}

export function pickInterestingLinks(
  links: string[],
  count: number
): string[] {
  const interesting = links.filter((l) => !isBoringTitle(l));
  const shuffled = interesting.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
