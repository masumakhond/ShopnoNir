const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const members = await prisma.member.findMany({
    include: { user: true },
    orderBy: { memberNumber: "asc" },
  });

  let nextNumber = 1001;

  for (const member of members) {
    const memberNumber = nextNumber++;
    const username = `member${memberNumber}`;
    const email = `${username}@samiti.local`;
    const passwordHash = await bcrypt.hash(`Member@${memberNumber}`, 12);

    await prisma.member.update({
      where: { id: member.id },
      data: { memberNumber },
    });

    if (member.user) {
      await prisma.user.update({
        where: { id: member.user.id },
        data: {
          email,
          passwordHash,
          role: "MEMBER",
        },
      });
    }
  }

  console.log(`Rekeyed ${members.length} member logins to 4-digit IDs.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
