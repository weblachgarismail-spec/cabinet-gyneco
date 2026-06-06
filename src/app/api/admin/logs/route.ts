import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const timeFrom = searchParams.get("timeFrom");
    const timeTo = searchParams.get("timeTo");
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");

    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;

    if (dateFrom || dateTo || timeFrom || timeTo) {
      const dateTimeFilters: Record<string, Date> = {};
      if (dateFrom) {
        dateTimeFilters.gte = new Date(dateFrom + (timeFrom ? `T${timeFrom}:00.000Z` : "T00:00:00.000Z"));
      }
      if (dateTo) {
        dateTimeFilters.lte = new Date(dateTo + (timeTo ? `T${timeTo}:59.000Z` : "T23:59:59.999Z"));
      }
      if (Object.keys(dateTimeFilters).length) where.createdAt = dateTimeFilters;
    }

    const logs = await prisma.log.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json(logs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() })));
  } catch (error) {
    logger.error("Failed to fetch logs", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
