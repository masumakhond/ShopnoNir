/**
 * One-time sync: copy member contact fields onto linked user rows.
 * Run after schema adds profile columns: npx tsx prisma/sync-profile-fields.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const members = await prisma.member.findMany({
    include: { user: true },
  });

  let updated = 0;
  for (const member of members) {
    if (!member.user) continue;
    await prisma.user.update({
      where: { id: member.user.id },
      data: {
        phone: member.user.phone ?? member.phone,
        nominee: member.user.nominee ?? member.nominee,
        nomineePhone: member.user.nomineePhone ?? member.nomineePhone,
        nidNumber: member.user.nidNumber ?? member.nidNumber,
        address: member.user.address ?? member.address,
      },
    });
    updated++;
  }
  console.log(`Synced profile fields for ${updated} member login(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
