import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PatientsTable } from "./table";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminPatientsPage({ params }: Props) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string })?.role || "";
  const t = await getTranslations({ locale, namespace: "admin" });

  const rawPatients = await prisma.patientRecord.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { medicalActs: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const patients = rawPatients.map((p) => ({
    ...p,
    dateOfBirth: p.dateOfBirth?.toISOString() ?? null,
    nextAppointmentAt: p.nextAppointmentAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    nationalId: p.nationalId ?? null,
    address: p.address ?? null,
    deletedAt: p.deletedAt?.toISOString() ?? null,
  }));

  const rawTrashed = await prisma.patientRecord.findMany({
    where: { deletedAt: { not: null } },
    include: { _count: { select: { medicalActs: true } } },
    orderBy: { deletedAt: "desc" },
  });
  const trashedPatients = rawTrashed.map((p) => ({
    ...p,
    dateOfBirth: p.dateOfBirth?.toISOString() ?? null,
    nextAppointmentAt: p.nextAppointmentAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    nationalId: p.nationalId ?? null,
    address: p.address ?? null,
    deletedAt: p.deletedAt?.toISOString() ?? null,
  }));

  const rawAppointments = await prisma.appointment.findMany({
    where: { status: { in: ["CONFIRMED", "ARRIVED"] } },
    orderBy: { date: "asc" },
  });
  const availableAppointmentsData = rawAppointments.map((a) => ({
    ...a,
    date: a.date.toISOString(),
    createdAt: a.createdAt.toISOString(),
  }));

  const usedPhones = await prisma.patientRecord.findMany({
    where: { deletedAt: null },
    select: { phone: true },
  });
  const usedPhoneSet = new Set(usedPhones.map((p) => p.phone));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
          {t("patients_title")}
        </h1>
      </div>
      <PatientsTable patients={patients} trashedPatients={trashedPatients} confirmedAppointments={availableAppointmentsData} usedPhones={usedPhoneSet} locale={locale} userRole={userRole} />
    </div>
  );
}
