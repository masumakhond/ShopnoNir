/**
 * One-time migration: add additionalAmount + capitalPool on batch members.
 * Run: npx tsx prisma/migrate-capital-pools.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE InvestmentBatch ADD COLUMN additionalAmount DECIMAL NOT NULL DEFAULT 0;
  `).catch(() => {
    /* column may already exist */
  });

  const tableInfo = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `PRAGMA table_info(BatchMember);`,
  );
  const hasPool = tableInfo.some((c) => c.name === "capitalPool");

  if (!hasPool) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "BatchMember_new" (
        "batchId" TEXT NOT NULL,
        "memberId" TEXT NOT NULL,
        "capitalPool" TEXT NOT NULL DEFAULT 'MAIN',
        PRIMARY KEY ("batchId", "memberId", "capitalPool"),
        CONSTRAINT "BatchMember_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "InvestmentBatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "BatchMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await prisma.$executeRawUnsafe(`
      INSERT INTO "BatchMember_new" ("batchId", "memberId", "capitalPool")
      SELECT "batchId", "memberId", 'MAIN' FROM "BatchMember";
    `);
    await prisma.$executeRawUnsafe(`DROP TABLE "BatchMember";`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "BatchMember_new" RENAME TO "BatchMember";`);
    console.log("Migrated BatchMember to include capitalPool");
  } else {
    console.log("BatchMember already has capitalPool");
  }

  console.log("Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
