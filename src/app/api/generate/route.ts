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

/**
 * Quality bar rises with each position in the chain.
 * Position 1-2: always added (building the core).
 * Position 3 (4th article): needs 70+ to continue.
 * Position 4 (5th article): needs 90+ — genuinely excellent.
 */
const QUALITY_GATES: Record<number, number> = { 3: 70, 4: 90 };

function articleQuality(summary: ArticleSummary): number {
  let score = 0;

  const len = summary.extract?.length ?? 0;
  if (len > 300) score += 35;
  else if (len > 150) score += 25;
  else if (len > 50) score += 10;

  if (summary.thumbnail || summary.originalimage) score += 25;

  if (summary.description && summary.description.length > 10) score += 15;

  if (summary.thumbnail && len > 200 && summary.description) score += 25;

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
          if (q >= 90) break;
        } catch {
          continue;
        }
      }

      if (!bestSummary) break;

      const gate = QUALITY_GATES[i];
      if (gate && bestQuality < gate) break;

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
