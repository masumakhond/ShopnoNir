/**
 * Updates member names without deleting batches or contributions.
 * Run: npm run members:rename
 */
import { PrismaClient } from "@prisma/client";

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
  for (let i = 0; i < 32; i++) {
    const memberNumber = i + 1;
    const name = MEMBER_NAMES[i];
    const member = await prisma.member.update({
      where: { memberNumber },
      data: { name },
      include: { user: true },
    });
    if (member.user) {
      await prisma.user.update({
        where: { id: member.user.id },
        data: { name },
      });
    }
    console.log(`#${memberNumber} → ${name}`);
  }
  console.log("All 32 member names updated.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
