import { NextRequest, NextResponse } from "next/server";
import { getCategoryCoins } from "@/lib/coingecko";
import { getCategoryDef } from "@/lib/categories";
import { analyzeCategorySentiment } from "@/lib/xai";
import { isValidCategoryId } from "@/lib/validation";
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

  const categoryDef = getCategoryDef(id);
  if (!categoryDef) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  try {
    const coins = await getCategoryCoins(id, 1, 10);

    const topCoins = coins.map((c) => ({
      name: c.name,
      symbol: c.symbol,
      change: c.price_change_percentage_24h ?? 0,
    }));

    const sentiment = await analyzeCategorySentiment(
      categoryDef.name_en,
      topCoins
    );

    return NextResponse.json(sentiment);
  } catch (error) {
    console.error("Error fetching category sentiment:", error);
    return NextResponse.json(
      { error: "Failed to fetch category sentiment" },
      { status: 500 }
    );
  }
}
