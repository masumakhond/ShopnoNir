/**
 * Adds trackingId to existing batches without deleting your data.
 * Run: npm run db:migrate-tracking
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function columnExists(): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ name: string }[]>(
    `PRAGMA table_info(InvestmentBatch)`,
  );
  return rows.some((r) => r.name === "trackingId");
}

async function main() {
  const exists = await columnExists();

  if (!exists) {
    console.log("Adding trackingId column…");
    await prisma.$executeRawUnsafe(`ALTER TABLE "InvestmentBatch" ADD COLUMN "trackingId" TEXT`);
  } else {
    console.log("trackingId column already exists.");
  }

  const batches = await prisma.$queryRawUnsafe<{ id: string; trackingId: string | null }[]>(
    `SELECT id, trackingId FROM "InvestmentBatch" ORDER BY "createdAt" ASC`,
  );

  let maxNum = 0;
  for (const b of batches) {
    if (b.trackingId) {
      const m = b.trackingId.match(/(\d+)/);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    }
  }

  let next = maxNum + 1;
  let updated = 0;

  for (const b of batches) {
    if (!b.trackingId) {
      const trackingId = `ID ${next++}`;
      await prisma.$executeRawUnsafe(
        `UPDATE "InvestmentBatch" SET "trackingId" = ? WHERE id = ?`,
        trackingId,
        b.id,
      );
      console.log(`  ${b.id.slice(0, 8)}… → ${trackingId}`);
      updated++;
    }
  }

  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "InvestmentBatch_trackingId_key" ON "InvestmentBatch"("trackingId")`,
  );

  console.log(`Done. ${updated} batch(es) got new IDs. You can edit them in the app now.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
