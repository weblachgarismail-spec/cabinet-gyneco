import { readFileSync, writeFileSync } from "fs";

const fr = JSON.parse(readFileSync("messages/fr.json", "utf8"));
const ar = JSON.parse(readFileSync("messages/ar.json", "utf8"));

const statsKeys = {
  stats_title: { fr: "Statistiques", ar: "الإحصائيات" },
  stats_patients: { fr: "Patients", ar: "المرضى" },
  stats_appointments: { fr: "Total RDV", ar: "إجمالي المواعيد" },
  stats_week: { fr: "Cette semaine", ar: "هذا الأسبوع" },
  stats_by_status: { fr: "Répartition par statut", ar: "التوزيع حسب الحالة" },
  stats_top_acts: { fr: "Actes médicaux les plus fréquents", ar: "أكثر الإجراءات الطبية شيوعاً" },
  stats_recent_patients: { fr: "Derniers patients", ar: "آخر المرضى" },
  stats_recent_appointments: { fr: "Derniers rendez-vous", ar: "آخر المواعيد" },
  status_CONFIRMED: { fr: "Confirmé", ar: "مؤكد" },
  status_ARRIVED: { fr: "Arrivé", ar: "حاضر" },
  status_CANCELLED: { fr: "Annulé", ar: "ملغي" },
  status_MISSED: { fr: "Absent", ar: "غائب" },
  status_PENDING: { fr: "En attente", ar: "قيد الانتظار" },
  status_POSTPONED: { fr: "Reporté", ar: "مؤجل" },
  error: { fr: "Une erreur est survenue.", ar: "حدث خطأ." },
};

for (const [key, val] of Object.entries(statsKeys)) {
  if (!(key in fr.admin)) fr.admin[key] = val.fr;
  if (!(key in ar.admin)) ar.admin[key] = val.ar;
}

writeFileSync("messages/fr.json", JSON.stringify(fr, null, 4) + "\n");
writeFileSync("messages/ar.json", JSON.stringify(ar, null, 4) + "\n");
console.log("Stats keys added");
