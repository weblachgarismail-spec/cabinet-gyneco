import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logAction } from "@/lib/log-action";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.medicalAct.deleteMany();
    await prisma.patientRecord.deleteMany();
    await prisma.appointmentComment.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.log.deleteMany();

    await logAction({ userId: session.user.id, username: session.user.name || "", action: "CLEAR", entity: "Database", details: "All data cleared" });
    logger.info("Database cleared by super admin");
    return NextResponse.json({ success: true, message: "Base de données vidée avec succès." });
  } catch (error) {
    logger.error("Failed to clear database", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
