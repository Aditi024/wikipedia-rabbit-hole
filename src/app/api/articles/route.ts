import { NextRequest, NextResponse } from "next/server";
import { getArticleSummary, ArticleSummary } from "@/lib/wikipedia";
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

export async function POST(request: NextRequest) {
  try {
    const { titles } = await request.json();

    if (!Array.isArray(titles) || titles.length === 0 || titles.length > 10) {
      return NextResponse.json(
        { error: "Invalid titles array" },
        { status: 400 }
      );
    }

    const articles: RabbitHoleArticle[] = [];

    for (const title of titles) {
      try {
        const summary = await getArticleSummary(title);
        articles.push(toArticle(summary));
      } catch {
        articles.push({
          title,
          extract: "",
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          monthlyViews: -1,
        });
      }
    }

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Articles fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
