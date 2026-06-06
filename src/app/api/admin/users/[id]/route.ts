import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logAction } from "@/lib/log-action";
import bcrypt from "bcryptjs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if ((session.user as { id: string }).id === (await params).id) {
    return NextResponse.json({ error: "Cannot edit yourself here, use profile page" }, { status: 400 });
  }

  try {
    const { id } = await params;
    const { username, password, displayName, role, active } = await request.json();
    const existing = await prisma.admin.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (active === false && existing.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Cannot deactivate super admin" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (username) data.username = username;
    if (displayName !== undefined) data.displayName = displayName;
    if (role) data.role = role;
    if (password) data.password = await bcrypt.hash(password, 12);
    if (active !== undefined) data.active = active;

    const user = await prisma.admin.update({ where: { id }, data });
    await logAction({ userId: session.user.id, username: session.user.name || "", action: "UPDATE", entity: "Admin", entityId: id, details: `Updated user ${user.username}` });
    logger.info("User updated", { id });
    return NextResponse.json({ id: user.id, username: user.username, displayName: user.displayName, role: user.role });
  } catch (error) {
    logger.error("Failed to update user", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if ((session.user as { id: string }).id === (await params).id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  try {
    const { id } = await params;
    const user = await prisma.admin.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (user.role === "SUPER_ADMIN") return NextResponse.json({ error: "Cannot delete super admin" }, { status: 400 });

    await prisma.admin.delete({ where: { id } });
    await logAction({ userId: session.user.id, username: session.user.name || "", action: "DELETE", entity: "Admin", entityId: id, details: `Deleted user ${user.username}` });
    logger.info("User deleted", { id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete user", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
