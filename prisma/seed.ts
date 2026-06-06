import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.admin.findUnique({ where: { username: "admin" } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash("admin123", 12);
    await prisma.admin.create({
      data: { username: "admin", password: hashed, displayName: "Super Admin", role: "SUPER_ADMIN", active: true },
    });
    console.log("Super admin created: admin / admin123");
  } else {
    console.log("Super admin already exists, updating role…");
    await prisma.admin.update({ where: { username: "admin" }, data: { role: "SUPER_ADMIN", displayName: "Super Admin" } });
  }

  const existingSec = await prisma.admin.findUnique({ where: { username: "secretaire" } });
  if (!existingSec) {
    const hashed = await bcrypt.hash("secretary123", 12);
    await prisma.admin.create({
      data: { username: "secretaire", password: hashed, displayName: "Secrétaire", role: "SECRETARY", active: true },
    });
    console.log("Secretary created: secretaire / secretary123");
  }

  const existingDoc = await prisma.admin.findUnique({ where: { username: "doctor" } });
  if (!existingDoc) {
    const hashed = await bcrypt.hash("doctor123", 12);
    await prisma.admin.create({
      data: { username: "doctor", password: hashed, displayName: "Dr. Said", role: "DOCTOR", active: true },
    });
    console.log("Doctor created: doctor / doctor123");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
