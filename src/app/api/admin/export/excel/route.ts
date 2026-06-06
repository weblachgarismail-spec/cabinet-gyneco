import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import * as XLSX from "xlsx";

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

    const wb = XLSX.utils.book_new();

    const apptData = appointments.map((a) => ({
      ID: a.id,
      Date: a.date.toISOString().slice(0, 10),
      Time: a.time,
      Patient: a.patientName,
      Phone: a.phone,
      Email: a.email || "",
      City: a.city || "",
      Notes: a.notes || "",
      "National ID": a.nationalId || "",
      "Consultation Type": a.consultationType || "",
      Status: a.status,
      "Cancel Comment": a.cancelComment || "",
      ArrivedAt: a.arrivedAt ? a.arrivedAt.toISOString() : "",
      RemindedAt: a.remindedAt ? a.remindedAt.toISOString() : "",
      PostponedTo: a.postponedToDate || "",
      CreatedAt: a.createdAt.toISOString(),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(apptData), "Appointments");

    const patData = patients.map((p) => ({
      ID: p.id,
      Name: p.patientName,
      Phone: p.phone,
      "National ID": p.nationalId || "",
      Address: p.address || "",
      Email: p.email || "",
      City: p.city || "",
      "Date of Birth": p.dateOfBirth ? p.dateOfBirth.toISOString().slice(0, 10) : "",
      Notes: p.notes || "",
      "Next Appointment": p.nextAppointmentAt ? p.nextAppointmentAt.toISOString() : "",
      "Next Appointment Notes": p.nextAppointmentNotes || "",
      DeletedAt: p.deletedAt ? p.deletedAt.toISOString() : "",
      CreatedAt: p.createdAt.toISOString(),
      UpdatedAt: p.updatedAt.toISOString(),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(patData), "Patients");

    const actData = acts.map((a) => ({
      ID: a.id,
      "Patient ID": a.patientRecordId,
      Type: a.actType,
      Date: a.actDate.toISOString().slice(0, 10),
      Description: a.description || "",
      "Doctor Notes": a.doctorNotes || "",
      Prescribed: a.prescribedMeds || "",
      CreatedAt: a.createdAt.toISOString(),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(actData), "Medical Acts");

    const logData = logs.map((l) => ({
      ID: l.id,
      "User ID": l.userId,
      Username: l.username,
      Action: l.action,
      Entity: l.entity,
      "Entity ID": l.entityId || "",
      Details: l.details || "",
      CreatedAt: l.createdAt.toISOString(),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logData), "Logs");

    const commentData = comments.map((c) => ({
      ID: c.id,
      "Appointment ID": c.appointmentId,
      "User ID": c.userId,
      Username: c.username,
      Comment: c.comment,
      CreatedAt: c.createdAt.toISOString(),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(commentData), "Comments");

    const adminData = admins.map((a) => ({
      ID: a.id,
      Username: a.username,
      "Display Name": a.displayName || "",
      Role: a.role,
      "Theme Color": a.themeColor || "",
      CreatedAt: a.createdAt.toISOString(),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(adminData), "Admins");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    logger.info("Database exported to Excel");

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="cabinet-export.xlsx"',
      },
    });
  } catch (error) {
    logger.error("Excel export failed", { error });
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
