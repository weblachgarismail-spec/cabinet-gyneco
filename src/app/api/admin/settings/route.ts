import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = await prisma.clinicConfig.findUnique({ where: { id: "default" } });
  const holidays = await prisma.holiday.findMany({ orderBy: { date: "asc" } });

  return NextResponse.json({
    config: config ?? { workStartAM: 9, workEndAM: 13, workStartPM: 15, workEndPM: 19, slotDuration: 30 },
    holidays: holidays.map((h) => ({ id: h.id, date: h.date.toISOString(), label: h.label })),
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { workStartAM, workEndAM, workStartPM, workEndPM, slotDuration } = body;

  await prisma.clinicConfig.upsert({
    where: { id: "default" },
    update: { workStartAM, workEndAM, workStartPM, workEndPM, slotDuration },
    create: { id: "default", workStartAM, workEndAM, workStartPM, workEndPM, slotDuration },
  });

  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { date, label } = body;

  const holiday = await prisma.holiday.create({
    data: { date: new Date(date + "T00:00:00.000Z"), label: label || null },
  });

  return NextResponse.json({ id: holiday.id, date: holiday.date.toISOString(), label: holiday.label });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.holiday.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
