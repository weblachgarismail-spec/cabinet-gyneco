import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logAction } from "@/lib/log-action";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as { role: string }).role !== "DOCTOR" && (session.user as { role: string }).role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { comment } = await request.json();
    if (!comment?.trim()) return NextResponse.json({ error: "Comment required" }, { status: 400 });

    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

    const created = await prisma.appointmentComment.create({
      data: { appointmentId: id, userId: session.user.id, username: session.user.name || "", comment: comment.trim() },
    });

    await logAction({ userId: session.user.id, username: session.user.name || "", action: "CREATE", entity: "AppointmentComment", entityId: created.id, details: `Comment on appointment ${id}` });
    logger.info("Comment added to appointment", { appointmentId: id });
    return NextResponse.json({ ...created, createdAt: created.createdAt.toISOString() });
  } catch (error) {
    logger.error("Failed to add comment", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
