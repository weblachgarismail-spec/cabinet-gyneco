import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logAction } from "@/lib/log-action";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role: string }).role;
  if (role === "DOCTOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const patient = await prisma.patientRecord.update({ where: { id }, data: { deletedAt: null } });
    await logAction({ userId: session.user.id, username: session.user.name || "", action: "UPDATE", entity: "PatientRecord", entityId: id, details: "Restored" });
    logger.info("Patient record restored", { id });
    return NextResponse.json(patient);
  } catch (error) {
    logger.error("Failed to restore patient", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
