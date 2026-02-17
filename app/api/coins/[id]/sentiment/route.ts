import { NextRequest, NextResponse } from "next/server";
import { getCoinNews } from "@/lib/news";
import { analyzeSentiment } from "@/lib/xai";
import { rateLimit } from "@/lib/rate-limit";
import { isValidCoinId, isValidSymbol, isValidNumericParam } from "@/lib/validation";

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
    const { searchParams } = request.nextUrl;
    const name = searchParams.get("name") || params.id;
    const symbol = searchParams.get("symbol") || params.id;
    const priceStr = searchParams.get("price") || "0";
    const changeStr = searchParams.get("change") || "0";

    if (searchParams.has("symbol") && !isValidSymbol(symbol)) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }

    if (
      (searchParams.has("price") && !isValidNumericParam(priceStr)) ||
      (searchParams.has("change") && !isValidNumericParam(changeStr))
    ) {
      return NextResponse.json({ error: "Invalid numeric parameter" }, { status: 400 });
    }

    const price = parseFloat(priceStr) || undefined;
    const change = parseFloat(changeStr) || undefined;

    const news = await getCoinNews(symbol);
    const sentiment = await analyzeSentiment(name, symbol, news, price, change);

    return NextResponse.json(sentiment);
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return NextResponse.json(
      { error: "Failed to analyze sentiment" },
      { status: 500 }
    );
  }
}
