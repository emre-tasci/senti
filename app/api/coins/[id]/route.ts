import { NextRequest, NextResponse } from "next/server";
import { getCoinDetail, getCoinPriceHistory } from "@/lib/coingecko";
import { rateLimit } from "@/lib/rate-limit";
import { isValidCoinId, isValidDaysParam } from "@/lib/validation";

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
    const days = searchParams.get("days") || "7";

    if (!isValidDaysParam(days)) {
      return NextResponse.json({ error: "Invalid days parameter" }, { status: 400 });
    }

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
