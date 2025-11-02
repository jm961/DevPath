# Supabase Migration Guide

## 🎯 What Changed

Your DevPath project now uses **100% Supabase** instead of Railway backend:

- ✅ **Authentication**: Supabase Auth (Google OAuth, Email/Password)
- ✅ **Database**: Supabase PostgreSQL
- ✅ **APIs**: Supabase client queries (no custom backend!)
- ✅ **Hosting**: Vercel (frontend only)

## 📋 Setup Steps

### 1. Create Supabase Tables

1. Go to https://supabase.com/dashboard/project/zylbnzptiktszbutpelm
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase-schema.sql`
5. Click **Run** to create the tables

### 2. Verify Environment Variables

Make sure you have these set in Vercel:

```bash
PUBLIC_SUPABASE_URL=https://zylbnzptiktszbutpelm.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

You can check with:

```bash
vercel env ls
```

### 3. Remove Railway Backend (Optional)

Since you're not using Railway anymore:

1. Go to https://railway.app
2. Find your DevPath backend project
3. Click **Settings** → **Danger** → **Delete Service**

Or just let it sleep - Railway pauses inactive services.

### 4. Deploy to Vercel

```bash
pnpm run build
vercel --prod
```

## 🔧 What Was Removed

- ❌ `backend/` folder (no longer needed)
- ❌ `PUBLIC_API_URL` env var
- ❌ Railway deployment
- ❌ Custom JWT tokens (using Supabase sessions instead)
- ❌ All fetch calls to api.devpath.sh

## 🎉 What You Get

- ✨ Simpler architecture
- ✨ Cheaper (one service vs two)
- ✨ Better security (Row Level Security)
- ✨ Automatic auth session management
- ✨ Real-time capabilities (future feature!)

## 🧪 Testing

After deployment:

1. Go to https://devpath.sh/login
2. Click "Continue with Google"
3. Select your Google account
4. You should be redirected back logged in
5. Navigate to any roadmap and mark topics as complete
6. Progress should save automatically

## 🐛 Troubleshooting

**"Authentication is not configured"**

- Check Vercel env vars are set
- Redeploy: `vercel --prod`

**Progress not saving**

- Run the SQL in `supabase-schema.sql`
- Check Supabase logs for RLS policy errors

**Still seeing Railway errors**

- Clear browser cache/cookies
- Hard refresh (Cmd+Shift+R)
