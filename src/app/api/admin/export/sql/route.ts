import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const esc = (v: unknown): string => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
};

const toISO = (d: Date | null | undefined) => (d ? d.toISOString() : null);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [appointments, patients, acts, logs, comments, admins] = await Promise.all([
      prisma.appointment.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.patientRecord.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.medicalAct.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.log.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.appointmentComment.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.admin.findMany({ orderBy: { createdAt: "asc" } }),
    ]);

    const lines: string[] = [];
    lines.push("-- Cabinet Gynécologique - Export SQL");
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push("");

    // Admins
    for (const a of admins) {
      lines.push(
        `INSERT INTO Admin (id, username, password, displayName, role, themeColor, createdAt) ` +
        `VALUES (${esc(a.id)}, ${esc(a.username)}, ${esc(a.password)}, ${esc(a.displayName)}, ${esc(a.role)}, ${esc(a.themeColor)}, ${esc(toISO(a.createdAt))});`
      );
    }
    if (admins.length > 0) lines.push("");

    // Appointments
    for (const a of appointments) {
      lines.push(
        `INSERT INTO Appointment (id, date, time, patientName, phone, email, city, notes, nationalId, consultationType, status, cancelComment, arrivedAt, remindedAt, postponedToDate, createdAt) ` +
        `VALUES (${esc(a.id)}, ${esc(toISO(a.date))}, ${esc(a.time)}, ${esc(a.patientName)}, ${esc(a.phone)}, ` +
        `${esc(a.email)}, ${esc(a.city)}, ${esc(a.notes)}, ${esc(a.nationalId)}, ${esc(a.consultationType)}, ${esc(a.status)}, ${esc(a.cancelComment)}, ` +
        `${esc(toISO(a.arrivedAt))}, ${esc(toISO(a.remindedAt))}, ${esc(a.postponedToDate)}, ${esc(toISO(a.createdAt))});`
      );
    }
    if (appointments.length > 0) lines.push("");

    // PatientRecords
    for (const p of patients) {
      lines.push(
        `INSERT INTO PatientRecord (id, patientName, phone, nationalId, address, email, city, dateOfBirth, notes, ` +
        `nextAppointmentAt, nextAppointmentNotes, deletedAt, createdAt, updatedAt) ` +
        `VALUES (${esc(p.id)}, ${esc(p.patientName)}, ${esc(p.phone)}, ${esc(p.nationalId)}, ${esc(p.address)}, ` +
        `${esc(p.email)}, ${esc(p.city)}, ${esc(toISO(p.dateOfBirth))}, ${esc(p.notes)}, ` +
        `${esc(toISO(p.nextAppointmentAt))}, ${esc(p.nextAppointmentNotes)}, ${esc(toISO(p.deletedAt))}, ` +
        `${esc(toISO(p.createdAt))}, ${esc(toISO(p.updatedAt))});`
      );
    }
    if (patients.length > 0) lines.push("");

    // MedicalActs
    for (const a of acts) {
      lines.push(
        `INSERT INTO MedicalAct (id, patientRecordId, actType, actDate, description, doctorNotes, prescribedMeds, createdAt) ` +
        `VALUES (${esc(a.id)}, ${esc(a.patientRecordId)}, ${esc(a.actType)}, ${esc(toISO(a.actDate))}, ${esc(a.description)}, ` +
        `${esc(a.doctorNotes)}, ${esc(a.prescribedMeds)}, ${esc(toISO(a.createdAt))});`
      );
    }
    if (acts.length > 0) lines.push("");

    // AppointmentComments
    for (const c of comments) {
      lines.push(
        `INSERT INTO AppointmentComment (id, appointmentId, userId, username, comment, createdAt) ` +
        `VALUES (${esc(c.id)}, ${esc(c.appointmentId)}, ${esc(c.userId)}, ${esc(c.username)}, ${esc(c.comment)}, ${esc(toISO(c.createdAt))});`
      );
    }
    if (comments.length > 0) lines.push("");

    // Logs
    for (const l of logs) {
      lines.push(
        `INSERT INTO Log (id, userId, username, action, entity, entityId, details, createdAt) ` +
        `VALUES (${esc(l.id)}, ${esc(l.userId)}, ${esc(l.username)}, ${esc(l.action)}, ${esc(l.entity)}, ${esc(l.entityId)}, ${esc(l.details)}, ${esc(toISO(l.createdAt))});`
      );
    }

    const sql = lines.join("\n");
    logger.info("Database exported to SQL");

    return new NextResponse(sql, {
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": 'attachment; filename="cabinet-export.sql"',
      },
    });
  } catch (error) {
    logger.error("SQL export failed", { error });
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
