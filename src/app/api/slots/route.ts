import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/booking";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    const slots = await getAvailableSlots(date);
    logger.info("Slots fetched", { date, count: slots.length });
    return NextResponse.json({ slots });
  } catch (error) {
    logger.error("Failed to fetch slots", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
