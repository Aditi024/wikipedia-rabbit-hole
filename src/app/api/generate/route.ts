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
 * After the minimum chain length, each additional article must pass
 * both a quality check AND a probability roll. This ensures genuine
 * variety in chain length (3, 4, or 5).
 *
 * Position 3 (4th article): 50% chance of continuing
 * Position 4 (5th article): 25% chance of continuing
 */
const CONTINUE_PROBABILITY: Record<number, number> = { 3: 0.5, 4: 0.25 };

function isQualityArticle(summary: ArticleSummary): boolean {
  const len = summary.extract?.length ?? 0;
  const hasThumbnail = !!(summary.thumbnail || summary.originalimage);
  const hasDescription = !!(summary.description && summary.description.length > 10);
  return len > 150 && hasThumbnail && hasDescription;
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

      const continueProbability = CONTINUE_PROBABILITY[i];
      if (continueProbability !== undefined && Math.random() > continueProbability) break;

      let bestSummary: ArticleSummary | null = null;

      for (const candidate of candidates.slice(0, 5)) {
        try {
          const summary = await getArticleSummary(candidate);
          if (isQualityArticle(summary)) {
            bestSummary = summary;
            break;
          }
          if (!bestSummary && summary.extract && summary.extract.length > 50) {
            bestSummary = summary;
          }
        } catch {
          continue;
        }
      }

      if (!bestSummary) break;

      if (continueProbability !== undefined && !isQualityArticle(bestSummary)) break;

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
