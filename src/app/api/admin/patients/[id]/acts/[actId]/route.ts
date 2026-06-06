import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logAction } from "@/lib/log-action";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; actId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, actId } = await params;
    const act = await prisma.medicalAct.findFirst({ where: { id: actId, patientRecordId: id } });
    if (!act) return NextResponse.json({ error: "Medical act not found" }, { status: 404 });

    await prisma.medicalAct.delete({ where: { id: actId } });
    await logAction({ userId: session.user.id, username: session.user.name || "", action: "DELETE", entity: "MedicalAct", entityId: actId });
    logger.info("Medical act deleted", { id: actId, patientId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete medical act", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
