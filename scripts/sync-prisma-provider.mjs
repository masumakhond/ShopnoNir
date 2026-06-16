import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
const databaseUrl = process.env.DATABASE_URL ?? "";

const provider =
  databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")
    ? "postgresql"
    : "sqlite";

const schema = fs.readFileSync(schemaPath, "utf8");
const updated = schema.replace(/provider = "(sqlite|postgresql)"/, `provider = "${provider}"`);

if (updated !== schema) {
  fs.writeFileSync(schemaPath, updated);
}

console.log(`Prisma provider: ${provider}`);
