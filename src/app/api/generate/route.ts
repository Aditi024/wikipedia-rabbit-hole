import { NextResponse } from "next/server";
import {
  getRandomArticle,
  getArticleSummary,
  getArticleLinks,
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

const CHAIN_LENGTH = 5;
const MAX_RETRIES = 3;

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

    for (let i = 1; i < CHAIN_LENGTH; i++) {
      const links = await getArticleLinks(currentTitle);
      const candidates = pickInterestingLinks(links, 20).filter(
        (l) => !seenTitles.has(l)
      );

      if (candidates.length === 0) break;

      let found = false;
      for (const candidate of candidates.slice(0, 5)) {
        try {
          const summary = await getArticleSummary(candidate);
          if (summary.extract && summary.extract.length > 30) {
            chain.push(toArticle(summary));
            seenTitles.add(summary.title);
            currentTitle = summary.title;
            found = true;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!found) {
        const fallback = candidates[0];
        try {
          const summary = await getArticleSummary(fallback);
          chain.push(toArticle(summary));
          seenTitles.add(summary.title);
          currentTitle = summary.title;
        } catch {
          break;
        }
      }
    }

    return NextResponse.json({ articles: chain });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate rabbit hole" },
      { status: 500 }
    );
  }
}
