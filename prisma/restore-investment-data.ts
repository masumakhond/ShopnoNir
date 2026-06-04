/**
 * Restores investment batches recovered from deleted SQLite pages in dev.db.
 * Run: npm run db:restore-investments
 *
 * Recovered from disk: ID 2219 (April 2026), ID 2263 (May 2263), all 32 members each.
 * Amounts/dates may need correction in Admin → Batches → Edit after restore.
 */
import { PrismaClient, CapitalPool } from "@prisma/client";
import { copyFileSync, existsSync } from "fs";
import { resolve } from "path";

const prisma = new PrismaClient();

/** Recovered batch metadata (member tags: all 32). Adjust amounts if yours differ. */
const RECOVERED_BATCHES = [
  {
    trackingId: "ID 2219",
    name: "April 2026",
    startDate: new Date("2026-05-07"),
    endDate: new Date("2027-04-30"),
    totalAmount: 160000,
    additionalAmount: 0,
    totalProfit: 30000,
  },
  {
    trackingId: "ID 2263",
    name: "May 2263",
    startDate: new Date("2026-05-18"),
    endDate: new Date("2027-04-30"),
    totalAmount: 160000,
    additionalAmount: 0,
    totalProfit: 28000,
  },
] as const;

async function main() {
  const dbPath = resolve(__dirname, "dev.db");
  const backupPath = resolve(__dirname, `dev.db.before-restore-${Date.now()}`);

  if (existsSync(dbPath)) {
    copyFileSync(dbPath, backupPath);
    console.log(`Backed up current DB → ${backupPath}`);
  }

  const existing = await prisma.investmentBatch.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} batch(es). Skipping restore to avoid duplicates.`);
    console.log("Delete batches manually first, or restore from backup if needed.");
    return;
  }

  const members = await prisma.member.findMany({
    where: { active: true },
    orderBy: { memberNumber: "asc" },
    select: { id: true, memberNumber: true, name: true },
  });

  if (members.length === 0) {
    throw new Error("No active members found. Run npm run db:seed first.");
  }

  console.log(`Restoring ${RECOVERED_BATCHES.length} batches with ${members.length} members each…`);

  for (const batch of RECOVERED_BATCHES) {
    const created = await prisma.investmentBatch.create({
      data: {
        trackingId: batch.trackingId,
        name: batch.name,
        startDate: batch.startDate,
        endDate: batch.endDate,
        totalAmount: batch.totalAmount,
        additionalAmount: batch.additionalAmount,
        totalProfit: batch.totalProfit,
        status: "ACTIVE",
        members: {
          create: members.map((m) => ({
            memberId: m.id,
            capitalPool: CapitalPool.MAIN,
          })),
        },
      },
    });
    console.log(`  ✓ ${batch.trackingId} — ${batch.name} (${created.id})`);
  }

  console.log("\nRestore complete.");
  console.log("IMPORTANT: Verify totalAmount, totalProfit, and dates in Admin → Batches → Edit.");
  console.log("Default amounts were set to ৳160,000 / ৳0 profit — update if your records differ.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
