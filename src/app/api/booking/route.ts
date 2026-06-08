import { NextRequest, NextResponse } from "next/server";
import { createAppointment } from "@/lib/booking";
import { sendConfirmationEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, patientName, phone, email, city, notes } = body;

    if (!date || !time || !patientName || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const appointment = await createAppointment({ date, time, patientName, phone, email, city, notes });
    logger.info("Appointment created", { id: appointment.id, date, time });

    if (email) {
      sendConfirmationEmail({ to: email, patientName, date, time }).catch((err) =>
        logger.error("Failed to send confirmation email", { error: err, appointmentId: appointment.id })
      );
    }

    return NextResponse.json({ success: true, id: appointment.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_UNAVAILABLE") {
      return NextResponse.json({ error: "SLOT_UNAVAILABLE" }, { status: 409 });
    }
    logger.error("Failed to create appointment", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
