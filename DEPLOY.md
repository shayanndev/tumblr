# Deployment Guide - GitHub & Vercel

## Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (if installed)
```bash
gh repo create tumblR --public --source=. --remote=origin --push
```

### Option B: Using GitHub Website
1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Repository name: `tumblR` (or any name you prefer)
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

Then run these commands:
```bash
git remote add origin https://github.com/YOUR_USERNAME/tumblR.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (if installed)
```bash
npm i -g vercel
vercel
```
Follow the prompts and add your environment variables.

### Option B: Using Vercel Website (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Import your `tumblR` repository
4. Vercel will auto-detect Next.js settings
5. **Add Environment Variables:**
   - Click **Environment Variables**
   - Add `NEXT_PUBLIC_SUPABASE_URL` with your Supabase project URL
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your Supabase anon key
6. Click **Deploy**

Your app will be live in 2-3 minutes! 🚀

## Step 3: Verify Deployment

1. Once deployed, Vercel will give you a URL (e.g., `tumblR.vercel.app`)
2. Visit the URL and test:
   - Login/Register works
   - Chat messages appear in real-time
   - Online status updates
   - Admin can create groups

## Troubleshooting

### Build fails on Vercel
- Check that all environment variables are set correctly
- Make sure `NEXT_PUBLIC_` prefix is used for client-side variables
- Check build logs in Vercel dashboard

### App works locally but not on Vercel
- Verify environment variables in Vercel dashboard
- Check Supabase RLS policies allow your Vercel deployment
- Make sure Supabase project is not paused (free tier can pause after inactivity)

### Database connection errors
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Ensure RLS policies are set up correctly

## Next Steps After Deployment

1. **Set up custom domain** (optional):
   - In Vercel, go to Settings → Domains
   - Add your custom domain

2. **Enable Supabase Realtime** (if not already):
   - In Supabase, go to Database → Replication
   - Enable replication for `messages` and `profiles` tables

3. **Monitor usage**:
   - Vercel free tier: 100GB bandwidth/month
   - Supabase free tier: 500MB database, 2GB bandwidth/month

