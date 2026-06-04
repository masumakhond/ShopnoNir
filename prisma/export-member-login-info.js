const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });

  const members = await prisma.member.findMany({
    include: { user: true },
    orderBy: { memberNumber: "asc" },
  });

  const today = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push("ShopnoNir login information");
  lines.push(`Generated: ${today}`);
  lines.push("");
  lines.push("Admin login");
  lines.push(`- Username: ${admin ? admin.email.split("@")[0] : ""}`);
  lines.push(`- Email: ${admin ? admin.email : ""}`);
  lines.push("- Password: (set in .env or changed from account page)");
  lines.push("");
  lines.push("Member login (all members)");
  lines.push("- Username pattern: member<4-digit-id>");
  lines.push("- Password pattern: Member@<4-digit-id>");
  lines.push("");
  lines.push("Full member list");

  members.forEach((m, idx) => {
    const num = m.memberNumber;
    const username = `member${num}`;
    const email = `${username}@samiti.local`;
    const password = `Member@${num}`;
    lines.push(`${idx + 1}. ${m.name} - ${username} - ${email} - ${password}`);
  });

  lines.push("");
  lines.push("Note:");
  lines.push("- If a member changes password in account page, that password may differ.");

  const outPath = path.join(__dirname, "..", "member-login-info.txt");
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${outPath}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
