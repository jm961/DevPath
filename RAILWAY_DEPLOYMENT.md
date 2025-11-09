# 🚂 Railway Deployment Guide for DevPath

> **This guide will get your DevPath project deployed on Railway in ONE attempt.**
> Follow each step carefully and check them off as you complete them.

---

## 📋 Overview

This is a monorepo with two services:

- **Backend API** (Express + PostgreSQL) → Deploy on Railway
- **Frontend** (Astro) → Deploy on Railway or Vercel

We'll use **Supabase** for the PostgreSQL database (free tier, managed, production-ready).

---

## ✅ Pre-Deployment Checklist

- [ ] GitHub repository is up-to-date and pushed to `main` branch
- [ ] You have a Railway account (sign up at https://railway.app)
- [ ] You have a Supabase account (sign up at https://supabase.com)
- [ ] Node.js 18.x installed locally (for generating secrets)

---

## 🗄️ Step 1: Setup Supabase Database (5 minutes)

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: `devpath-db` (or your choice)
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (takes ~2 minutes)

### 1.2 Get Database Connection String

1. Once project is ready, go to **Project Settings** (gear icon)
2. Click **Database** in the sidebar
3. Scroll to **Connection string** section
4. Select **"URI"** tab
5. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
6. Replace `[YOUR-PASSWORD]` with the password you set in step 1.1
7. **SAVE THIS** - you'll need it for Railway

### 1.3 Initialize Database Schema

You'll do this AFTER deploying the backend to Railway (we need the API running first).

---

## 🚂 Step 2: Deploy Backend API to Railway (10 minutes)

### 2.1 Create Railway Project

1. Go to https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub
4. Select the **`DevPath`** repository
5. Railway will ask which service to deploy - click **"Add variables"** (don't deploy yet!)

### 2.2 Configure Backend Service

1. In Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select your **`DevPath`** repository
3. Railway detects the repo - click **"Add Service"**
4. **IMPORTANT**: Click **Settings** (gear icon) for the service
5. Under **"Root Directory"**, set: `backend`
6. Under **"Service Name"**, rename to: `devpath-api`
7. Click **"Deploy"** (it will fail - that's OK, we need to add variables first)

### 2.3 Set Environment Variables

1. Click on the **`devpath-api`** service
2. Go to **Variables** tab
3. Click **"New Variable"** and add each of these:

```bash
# === REQUIRED VARIABLES ===

# Node Environment
NODE_ENV=production

# Railway automatically provides PORT, but we set a fallback
PORT=4000

# Database (from Supabase - Step 1.2)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres

# JWT Secret (generate below)
JWT_SECRET=<generate-this-now>
JWT_EXPIRES_IN=7d

# CORS & API URLs (use Railway domain first, update later with custom domain)
FRONTEND_URL=https://devpath.up.railway.app,https://*.vercel.app,http://localhost:3000
PUBLIC_API_URL=https://devpath-api.up.railway.app/api

# Rate Limiting (optional but recommended)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2.4 Generate JWT Secret

**On your local machine**, run this command:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET` value in Railway.

### 2.5 Deploy Backend

1. After adding all variables, Railway will auto-deploy
2. Check **Deployments** tab - wait for "Success" status (2-3 minutes)
3. Click **Settings** → **Networking** → **Generate Domain**
4. Copy the generated domain (e.g., `devpath-api.up.railway.app`)
5. **SAVE THIS URL** - you'll need it for the frontend

### 2.6 Initialize Database Tables

1. In Railway, click on **`devpath-api`** service
2. Go to **Settings** tab
3. Scroll down to **Service** section
4. Click **"Open in Terminal"** (or use the deployments view)
5. Run this command in the Railway shell:

```bash
npm run init-db
```

6. You should see: ✅ `Database initialized successfully!`

### 2.7 Test Backend API

1. Open your browser
2. Go to: `https://your-railway-domain.up.railway.app/health`
3. You should see:

```json
{
  "status": "ok",
  "timestamp": "2025-11-09T...",
  "environment": "production",
  "database": "connected"
}
```

✅ **Backend is LIVE!** If you see this, your API is working perfectly.

---

## 🎨 Step 3: Deploy Frontend to Railway (10 minutes)

### 3.1 Create Frontend Service

1. In your Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select your **`DevPath`** repository again
3. Click **"Add Service"**
4. Click **Settings** for this new service
5. Under **"Service Name"**, rename to: `devpath-frontend`
6. Under **"Root Directory"**, leave it as **root** (or set to `/`)
7. Under **"Build Command"**, set: `npm install --legacy-peer-deps && npm run build`
8. Under **"Start Command"**, set: `npm start`

### 3.2 Set Frontend Environment Variables

1. Click on **`devpath-frontend`** service
2. Go to **Variables** tab
3. Add these variables:

```bash
# API URL (use your Railway backend domain from Step 2.5)
PUBLIC_API_URL=https://devpath-api.up.railway.app/api

# Supabase (if using Supabase Auth on frontend)
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Port (Railway provides this automatically)
PORT=3000
```

**To get Supabase keys:**

1. Go to Supabase Project → **Settings** → **API**
2. Copy **"Project URL"** → `PUBLIC_SUPABASE_URL`
3. Copy **"anon/public key"** → `PUBLIC_SUPABASE_ANON_KEY`

### 3.3 Update Backend FRONTEND_URL

1. Go back to **`devpath-api`** service → **Variables**
2. Find `FRONTEND_URL` variable
3. Click to edit
4. Get your frontend Railway domain: Go to **`devpath-frontend`** → **Settings** → **Networking** → **Generate Domain**
5. Add the new frontend domain to `FRONTEND_URL` (comma-separated):

```bash
FRONTEND_URL=https://devpath.up.railway.app,https://*.vercel.app,http://localhost:3000
```

6. Railway will auto-redeploy the backend

### 3.4 Deploy Frontend

1. Railway should auto-deploy after adding variables
2. Wait for "Success" status in **Deployments** tab (3-5 minutes)
3. Once deployed, click on the generated domain
4. Your DevPath site should be LIVE! 🎉

---

## 🌐 Step 4: Custom Domains (Optional)

### 4.1 Backend Custom Domain

1. In Railway, click **`devpath-api`** → **Settings** → **Networking**
2. Under **Custom Domains**, click **"+ Custom Domain"**
3. Enter: `api.devpath.sh`
4. Railway shows you the CNAME record to add
5. Go to your DNS provider (Cloudflare, GoDaddy, etc.)
6. Add the CNAME record:
   - **Type**: CNAME
   - **Name**: `api` (or `api.devpath.sh`)
   - **Value**: (the value Railway provided)
   - **Proxy**: OFF (if using Cloudflare)
7. Wait 5-10 minutes for DNS propagation
8. Railway will auto-verify and issue SSL certificate

### 4.2 Frontend Custom Domain

1. Click **`devpath-frontend`** → **Settings** → **Networking**
2. Click **"+ Custom Domain"**
3. Enter: `devpath.sh` (and optionally `www.devpath.sh`)
4. Add the CNAME records to your DNS provider
5. Wait for verification

### 4.3 Update Environment Variables for Custom Domains

Once custom domains are active:

**Backend variables:**

```bash
PUBLIC_API_URL=https://api.devpath.sh/api
FRONTEND_URL=https://devpath.sh,https://www.devpath.sh,https://*.vercel.app
```

**Frontend variables:**

```bash
PUBLIC_API_URL=https://api.devpath.sh/api
```

Railway will auto-redeploy when you change variables.

---

## ✅ Step 5: Verification & Testing

### 5.1 Backend Health Check

```bash
curl https://api.devpath.sh/health
# or your Railway domain
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-11-09T...",
  "environment": "production",
  "database": "connected"
}
```

### 5.2 Test User Registration

```bash
curl -X POST https://api.devpath.sh/api/v1-signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456!"
  }'
```

Expected: Success response with user data

### 5.3 Test Frontend

1. Open your frontend URL
2. Try to register/login
3. Check browser console for errors
4. Verify API calls are going to the correct backend domain

### 5.4 Check Database

1. Go to Supabase → **Table Editor**
2. You should see tables: `users`, `progress`, etc.
3. Check that test user was created

---

## 🐛 Troubleshooting

### Backend won't deploy

- **Check Logs**: Railway → `devpath-api` → **Deployments** → Click on deployment → **View Logs**
- **Common issues**:
  - ❌ Missing `DATABASE_URL` → Add in Variables tab
  - ❌ Wrong root directory → Should be `backend`
  - ❌ npm install fails → Railway should use Node 18.x by default

### Database connection error

- Verify `DATABASE_URL` is correct
- Ensure Supabase project is active (not paused)
- Check Supabase password was correctly replaced in connection string
- Connection string should end with `?sslmode=require` or just `postgres`

### CORS errors on frontend

- Check `FRONTEND_URL` in backend includes your frontend domain
- Verify frontend is using correct `PUBLIC_API_URL`
- Check browser console for exact error

### Frontend shows "API error"

- Verify `PUBLIC_API_URL` is set correctly
- Test backend `/health` endpoint directly
- Check Railway logs for backend errors

### Railway deployment failed

- Click on the failed deployment → **View Logs**
- Look for the error (usually at the bottom)
- Common fixes:
  - Update `railway.json` or `railway.toml`
  - Check `package.json` scripts
  - Verify Node.js version compatibility

---

## 📊 Monitoring & Maintenance

### View Logs

**Railway Dashboard:**

1. Click on service (`devpath-api` or `devpath-frontend`)
2. Go to **Deployments** tab
3. Click any deployment → **View Logs**

**Real-time logs:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# View logs
railway logs
```

### Database Backups (Supabase)

1. Supabase auto-backups daily (free tier: 7 days retention)
2. Manual backup: **Database** → **Backups** → **Manual backup**

### Scaling

Railway auto-scales based on traffic. For better performance:

1. Upgrade Railway plan (if needed)
2. Upgrade Supabase plan for more database connections

---

## 🎉 Success Checklist

- [ ] Backend deployed on Railway
- [ ] Backend `/health` endpoint returns 200 OK
- [ ] Database initialized with tables
- [ ] Frontend deployed on Railway
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Progress saving/loading works
- [ ] Custom domains configured (optional)
- [ ] SSL certificates active (auto via Railway)

---

## 🔒 Security Notes

✅ **You're already secure with:**

- Helmet.js security headers
- Rate limiting on auth endpoints
- CORS restricted to your domains
- JWT authentication
- Environment variables (not in code)
- SSL/HTTPS (automatic on Railway)

**Additional recommendations:**

- Rotate JWT_SECRET periodically
- Monitor Railway logs for suspicious activity
- Set up error tracking (Sentry, etc.)
- Enable 2FA on Railway and Supabase accounts

---

## 💰 Cost Estimate

**Free Tier:**

- Railway: $5/month credit (enough for small projects)
- Supabase: Free tier (500MB database, 2GB bandwidth)

**Estimated monthly cost:** $0-$5 for small/medium traffic

**If you exceed free tier:**

- Railway: ~$10-20/month
- Supabase: ~$25/month (if you need more)

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Supabase Docs](https://supabase.com/docs)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Astro Deployment](https://docs.astro.build/en/guides/deploy/)

---

## 🆘 Need Help?

1. Check Railway logs first
2. Check Supabase project status
3. Verify all environment variables are set
4. Test backend `/health` endpoint
5. Review this guide's troubleshooting section

**Still stuck?** Open an issue on GitHub with:

- Error message
- Railway deployment logs
- Steps you've completed
- What you expected vs what happened

---

**Deployment Guide Version:** 1.0  
**Last Updated:** November 2025  
**Tested On:** Railway (Nixpacks), Supabase (Postgres 15)
