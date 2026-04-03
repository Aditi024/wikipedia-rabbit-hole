import { NextResponse } from "next/server";
import {
  getRandomArticle,
  getArticleSummary,
  getArticleLinks,
  getLinkContext,
  pickInterestingLinks,
  ArticleSummary,
} from "@/lib/wikipedia";

export type { RabbitHoleArticle } from "@/lib/types";
import type { RabbitHoleArticle } from "@/lib/types";

function toArticle(summary: ArticleSummary): RabbitHoleArticle {
  return {
    title: summary.title,
    description: summary.description,
    extract: summary.extract,
    thumbnail: summary.thumbnail?.source || summary.originalimage?.source,
    url: summary.content_urls.desktop.page,
    monthlyViews: -1,
  };
}

const MIN_CHAIN = 3;
const MAX_CHAIN = 5;
const MAX_RETRIES = 3;
const QUALITY_THRESHOLD = 80;

function articleQuality(summary: ArticleSummary): number {
  let score = 0;
  if (summary.extract && summary.extract.length > 100) score += 40;
  else if (summary.extract && summary.extract.length > 50) score += 20;
  if (summary.thumbnail || summary.originalimage) score += 30;
  if (summary.description && summary.description.length > 10) score += 20;
  if (summary.extract && summary.extract.length > 200) score += 10;
  return score;
}

export async function GET() {
  try {
    const chain: RabbitHoleArticle[] = [];
    const seenTitles = new Set<string>();

    let startArticle: ArticleSummary | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const candidate = await getRandomArticle();
      if (candidate.thumbnail && candidate.extract.length > 50) {
        startArticle = candidate;
        break;
      }
    }

    if (!startArticle) {
      startArticle = await getRandomArticle();
    }

    chain.push(toArticle(startArticle));
    seenTitles.add(startArticle.title);

    let currentTitle = startArticle.title;

    for (let i = 1; i < MAX_CHAIN; i++) {
      const links = await getArticleLinks(currentTitle);
      const candidates = pickInterestingLinks(links, 20).filter(
        (l) => !seenTitles.has(l)
      );

      if (candidates.length === 0) break;

      let bestSummary: ArticleSummary | null = null;
      let bestQuality = 0;

      for (const candidate of candidates.slice(0, 6)) {
        try {
          const summary = await getArticleSummary(candidate);
          const q = articleQuality(summary);
          if (q > bestQuality) {
            bestSummary = summary;
            bestQuality = q;
          }
          if (q >= QUALITY_THRESHOLD) break;
        } catch {
          continue;
        }
      }

      if (!bestSummary) break;

      if (i >= MIN_CHAIN && bestQuality < QUALITY_THRESHOLD) break;

      chain.push(toArticle(bestSummary));
      seenTitles.add(bestSummary.title);
      currentTitle = bestSummary.title;
    }

    const linkContexts = await Promise.all(
      chain.slice(0, -1).map((article, i) =>
        getLinkContext(article.title, chain[i + 1].title).catch(() => null)
      )
    );

    return NextResponse.json({ articles: chain, linkContexts });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate rabbit hole" },
      { status: 500 }
    );
  }
}
