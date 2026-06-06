import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logAction } from "@/lib/log-action";
import * as XLSX from "xlsx";

const s = (v: unknown): string => String(v ?? "");

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const name = file.name.toLowerCase();
    let imported = 0;

    if (name.endsWith(".sql")) {
      const text = await file.text();
      const lines = text.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("INSERT INTO")) continue;
        try {
          await prisma.$executeRawUnsafe(trimmed);
          imported++;
        } catch (err) {
          logger.warn("SQL import row skipped", { error: err });
        }
      }
    } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const buf = Buffer.from(await file.arrayBuffer());
      const wb = XLSX.read(buf, { type: "buffer" });

      // ── Patients ──
      if (wb.SheetNames.includes("Patients")) {
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets["Patients"]);
        for (const row of rows) {
          const id = s(row.ID);
          const phone = s(row.Phone);
          const patientName = s(row.Name);
          if (!id || !phone || !patientName) continue;
          const existing = await prisma.patientRecord.findUnique({ where: { id } }).catch(() => null);
          if (existing) continue;
          const byPhone = await prisma.patientRecord.findFirst({ where: { phone } });
          if (byPhone) continue;
          await prisma.patientRecord.create({
            data: {
              id,
              patientName,
              phone,
              nationalId: s(row["National ID"]) || null,
              address: s(row.Address) || null,
              email: s(row.Email) || null,
              city: s(row.City) || null,
              dateOfBirth: row["Date of Birth"] ? new Date(s(row["Date of Birth"])) : null,
              notes: s(row.Notes) || null,
              nextAppointmentAt: row["Next Appointment"] ? new Date(s(row["Next Appointment"])) : null,
              nextAppointmentNotes: s(row["Next Appointment Notes"]) || null,
              deletedAt: row.DeletedAt ? new Date(s(row.DeletedAt)) : null,
              createdAt: row.CreatedAt ? new Date(s(row.CreatedAt)) : new Date(),
              updatedAt: row.UpdatedAt ? new Date(s(row.UpdatedAt)) : new Date(),
            },
          });
          imported++;
        }
      }

      // ── Appointments ──
      if (wb.SheetNames.includes("Appointments")) {
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets["Appointments"]);
        for (const row of rows) {
          const id = s(row.ID);
          const phone = s(row.Phone);
          const patientName = s(row.Patient);
          if (!id || !phone || !patientName) continue;
          const existing = await prisma.appointment.findUnique({ where: { id } }).catch(() => null);
          if (existing) continue;
          const byKey = await prisma.appointment.findFirst({ where: { phone, date: new Date(s(row.Date)) } });
          if (byKey) continue;
          await prisma.appointment.create({
            data: {
              id,
              date: new Date(s(row.Date)),
              time: s(row.Time) || "00:00",
              patientName,
              phone,
              email: s(row.Email) || null,
              city: s(row.City) || null,
              notes: s(row.Notes) || null,
              nationalId: s(row["National ID"]) || null,
              consultationType: s(row["Consultation Type"]) || null,
              status: s(row.Status) || "PENDING",
              cancelComment: s(row["Cancel Comment"]) || null,
              arrivedAt: row.ArrivedAt ? new Date(s(row.ArrivedAt)) : null,
              remindedAt: row.RemindedAt ? new Date(s(row.RemindedAt)) : null,
              postponedToDate: s(row.PostponedTo) || null,
              createdAt: row.CreatedAt ? new Date(s(row.CreatedAt)) : new Date(),
            },
          });
          imported++;
        }
      }

      // ── Medical Acts ──
      if (wb.SheetNames.includes("Medical Acts")) {
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets["Medical Acts"]);
        for (const row of rows) {
          const id = s(row.ID);
          const patientRecordId = s(row["Patient ID"]);
          const actType = s(row.Type);
          if (!id || !patientRecordId || !actType) continue;
          const existing = await prisma.medicalAct.findUnique({ where: { id } }).catch(() => null);
          if (existing) continue;
          const patient = await prisma.patientRecord.findUnique({ where: { id: patientRecordId } }).catch(() => null);
          if (!patient) continue;
          await prisma.medicalAct.create({
            data: {
              id,
              patientRecordId,
              actType,
              actDate: row.Date ? new Date(s(row.Date)) : new Date(),
              description: s(row.Description) || null,
              doctorNotes: s(row["Doctor Notes"]) || null,
              prescribedMeds: s(row.Prescribed) || null,
              createdAt: row.CreatedAt ? new Date(s(row.CreatedAt)) : new Date(),
            },
          });
          imported++;
        }
      }

      // ── Logs ──
      if (wb.SheetNames.includes("Logs")) {
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets["Logs"]);
        for (const row of rows) {
          const id = s(row.ID);
          if (!id) continue;
          const existing = await prisma.log.findUnique({ where: { id } }).catch(() => null);
          if (existing) continue;
          await prisma.log.create({
            data: {
              id,
              userId: s(row["User ID"]),
              username: s(row.Username),
              action: s(row.Action),
              entity: s(row.Entity),
              entityId: s(row["Entity ID"]) || null,
              details: s(row.Details) || null,
              createdAt: row.CreatedAt ? new Date(s(row.CreatedAt)) : new Date(),
            },
          });
          imported++;
        }
      }

      // ── Comments ──
      if (wb.SheetNames.includes("Comments")) {
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets["Comments"]);
        for (const row of rows) {
          const id = s(row.ID);
          const appointmentId = s(row["Appointment ID"]);
          if (!id || !appointmentId) continue;
          const existing = await prisma.appointmentComment.findUnique({ where: { id } }).catch(() => null);
          if (existing) continue;
          const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } }).catch(() => null);
          if (!appt) continue;
          await prisma.appointmentComment.create({
            data: {
              id,
              appointmentId,
              userId: s(row["User ID"]),
              username: s(row.Username),
              comment: s(row.Comment),
              createdAt: row.CreatedAt ? new Date(s(row.CreatedAt)) : new Date(),
            },
          });
          imported++;
        }
      }

      // ── Admins ──
      if (wb.SheetNames.includes("Admins")) {
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets["Admins"]);
        for (const row of rows) {
          const id = s(row.ID);
          const username = s(row.Username);
          if (!id || !username) continue;
          const existing = await prisma.admin.findUnique({ where: { id } }).catch(() => null);
          if (existing) continue;
          const byUser = await prisma.admin.findUnique({ where: { username } }).catch(() => null);
          if (byUser) continue;
          await prisma.admin.create({
            data: {
              id,
              username,
              password: "IMPORTED_PLEASE_RESET",
              displayName: s(row["Display Name"]) || null,
              role: s(row.Role) || "SECRETARY",
              themeColor: s(row["Theme Color"]) || null,
              createdAt: row.CreatedAt ? new Date(s(row.CreatedAt)) : new Date(),
            },
          });
          imported++;
        }
      }
    } else {
      return NextResponse.json({ error: "Unsupported format. Use .xlsx, .xls, or .sql" }, { status: 400 });
    }

    await logAction({ userId: session.user.id, username: session.user.name || "", action: "IMPORT", entity: "Database", details: `Imported ${imported} rows from ${file.name}` });
    logger.info("Data imported", { file: file.name, rows: imported });
    return NextResponse.json({ message: `Import terminé : ${imported} lignes importées.` });
  } catch (error) {
    logger.error("Import failed", { error });
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
