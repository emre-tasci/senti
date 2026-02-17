import { NextRequest, NextResponse } from "next/server";
import { getCategoryCoins } from "@/lib/coingecko";
import { isValidCategoryId, isValidPageParam } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (rateLimit(request).limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = params;

  if (!isValidCategoryId(id)) {
    return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
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

    const coins = await getCategoryCoins(id, page, perPage);
    return NextResponse.json(coins);
  } catch (error) {
    console.error("Error fetching category coins:", error);
    return NextResponse.json(
      { error: "Failed to fetch category coins" },
      { status: 500 }
    );
  }
}
