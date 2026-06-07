import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export async function requireSuperAdmin(locale: string) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role || "";
  if (role !== "SUPER_ADMIN") {
    redirect(`/${locale}/admin/appointments`);
  }
}
