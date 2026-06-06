import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logAction } from "@/lib/log-action";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await prisma.admin.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, username: true, displayName: true, role: true, themeColor: true, active: true, createdAt: true } });
    return NextResponse.json(users);
  } catch (error) {
    logger.error("Failed to fetch users", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { username, password, displayName, role } = await request.json();
    if (!username || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing) return NextResponse.json({ error: "Username taken" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.admin.create({ data: { username, password: hashed, displayName, role: role || "SECRETARY", active: false } });

    await logAction({ userId: session.user.id, username: session.user.name || "", action: "CREATE", entity: "Admin", entityId: user.id, details: `Created user ${username}` });
    logger.info("User created", { username });

    return NextResponse.json({ id: user.id, username: user.username, displayName: user.displayName, role: user.role });
  } catch (error) {
    logger.error("Failed to create user", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
