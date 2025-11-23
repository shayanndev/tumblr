# Quick Setup Guide for tumblR

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `tumblr` (or any name)
   - Database password: (save this securely)
   - Region: Choose closest to you
5. Wait for project to be created (takes ~2 minutes)

## Step 3: Set Up Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

## Step 4: Get Your API Keys

1. In Supabase, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 5: Create Environment File

Create a file named `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase URL and anon key.

## Step 6: Make Yourself Admin

1. Register an account through the app (go to `/register`)
2. In Supabase, go to **SQL Editor**
3. Run this query (replace with your email):

```sql
UPDATE profiles
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

## Step 7: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in!

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

That's it! Your app will be live in a few minutes.

## Troubleshooting

### "Invalid API key" error
- Make sure your `.env.local` file has the correct values
- Restart your dev server after changing `.env.local`

### "Table doesn't exist" error
- Make sure you ran the SQL schema in Supabase SQL Editor
- Check that all tables were created in the Table Editor

### Can't create groups
- Make sure you set yourself as admin (Step 6)
- Check the `profiles` table in Supabase to verify `is_admin = true`

### Users not showing as online
- The online status updates when users are active
- Refresh the page to see current status

