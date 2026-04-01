import { NextRequest, NextResponse } from "next/server";
import { getPageViews } from "@/lib/wikipedia";
import { getGemInfo, getTotalScore } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  try {
    const { titles } = await request.json();

    if (!titles || !Array.isArray(titles)) {
      return NextResponse.json(
        { error: "titles array is required" },
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
