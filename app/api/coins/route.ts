import { NextRequest, NextResponse } from "next/server";
import { getCoins } from "@/lib/coingecko";
import { rateLimit } from "@/lib/rate-limit";
import { isValidPageParam } from "@/lib/validation";

export async function GET(request: NextRequest) {
  if (rateLimit(request).limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const pageStr = searchParams.get("page") || "1";
    const perPageStr = searchParams.get("per_page") || "50";

    if (!isValidPageParam(pageStr) || !isValidPageParam(perPageStr)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const page = parseInt(pageStr, 10);
    const perPage = Math.min(parseInt(perPageStr, 10), 100);

    const coins = await getCoins(page, perPage);
    return NextResponse.json(coins);
  } catch (error) {
    console.error("Error fetching coins:", error);
    return NextResponse.json(
      { error: "Failed to fetch coins" },
      { status: 500 }
    );
  }
}
