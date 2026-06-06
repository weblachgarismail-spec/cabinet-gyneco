import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logAction } from "@/lib/log-action";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    const { actType, actDate, description, doctorNotes, prescribedMeds } = body;

    if (!actType || !actDate) {
      return NextResponse.json({ error: "actType and actDate are required" }, { status: 400 });
    }

    const patient = await prisma.patientRecord.findUnique({ where: { id } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const act = await prisma.medicalAct.create({
      data: {
        patientRecordId: id,
        actType,
        actDate: new Date(actDate),
        description,
        doctorNotes,
        prescribedMeds,
      },
    });
    await logAction({ userId: session.user.id, username: session.user.name || "", action: "CREATE", entity: "MedicalAct", entityId: act.id, details: `${actType} for patient ${id}` });
    logger.info("Medical act created", { id: act.id, patientId: id });
    return NextResponse.json(act, { status: 201 });
  } catch (error) {
    logger.error("Failed to create medical act", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
