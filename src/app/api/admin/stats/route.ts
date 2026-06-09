import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [
      totalPatients,
      totalAppointments,
      todayAppointments,
      weekAppointments,
      statusCounts,
      actTypeCounts,
      recentPatients,
      recentAppointments,
    ] = await Promise.all([
      prisma.patientRecord.count({ where: { deletedAt: null } }),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: { date: { gte: new Date(new Date().toDateString()) } },
      }),
      prisma.appointment.count({
        where: {
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.medicalAct.groupBy({
        by: ["actType"],
        _count: true,
        orderBy: { _count: { actType: "desc" } },
        take: 5,
      }),
      prisma.patientRecord.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, patientName: true, phone: true, createdAt: true },
      }),
      prisma.appointment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, patientName: true, date: true, time: true, status: true, createdAt: true },
      }),
    ]);

    return NextResponse.json({
      totalPatients,
      totalAppointments,
      todayAppointments,
      weekAppointments,
      statusCounts: statusCounts.map((s) => ({ status: s.status, count: s._count })),
      topActTypes: actTypeCounts.map((a) => ({ actType: a.actType, count: a._count })),
      recentPatients: recentPatients.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
      recentAppointments: recentAppointments.map((a) => ({ ...a, date: a.date.toISOString(), createdAt: a.createdAt.toISOString() })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
