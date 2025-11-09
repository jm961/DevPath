# 🚀 Railway Deployment - Quick Start Commands

> **Copy-paste these commands in order. No guesswork, just execution.**

---

## 1️⃣ Generate JWT Secret (Local Machine)

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**→ Copy the output and save it. You'll use this as `JWT_SECRET` in Railway.**

---

## 2️⃣ Supabase Database Setup

### Get Connection String

1. Go to https://supabase.com/dashboard
2. Create new project (or select existing)
3. Go to **Project Settings** → **Database**
4. Copy the **Connection string (URI)**
5. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`
6. Replace `[YOUR-PASSWORD]` with your actual Supabase database password


postgresql://postgres:70852190Jme@db.zylbnzptiktszbutpelm.supabase.co:5432/postgres
**→ Save this connection string. You'll use it as `DATABASE_URL` in Railway.**

---

## 3️⃣ Railway Backend Environment Variables

**Copy this template and fill in your values:**

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres:70852190Jme@db.zylbnzptiktszbutpelm.supabase.co:5432/postgres
JWT_SECRET=90eb2870ad21d43d93609f35edf54b03a09f524e6e5c4143dbd0aced8316191c8d310752b47f523adddac3cff2d664a2441378b92640a606c4b731926c6bc5d6
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://devpath.up.railway.app,https://*.vercel.app,http://localhost:3000
PUBLIC_API_URL=https://devpath-api.up.railway.app/api
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Add these in Railway:**

1. Create new service from GitHub repo
2. Set **Root Directory** to: `backend`
3. Set **Service Name** to: `devpath-api`
4. Go to **Variables** tab
5. Click **"New Variable"** for each variable above

---

## 4️⃣ Initialize Database (After Backend Deploys)

**In Railway Shell (or using Railway CLI):**

```bash
npm run init-db
```

**Expected output:**

```
✅ Creating users table...
✅ Creating progress table...
✅ Creating indexes...
✅ Database initialized successfully!
```

---

## 5️⃣ Test Backend Health

**In your browser or terminal:**

```bash
curl https://YOUR-BACKEND-DOMAIN.up.railway.app/health
```

**Expected response:**

```json
{
  "status": "ok",
  "message": "DevPath API is running",
  "environment": "production",
  "database": "connected",
  "timestamp": "2025-11-09T..."
}
```

✅ If you see this, backend is working!

---

## 6️⃣ Railway Frontend Environment Variables

**After backend is deployed and you have the Railway domain:**

```bash
PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN.up.railway.app/api
PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
PORT=3000
```

**Get Supabase keys:**

1. Supabase Dashboard → **Settings** → **API**
2. Copy **Project URL** → use as `PUBLIC_SUPABASE_URL`
3. Copy **anon/public key** → use as `PUBLIC_SUPABASE_ANON_KEY`

**Add these in Railway:**

1. Create new service from same GitHub repo
2. Set **Root Directory** to: `/` (root)
3. Set **Service Name** to: `devpath-frontend`
4. Set **Build Command** to: `npm install --legacy-peer-deps && npm run build`
5. Set **Start Command** to: `npm start`
6. Go to **Variables** tab
7. Add each variable above

---

## 7️⃣ Update Backend CORS (After Frontend Deploys)

**Update the `FRONTEND_URL` variable in backend:**

```bash
FRONTEND_URL=https://YOUR-FRONTEND-DOMAIN.up.railway.app,https://*.vercel.app,http://localhost:3000
```

Railway will auto-redeploy the backend.

---

## 8️⃣ Test Everything

### Test User Registration:

```bash
curl -X POST https://YOUR-BACKEND-DOMAIN.up.railway.app/api/v1-signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456!"
  }'
```

### Test Frontend:

1. Open `https://YOUR-FRONTEND-DOMAIN.up.railway.app`
2. Register a new user
3. Login
4. Save some roadmap progress
5. Refresh page - progress should persist

---

## 9️⃣ Custom Domains (Optional)

### Backend Domain: `api.devpath.sh`

**In Railway:**

1. Go to backend service → **Settings** → **Networking**
2. Click **"Custom Domain"** → Enter `api.devpath.sh`
3. Railway shows CNAME record

**In DNS Provider (Cloudflare/GoDaddy/etc):**

```
Type: CNAME
Name: api
Value: <value-from-railway>
Proxy: OFF (if Cloudflare)
```

### Frontend Domain: `devpath.sh`

**In Railway:**

1. Go to frontend service → **Settings** → **Networking**
2. Click **"Custom Domain"** → Enter `devpath.sh`

**In DNS Provider:**

```
Type: CNAME
Name: @
Value: <value-from-railway>
```

### Update Environment Variables (After domains are active):

**Backend:**

```bash
PUBLIC_API_URL=https://api.devpath.sh/api
FRONTEND_URL=https://devpath.sh,https://www.devpath.sh,https://*.vercel.app
```

**Frontend:**

```bash
PUBLIC_API_URL=https://api.devpath.sh/api
```

---

## 🔟 Railway CLI (Optional - for local management)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project (run in project directory)
cd /Users/jm_eid/Developer/DevPath
railway link

# View logs
railway logs

# Run commands in Railway environment
railway run npm run init-db
```

---

## 🐛 Troubleshooting Commands

### View Railway Logs:

```bash
railway logs --service devpath-api
railway logs --service devpath-frontend
```

### Test Database Connection (Local):

```bash
psql "postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"
```

### Reset Database (if needed):

```bash
# In Railway shell or CLI
npm run reset-db
npm run init-db
```

### Check Server Status:

```bash
# Health check
curl https://api.devpath.sh/health

# With verbose output
curl -v https://api.devpath.sh/health
```

---

## 📊 Monitoring Commands

### Check Railway Service Status:

```bash
railway status
```

### Check Railway Variables:

```bash
railway variables
```

### View Recent Deployments:

```bash
railway deployments
```

---

## ✅ Success Indicators

**Backend is ready when:**

- ✅ `/health` returns 200 with `"database": "connected"`
- ✅ No errors in Railway deployment logs
- ✅ Service shows "Active" in Railway dashboard

**Frontend is ready when:**

- ✅ Homepage loads without errors
- ✅ Browser console has no CORS errors
- ✅ Registration/login works
- ✅ Service shows "Active" in Railway dashboard

**Database is ready when:**

- ✅ Supabase shows tables: `users`, `progress`
- ✅ Test user exists in `users` table
- ✅ No connection errors in backend logs

---

## 🚨 Emergency Rollback

**If deployment fails:**

```bash
# Via Railway Dashboard:
1. Go to service → Deployments
2. Find last working deployment
3. Click "..." → "Redeploy"

# Via Railway CLI:
railway rollback
```

---

## 📞 Quick Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Railway Docs**: https://docs.railway.app
- **This Project Guide**: See `RAILWAY_DEPLOYMENT.md`

---

**Total Time:** 30-40 minutes  
**Difficulty:** ⭐⭐ (Beginner-friendly)  
**Cost:** $0-5/month

---

**Last Updated:** November 2025  
**Tested With:** Railway Nixpacks, Node.js 18.x, Supabase Postgres 15
