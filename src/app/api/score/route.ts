import { NextRequest, NextResponse } from "next/server";
import { getPageViews } from "@/lib/wikipedia";
import { getGemInfo, getTotalScore } from "@/lib/scoring";

const MAX_TITLES = 10;

export async function POST(request: NextRequest) {
  try {
    const { titles } = await request.json();

    if (!titles || !Array.isArray(titles) || titles.length > MAX_TITLES) {
      return NextResponse.json(
        { error: `titles must be an array of 1-${MAX_TITLES} items` },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      titles.map(async (title: string) => {
        const views = await getPageViews(title);
        const gem = getGemInfo(views);
        return {
          title,
          monthlyViews: views,
          rarity: gem.rarity,
          points: gem.points,
          color: gem.color,
          glow: gem.glow,
        };
      })
    );

    const totalScore = getTotalScore(
      results.map((r) => ({ monthlyViews: r.monthlyViews }))
    );

    return NextResponse.json({ scores: results, totalScore });
  } catch (error) {
    console.error("Scoring error:", error);
    return NextResponse.json(
      { error: "Failed to score rabbit hole" },
      { status: 500 }
    );
  }
}
