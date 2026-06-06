import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminAppointmentsTable } from "./table";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminAppointmentsPage({ params }: Props) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string })?.role || "";
  if (userRole === "SUPER_ADMIN") redirect(`/${locale}/admin/profile`);

  const rawAppointments = await prisma.appointment.findMany({
    orderBy: { date: "desc" },
    include: { comments: { orderBy: { createdAt: "desc" } } },
  });
  const appointments = rawAppointments.map((a) => ({
    ...a,
    date: a.date.toISOString(),
    createdAt: a.createdAt.toISOString(),
    arrivedAt: a.arrivedAt?.toISOString() ?? null,
    remindedAt: a.remindedAt?.toISOString() ?? null,
    postponedToDate: a.postponedToDate ?? null,
    nationalId: a.nationalId ?? null,
    consultationType: a.consultationType ?? null,
    comments: a.comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
  }));

  return (
    <div>
      <AdminAppointmentsTable appointments={appointments} locale={locale} now={new Date().toISOString()} userRole={userRole} />
    </div>
  );
}
