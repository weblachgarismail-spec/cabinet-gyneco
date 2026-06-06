import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logAction } from "@/lib/log-action";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: { id: true, username: true, displayName: true, role: true, themeColor: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    logger.error("Failed to fetch profile", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { displayName, themeColor, currentPassword, newPassword } = await request.json();
    const data: Record<string, unknown> = {};
    if (displayName !== undefined) data.displayName = displayName;
    if (themeColor !== undefined) data.themeColor = themeColor;

    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: "Current password required" }, { status: 400 });
      const admin = await prisma.admin.findUnique({ where: { id: session.user.id } });
      if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const valid = await bcrypt.compare(currentPassword, admin.password);
      if (!valid) return NextResponse.json({ error: "Wrong password" }, { status: 400 });
      data.password = await bcrypt.hash(newPassword, 12);
    }

    const user = await prisma.admin.update({ where: { id: session.user.id }, data });
    await logAction({ userId: session.user.id, username: session.user.name || "", action: "UPDATE", entity: "Profile", entityId: session.user.id, details: "Profile updated" });
    logger.info("Profile updated");
    return NextResponse.json({ id: user.id, username: user.username, displayName: user.displayName, role: user.role, themeColor: user.themeColor });
  } catch (error) {
    logger.error("Failed to update profile", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
