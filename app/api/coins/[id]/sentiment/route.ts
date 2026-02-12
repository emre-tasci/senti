import { NextRequest, NextResponse } from "next/server";
import { getCoinNews } from "@/lib/news";
import { analyzeSentiment } from "@/lib/xai";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = request.nextUrl;
    const name = searchParams.get("name") || params.id;
    const symbol = searchParams.get("symbol") || params.id;
    const price = parseFloat(searchParams.get("price") || "0") || undefined;
    const change = parseFloat(searchParams.get("change") || "0") || undefined;

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
