# সমিতি Investment Cooperative

Full-stack web app for a 32-member savings and investment cooperative (BDT 5,000/month per member).

## Features

- **Admin**: manage members, record monthly contributions (single or **bulk all 32**), create/edit/delete investment batches (flexible dates, profit %, member tags), fund dashboard
- **Members**: view own principal, daily profit accrual, batch breakdown, contribution history
- **Bengali UI** labels across navigation, forms, and dashboards (`src/lib/i18n.ts`)
- **Profit logic**: enter **main amount** + **profit amount** + **duration** (start/end dates); `daily_profit = total_profit ÷ days`, split equally among tagged members per calendar day
- **JWT auth** (httpOnly cookie), deployable on **Vercel** + **Supabase PostgreSQL**

## Tech stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- bcrypt + jose (JWT)

## Setup (local)

1. Copy environment file:

```bash
cp .env.example .env
```

2. Set `DATABASE_URL` (Supabase → Project Settings → Database → connection string) and `JWT_SECRET`.

3. Install and migrate:

```bash
npm install
npx prisma db push
npm run db:seed
```

4. Run dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default logins (after seed)

| Role   | Email               | Password      |
|--------|---------------------|---------------|
| Admin  | `admin@samiti.local` | `Admin@12345` |
| Member | `member1@samiti.local` | `Member@12345` |

(Members 1–32: `member{N}@samiti.local`, same password.)

## Deploy (Vercel + Supabase)

1. Create a **Supabase** project and copy the **PostgreSQL** connection string into Vercel env as `DATABASE_URL`.
2. Set `JWT_SECRET` in Vercel (long random string).
3. Import repo in **Vercel**, root directory: `investment_cooperative`.
4. Build command: `npm run build` (runs `prisma generate` via postinstall).
5. After first deploy, run migrations + seed once (locally against production DB or Supabase SQL):

```bash
npx prisma db push
npm run db:seed
```

6. Point your custom domain in Vercel when ready.

## Project structure

```
src/app/
  admin/          # Admin UI
  dashboard/      # Member profile
  api/            # REST API routes
  login/
src/lib/
  profit.ts       # Daily profit calculations
  services.ts     # Fund & member summaries
prisma/
  schema.prisma
  seed.ts
```

## Investment batch example

- Start: `2025-01-01`, End: `2025-12-31` (365 days)
- Main amount: `BDT 1,920,000`
- Profit amount: `BDT 345,600` (you enter the total profit directly — no % required)
- Daily fund profit = `345,600 ÷ 365`
- Per member per day = daily profit ÷ number of tagged members

Batches can be any duration and any profit amount; tag all 32 or a subset.
