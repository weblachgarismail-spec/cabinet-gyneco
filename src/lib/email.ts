import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

type ConfirmationParams = {
  to: string;
  patientName: string;
  date: string;
  time?: string;
};

export async function sendConfirmationEmail({ to, patientName, date, time }: ConfirmationParams) {
  const formattedDate = new Date(date + "T00:00:00.000Z").toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const heure = time || "À confirmer";

  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL || "",
    subject: "Confirmation de rendez-vous - Cabinet Gynécologique",
    text: `Bonjour ${patientName},\n\nVotre demande de rendez-vous est confirmée :\n\nDate : ${formattedDate}\nHeure : ${heure}\n\nAdresse : [Adresse du cabinet]\n\nMerci de votre confiance.\n\nCabinet Gynécologique`,
    html: `
      <h2>Confirmation de rendez-vous</h2>
      <p>Bonjour <strong>${patientName}</strong>,</p>
      <p>Votre demande de rendez-vous est confirmée :</p>
      <table>
        <tr><td><strong>Date :</strong></td><td>${formattedDate}</td></tr>
        <tr><td><strong>Heure :</strong></td><td>${heure}</td></tr>
      </table>
      <p><strong>Adresse :</strong> [Adresse du cabinet]</p>
      <br/>
      <p>Merci de votre confiance.</p>
      <p><em>Cabinet Gynécologique</em></p>
    `,
  });
}
