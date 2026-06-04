Sure! Here's a beginner-friendly step-by-step guide:

---

## Step 1: Create a Supabase Account & Database

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **"New Project"**
3. Fill in:
   - **Name:** anything (e.g. `samiti-db`)
   - **Database Password:** set a strong password *(save it somewhere)*
   - **Region:** choose closest to Bangladesh (e.g. Singapore)
4. Click **"Create new project"** and wait ~2 minutes

---

## Step 2: Get Your Database Connection String

1. In Supabase, go to **Project Settings** (bottom left gear icon)
2. Click **Database**
3. Scroll down to **"Connection string"**
4. Select **"URI"** tab
5. Copy the string — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@...supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with the password you set in Step 1

---

## Step 3: Upload Your Code to GitHub

1. Go to [github.com](https://github.com) and sign up (free)
2. Click **"New repository"**
3. Name it (e.g. `samiti-app`) and click **"Create repository"**
4. On your Mac, open **Terminal** in your project folder and run:
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/samiti-app.git
   git push -u origin main
   ```

---

## Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **"Add New Project"**
3. Select your **samiti-app** repository
4. Under **"Root Directory"**, set it to `investment_cooperative`
5. Before clicking deploy, click **"Environment Variables"** and add:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | the connection string from Step 2 |
   | `JWT_SECRET` | any long random text (e.g. `my-super-secret-key-12345`) |

6. Click **"Deploy"** and wait a few minutes

---

## Step 5: Set Up the Database Tables

After deploy is done, run these on your **Mac Terminal** inside the project folder:

```bash
npx prisma db push
npm run db:seed
```

This creates all the tables and adds the default admin/member logins.

---

## Step 6: Open Your Live Site

Vercel will give you a URL like:
```
https://samiti-app.vercel.app
```

Login with:
- **Admin:** `admin@samiti.local` / `Admin@12345`
- **Member:** `member1@samiti.local` / `Member@12345`

---

### If anything goes wrong, let me know the exact error and I'll help you fix it!