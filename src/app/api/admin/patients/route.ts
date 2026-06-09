import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logAction } from "@/lib/log-action";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const trashed = searchParams.get("trashed") === "true";

    const patients = await prisma.patientRecord.findMany({
      where: trashed ? { deletedAt: { not: null } } : { deletedAt: null },
      include: { _count: { select: { medicalActs: true } } },
      orderBy: trashed ? { deletedAt: "desc" } : { updatedAt: "desc" },
    });
    return NextResponse.json(patients);
  } catch (error) {
    logger.error("Failed to fetch patients", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role: string }).role;
  if (role === "DOCTOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { patientName, phone, email, city, force } = body;
    if (!patientName || !phone) {
      return NextResponse.json({ error: "patientName and phone are required" }, { status: 400 });
    }

    if (!force) {
      const existing = await prisma.patientRecord.findFirst({
        where: { phone, deletedAt: null },
        select: { id: true, patientName: true, phone: true },
      });
      if (existing) {
        return NextResponse.json({ error: "DUPLICATE_PHONE", duplicate: existing }, { status: 409 });
      }
    }

    const patient = await prisma.patientRecord.create({
      data: { patientName, phone, email, city },
    });
    await logAction({ userId: session.user.id, username: session.user.name || "", action: "CREATE", entity: "PatientRecord", entityId: patient.id, details: `Created ${patientName}` });
    logger.info("Patient record created", { id: patient.id });
    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    logger.error("Failed to create patient record", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
