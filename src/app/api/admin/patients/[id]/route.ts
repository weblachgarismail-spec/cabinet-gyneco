import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logAction } from "@/lib/log-action";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const patient = await prisma.patientRecord.findUnique({
      where: { id },
      include: { medicalActs: { orderBy: { actDate: "desc" } } },
    });
    if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(patient);
  } catch (error) {
    logger.error("Failed to fetch patient", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { patientName, phone, nationalId, address, email, city, dateOfBirth, notes, nextAppointmentAt, nextAppointmentNotes } = body;

    const data: Record<string, unknown> = {};
    if (patientName !== undefined) data.patientName = patientName;
    if (phone !== undefined) data.phone = phone;
    if (nationalId !== undefined) data.nationalId = nationalId || null;
    if (address !== undefined) data.address = address || null;
    if (email !== undefined) data.email = email;
    if (city !== undefined) data.city = city;
    if (dateOfBirth !== undefined) data.dateOfBirth = new Date(dateOfBirth);
    if (notes !== undefined) data.notes = notes;
    if (nextAppointmentAt !== undefined) data.nextAppointmentAt = nextAppointmentAt ? new Date(nextAppointmentAt) : null;
    if (nextAppointmentNotes !== undefined) data.nextAppointmentNotes = nextAppointmentNotes;

    const patient = await prisma.patientRecord.update({ where: { id }, data });
    await logAction({ userId: session.user.id, username: session.user.name || "", action: "UPDATE", entity: "PatientRecord", entityId: id });
    logger.info("Patient record updated", { id });
    return NextResponse.json(patient);
  } catch (error) {
    logger.error("Failed to update patient", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role: string }).role;
  if (role === "DOCTOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    await prisma.patientRecord.update({ where: { id }, data: { deletedAt: new Date() } });
    await logAction({ userId: session.user.id, username: session.user.name || "", action: "DELETE", entity: "PatientRecord", entityId: id });
    logger.info("Patient record soft-deleted", { id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete patient", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
