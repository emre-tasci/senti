import { NextRequest, NextResponse } from "next/server";
import { getCoinDetail, getCoinPriceHistory } from "@/lib/coingecko";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = request.nextUrl;
    const days = searchParams.get("days") || "7";

    const [detail, history] = await Promise.all([
      getCoinDetail(params.id),
      getCoinPriceHistory(params.id, days),
    ]);

    return NextResponse.json({ detail, history });
  } catch (error) {
    console.error("Error fetching coin detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch coin detail" },
      { status: 500 }
    );
  }
}
