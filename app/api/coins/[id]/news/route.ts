import { NextRequest, NextResponse } from "next/server";
import { getCoinNews } from "@/lib/news";
import { rateLimit } from "@/lib/rate-limit";
import { isValidCoinId, isValidSymbol } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (rateLimit(request).limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isValidCoinId(params.id)) {
    return NextResponse.json({ error: "Invalid coin ID" }, { status: 400 });
  }

  try {
    const symbol = request.nextUrl.searchParams.get("symbol") || params.id;

    if (request.nextUrl.searchParams.has("symbol") && !isValidSymbol(symbol)) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }

    const news = await getCoinNews(symbol);
    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
