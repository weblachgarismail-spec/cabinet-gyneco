import { prisma } from "./prisma";

const WORK_START = 9;
const WORK_END = 13;
const WORK_START_PM = 15;
const WORK_END_PM = 19;
const SLOT_DURATION = 30;

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const addSlots = (start: number, end: number) => {
    for (let h = start; h < end; h++) {
      for (let m = 0; m < 60; m += SLOT_DURATION) {
        slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
      }
    }
  };
  addSlots(WORK_START, WORK_END);
  addSlots(WORK_START_PM, WORK_END_PM);
  return slots;
}

export async function getAvailableSlots(date: string) {
  const startOfDay = new Date(date + "T00:00:00.000Z");
  const endOfDay = new Date(date + "T23:59:59.999Z");

  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: startOfDay, lte: endOfDay }, status: { not: "CANCELLED" } },
    select: { time: true },
  });

  const bookedTimes = new Set(appointments.map((a) => a.time));
  return generateTimeSlots().filter((t) => !bookedTimes.has(t));
}

export async function createAppointment(data: {
  date: string;
  time: string;
  patientName: string;
  phone: string;
  email?: string;
  city?: string;
  notes?: string;
}) {
  const existing = await prisma.appointment.findFirst({
    where: { date: new Date(data.date + "T00:00:00.000Z"), time: data.time, status: { not: "CANCELLED" } },
  });

  if (existing) {
    throw new Error("SLOT_UNAVAILABLE");
  }

  return prisma.appointment.create({
    data: {
      date: new Date(data.date + "T00:00:00.000Z"),
      time: data.time,
      patientName: data.patientName,
      phone: data.phone,
      email: data.email,
      city: data.city,
      notes: data.notes,
    },
  });
}
