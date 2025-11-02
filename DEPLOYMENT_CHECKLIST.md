# 🚀 DevPath Production Deployment Checklist

## ✅ COMPLETED - Backend Configuration

- [x] Supabase database connected (`postgresql://...ap-southeast-2.pooler.supabase.com:6543`)
- [x] Database tables initialized (`users`, `user_progress`)
- [x] JWT secret configured (64-byte secure key)
- [x] CORS configured for production domain (`https://devpath.sh`)
- [x] Google OAuth endpoint created (`/v1-google-callback`)
- [x] Environment set to production (`NODE_ENV=production`)
- [x] SSL enabled for Supabase connection

## ✅ COMPLETED - Frontend Configuration

- [x] Supabase client library installed (`@supabase/supabase-js`)
- [x] Supabase client configured (`src/lib/supabase.ts`)
- [x] Google OAuth button updated to use Supabase Auth
- [x] API URL set to production (`https://api.devpath.sh/api`)
- [x] Supabase URL and Anon Key configured

## 📋 TODO - Before Deployment

### 1. Supabase Settings (REQUIRED)

In **Supabase Dashboard → Settings → Authentication**:

#### URL Configuration:

- **Site URL:** `https://devpath.sh`
- **Redirect URLs:**
  ```
  https://devpath.sh/**
  https://www.devpath.sh/**
  ```

#### Providers → Google:

- **Enable:** Toggle ON
- **Client ID:** (from Google Cloud Console)
- **Client Secret:** (from Google Cloud Console)
- Click **Save**

### 2. Google Cloud Console (REQUIRED)

At https://console.cloud.google.com/apis/credentials:

#### OAuth 2.0 Client ID:

- **Authorized redirect URIs:**
  ```
  https://zylbnzptiktszbutpelm.supabase.co/auth/v1/callback
  https://devpath.sh/
  https://www.devpath.sh/
  ```
- Click **Save**

### 3. Deploy Backend to Render

**Option: Render (Recommended)**

1. Go to https://render.com → New Web Service
2. Connect GitHub repository
3. Configure:

   ```
   Name: devpath-backend
   Region: Oregon (US West) or Singapore (closest to Supabase ap-southeast-2)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Environment Variables** (click "Advanced" → "Add Environment Variable"):

   ```
   DATABASE_URL=postgresql://postgres.zylbnzptiktszbutpelm:70852190Jme@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
   NODE_ENV=production
   PORT=4000
   JWT_SECRET=0a875498f754aea3e6505ade6d1a87f279682933031893ffd0ff987e946180398abaa3dbde50e07442e31430ef951f91d12d666660636a5107cc3c6a8b165174
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://devpath.sh
   PUBLIC_API_URL=https://api.devpath.sh/api
   SUPABASE_URL=https://zylbnzptiktszbutpelm.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bGJuenB0aWt0c3pidXRwZWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMzAyODAsImV4cCI6MjA3NzYwNjI4MH0.vgx_i_obW8gtEgoyh0nav7dMSI1dD22-9CH-Fuv8b4w
   ```

5. Select Plan:

   - **Free** (for testing, sleeps after 15min inactivity)
   - **Starter $7/month** (recommended, always-on)

6. Click **Create Web Service**

7. **After deployment**, get your backend URL (e.g., `https://devpath-backend-xxx.onrender.com`)

8. **Set up custom domain:**
   - In Render dashboard → Settings → Custom Domain
   - Add: `api.devpath.sh`
   - Update your DNS:
     - Type: CNAME
     - Name: api
     - Value: `devpath-backend-xxx.onrender.com`

### 4. Deploy Frontend

**Your existing setup (based on your current hosting):**

1. Build the frontend:

   ```bash
   npm run build
   ```

2. Deploy `dist/` folder to your hosting (Vercel/Netlify/etc.)

3. Set environment variables in your hosting dashboard:

   **Via Vercel CLI:**

   ```bash
   # Link your project first (if not already linked)
   vercel link

   # Add environment variables to all environments
   echo "https://api.devpath.sh/api" | vercel env add PUBLIC_API_URL production preview
   echo "https://zylbnzptiktszbutpelm.supabase.co" | vercel env add PUBLIC_SUPABASE_URL production preview
   echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bGJuenB0aWt0c3pidXRwZWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMzAyODAsImV4cCI6MjA3NzYwNjI4MH0.vgx_i_obW8gtEgoyh0nav7dMSI1dD22-9CH-Fuv8b4w" | vercel env add PUBLIC_SUPABASE_ANON_KEY production preview
   ```

   **Or via Vercel Dashboard:**

   - Go to Project Settings → Environment Variables
   - Add the following variables for Production and Preview:

   ```
   PUBLIC_API_URL=https://api.devpath.sh/api
   PUBLIC_SUPABASE_URL=https://zylbnzptiktszbutpelm.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bGJuenB0aWt0c3pidXRwZWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMzAyODAsImV4cCI6MjA3NzYwNjI4MH0.vgx_i_obW8gtEgoyh0nav7dMSI1dD22-9CH-Fuv8b4w
   ```

   > **Note:** These environment variables are required for the build to succeed. The Supabase client is initialized lazily at runtime, but the values must be present during the build process.

### 5. DNS Configuration

Point these domains to your hosting:

| Domain           | Type       | Value                              |
| ---------------- | ---------- | ---------------------------------- |
| `devpath.sh`     | A or CNAME | Your frontend hosting              |
| `www.devpath.sh` | CNAME      | `devpath.sh`                       |
| `api.devpath.sh` | CNAME      | `devpath-backend-xxx.onrender.com` |

### 6. Test After Deployment

Once everything is live:

1. **Test backend health:**

   ```bash
   curl https://api.devpath.sh/health
   ```

   Expected: `{"status":"ok","timestamp":"...","environment":"production"}`

2. **Test user signup:**

   ```bash
   curl -X POST https://api.devpath.sh/api/v1-signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@devpath.sh","password":"SecurePass123","name":"Test User"}'
   ```

3. **Test Google OAuth:**
   - Go to `https://devpath.sh/login`
   - Click "Continue with Google"
   - Should redirect to Google login
   - After auth, should redirect back and log you in

## 🎯 Quick Deployment Summary

### Prerequisites (Do First):

1. ✅ Configure Supabase Auth URLs
2. ✅ Add Google OAuth redirect URIs in Google Cloud Console
3. ✅ Enable Google provider in Supabase

### Deploy Backend:

1. Deploy to Render with environment variables above
2. Get backend URL
3. Set up custom domain `api.devpath.sh`

### Deploy Frontend:

1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variables
4. Point DNS to hosting

### Verify:

1. Test backend health endpoint
2. Test signup/login
3. Test Google OAuth

## 📊 Cost Estimate

- **Supabase:** FREE (500MB database)
- **Render Backend:** $7/month (Starter plan, always-on)
- **Frontend Hosting:** $0 (if using Vercel/Netlify free tier)
- **Total:** ~$7/month

## 🆘 Troubleshooting

### "Something went wrong" on Google login

- Check Supabase redirect URLs include `https://devpath.sh/**`
- Check Google Console has `https://zylbnzptiktszbutpelm.supabase.co/auth/v1/callback`
- Verify Google provider is enabled in Supabase

### CORS errors

- Check `FRONTEND_URL` in backend matches your actual frontend domain
- Verify it's `https://devpath.sh` not `https://devpath.sh/`

### Database connection failed

- Verify `DATABASE_URL` is set correctly in Render
- Check Supabase project is active

## ✅ READY TO DEPLOY!

Your configuration is complete. Follow the steps above to deploy!

**Start with:** Deploy backend to Render (Step 3)
