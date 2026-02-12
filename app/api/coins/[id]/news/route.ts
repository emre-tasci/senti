import { NextRequest, NextResponse } from "next/server";
import { getCoinNews } from "@/lib/news";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use symbol from query param if available, otherwise fall back to id
    const symbol = request.nextUrl.searchParams.get("symbol") || params.id;
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
