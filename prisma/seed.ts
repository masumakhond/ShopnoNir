import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const MEMBER_NAMES = [
  "MD. Masum Billah Akhond",
  "Toyeeba Akhond",
  "Mahfuja",
  "Shaifuddin Ahammed Rokib",
  "Esmat Jahan Lima",
  "Atef Arman Shishir",
  "Marof Billah",
  "Iftekhar Shakkhor",
  "Syeda Nusrat Parvin Kona",
  "Sheikh Abbas Ali",
  "Nazmul Ahmed Alok",
  "MD Solaiman Sheikh",
  "Mohammad Jannatun Nayem",
  "Saba Kabir",
  "Sheikh Ayub",
  "Israt Jahan Rito",
  "Khalid Kaiser Romman",
  "Aminur Rahman",
  "Tanvir Yeasin Opy",
  "Monirul Abdin Seum",
  "Mahfujur Rahman Akhond",
  "Jeaul Haque Bayzed",
  "Sakibur Rahman",
  "Sayem",
  "Mahmudul Hasan Sifat",
  "Fatematuzzohora",
  "Sheikh Ahmad Ali",
  "Tuba",
  "Harunur Rashid",
  "Sanjida Moni",
  "Maida",
  "Tofazzal Al Hoque",
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@samiti.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  const adminName = process.env.ADMIN_NAME || "সমিতি Admin";

  await prisma.user.deleteMany();
  await prisma.batchMember.deleteMany();
  await prisma.monthlyContribution.deleteMany();
  await prisma.investmentBatch.deleteMany();
  await prisma.member.deleteMany();

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      name: adminName,
    },
  });

  for (let i = 0; i < 32; i++) {
    const memberNumber = 1001 + i;
    const name = MEMBER_NAMES[i] || `Member ${memberNumber}`;
    const username = `member${memberNumber}`;
    const loginEmail = `${username}@samiti.local`;
    const passwordHash = await bcrypt.hash(`Member@${memberNumber}`, 12);
    await prisma.member.create({
      data: {
        memberNumber,
        name,
        active: true,
        monthlyAmount: 5000,
        user: {
          create: {
            email: loginEmail,
            passwordHash,
            role: "MEMBER",
            name,
          },
        },
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  console.log("Members: member<4-digit-id>@samiti.local / Member@<4-digit-id>");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
