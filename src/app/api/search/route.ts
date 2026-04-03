import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/lib/wikipedia";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchArticles(q);
  return NextResponse.json({ results });
}
