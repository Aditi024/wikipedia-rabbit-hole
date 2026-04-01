const USER_AGENT = "RabbitHoleApp/1.0 (rabbit-hole-explorer)";

const headers: HeadersInit = {
  "User-Agent": USER_AGENT,
  Accept: "application/json",
};

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
  const res = await fetch(
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
  const res = await fetch(
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

  const res = await fetch(
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
    const res = await fetch(
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
