import { NextResponse } from "next/server";
import { searchStocks } from "@/lib/actions/finnhub.actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  try {
    const results = await searchStocks(query);
    return NextResponse.json(results);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to fetch stocks" }, { status: 500 });
  }
}