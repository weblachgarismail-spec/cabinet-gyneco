import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logAction } from "@/lib/log-action";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role: string }).role;
  if (role === "DOCTOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { patientName, phone, email, city, notes, date, time, nationalId, consultationType } = await request.json();
    if (!patientName || !phone) {
      return NextResponse.json({ error: "patientName and phone are required" }, { status: 400 });
    }

    const appt = await prisma.appointment.create({
      data: {
        date: date ? new Date(date) : new Date(),
        time: time || new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        patientName,
        phone,
        email: email || null,
        city: city || null,
        notes: notes || null,
        nationalId: nationalId || null,
        consultationType: consultationType || null,
        status: "CONFIRMED",
      },
    });
    await logAction({ userId: session.user.id, username: session.user.name || "", action: "CREATE", entity: "Appointment", entityId: appt.id, details: `Walk-in: ${patientName}` });
    logger.info("Walk-in appointment created", { id: appt.id, patientName });
    return NextResponse.json({ ...appt, date: appt.date.toISOString(), createdAt: appt.createdAt.toISOString(), arrivedAt: null, remindedAt: null, postponedToDate: null }, { status: 201 });
  } catch (error) {
    logger.error("Failed to create walk-in appointment", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role: string }).role;
  if (role === "DOCTOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, status, cancelComment, postponedDate, remindedAt } = await request.json();

    if (remindedAt !== true && !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    if (status && !["PENDING", "CONFIRMED", "CANCELLED", "ARRIVED", "MISSED", "POSTPONED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (status === "CANCELLED" && cancelComment !== undefined) {
      data.cancelComment = cancelComment;
    }
    if (status === "ARRIVED") {
      data.arrivedAt = new Date().toISOString();
    }
    if (status === "POSTPONED" && postponedDate) {
      data.postponedToDate = postponedDate;
    }
    if (remindedAt === true && !data.remindedAt) {
      data.remindedAt = new Date().toISOString();
    }

    await prisma.appointment.update({ where: { id }, data });
    await logAction({ userId: session.user.id, username: session.user.name || "", action: "UPDATE", entity: "Appointment", entityId: id, details: `Status → ${status}` });
    logger.info("Appointment status updated", { id, status });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to update appointment", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role: string }).role;
  if (role === "DOCTOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await request.json();
    await prisma.appointment.delete({ where: { id } });
    await logAction({ userId: session.user.id, username: session.user.name || "", action: "DELETE", entity: "Appointment", entityId: id });
    logger.info("Appointment deleted", { id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete appointment", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
