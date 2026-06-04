import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@samiti.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const name = process.env.ADMIN_NAME || "সমিতি Admin";
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: "ADMIN", name },
    });
    console.log(`Admin password updated for: ${email}`);
  } else {
    await prisma.user.create({
      data: { email, passwordHash, role: "ADMIN", name },
    });
    console.log(`Admin user created: ${email}`);
  }

  console.log("Use the password from ADMIN_PASSWORD in .env (or default Admin@12345).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
