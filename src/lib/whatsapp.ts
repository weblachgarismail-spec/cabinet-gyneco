export function getWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  const international = cleaned.startsWith("0") ? "212" + cleaned.slice(1) : cleaned.startsWith("212") ? cleaned : "212" + cleaned;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}

function formatAppointmentDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function detectTitle(name: string): string {
  const feminine = name.trim().toLowerCase().endsWith("a") || name.trim().toLowerCase().endsWith("e");
  return feminine ? "Madame" : "Monsieur";
}

export function getConfirmationMessage(patientName: string, date: string, time?: string): string {
  const title = detectTitle(patientName);
  return `Bonjour ${title} ${patientName},\n\nVotre rendez-vous au cabinet gynécologue est confirmé pour le ${formatAppointmentDate(date)} à ${time || "à confirmer"}.\n\nMerci de votre confiance.\n\nCabinet Gynécologue`;
}

export function getReminderMessage(patientName: string, date: string, time?: string): string {
  const title = detectTitle(patientName);
  return `Bonjour ${title} ${patientName},\n\nRappel : vous avez rendez-vous au cabinet gynécologue aujourd'hui ${time ? "à " + time : ""}.\n\nMerci de votre confiance.\n\nCabinet Gynécologue`;
}
