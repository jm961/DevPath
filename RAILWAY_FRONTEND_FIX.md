# 🚨 Frontend Railway Deployment Fix

## ⚠️ Issue
Frontend health check failing at path `/` with service unavailable errors.

## 🔍 Root Cause Analysis

The frontend (Astro) deployment can fail for several reasons:

1. **Build not completing** - `npm run build` might be failing
2. **Start command issues** - Astro preview not starting correctly
3. **Port binding** - Not listening on the correct host/port
4. **Health check timeout too short** - Astro takes time to start

## ✅ Fixes Applied

### 1. Increased Health Check Timeout
- **Changed:** 100s → 300s (5 minutes)
- **File:** `railway.json`

### 2. Explicit Build Command
- **Added:** `"buildCommand": "npm install --legacy-peer-deps && npm run build"`
- **File:** `railway.json`

### 3. Verified Start Command
- **Command:** `astro preview --host 0.0.0.0 --port ${PORT:-3000}`
- **Why:** Railway requires binding to `0.0.0.0` not `localhost`

---

## 🚀 Railway Configuration Checklist

### In Railway Dashboard → Frontend Service → Settings:

**Service Settings:**
- ✅ **Service Name:** `devpath-frontend`
- ✅ **Root Directory:** `/` (or leave blank - means root)

**Build Settings (might need manual configuration):**
- ✅ **Build Command:** `npm install --legacy-peer-deps && npm run build`
- ✅ **Start Command:** `npm start`

**Environment Variables:**
Go to **Variables** tab and add:
```bash
PORT=3000
PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN.up.railway.app/api
PUBLIC_SUPABASE_URL=https://zylbnzptiktszbutpelm.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bGJuenB0aWt0c3pidXRwZWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwOTM3OTgsImV4cCI6MjA0NjY2OTc5OH0.YOUR_KEY_HERE
```

---

## 🐛 Alternative Fix: Disable Health Check Temporarily

If the above doesn't work, try **disabling the health check** to see if the service starts:

### Option A: Remove Health Check from railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install --legacy-peer-deps && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Option B: Use a Simple Health Endpoint

Since Astro doesn't have a built-in health endpoint, we could:
1. Remove `healthcheckPath` from config (let Railway check if the port is open)
2. OR create a simple `public/health` file that just returns text

---

## 🔧 Manual Deployment Steps

If auto-deploy isn't working, try these steps:

### 1. Check Railway Deployment Logs

1. Railway Dashboard → Frontend Service
2. Click **Deployments** tab
3. Click on the failed deployment
4. Look for errors in the logs

**Common errors to look for:**

**Build failed:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```
**Fix:** Make sure `--legacy-peer-deps` is in the build command

**Astro build error:**
```
Error: Cannot find module '@astrojs/...'
```
**Fix:** Dependencies not installed correctly - check build command

**Port binding error:**
```
Error: listen EADDRINUSE
```
**Fix:** Railway's PORT env var not being used - already fixed ✅

### 2. Verify Build Locally

Test the build locally to ensure it works:

```bash
cd /Users/jm_eid/Developer/DevPath

# Clean install
rm -rf node_modules
npm install --legacy-peer-deps

# Build
npm run build

# Check dist folder exists
ls -la dist/

# Test preview locally
npm start
```

If this works locally, the issue is Railway-specific configuration.

### 3. Check Railway Service Configuration

In Railway Dashboard:

**Settings → Service:**
- Builder: Nixpacks ✅
- Watch Paths: (leave default)

**Settings → Deploy:**
Check what Railway is actually using for:
- Build Command
- Start Command
- Root Directory

These might override `railway.json`!

---

## 💡 Quick Fix: Use Railway's Service Variables Override

Instead of relying on `railway.json`, set the commands directly in Railway:

1. Go to Railway → Frontend Service → **Settings**
2. Scroll to **Deploy** section
3. Click **Configure** next to Build Command
4. Enter: `npm install --legacy-peer-deps && npm run build`
5. Click **Configure** next to Start Command  
6. Enter: `npm start`
7. Save and redeploy

---

## 🎯 Expected Successful Deployment

When working, you should see in Railway logs:

```
[build] > npm install --legacy-peer-deps
[build] added 500 packages
[build] > npm run build
[build] Building for production...
[build] ✓ Built in 30s
[deploy] > npm start
[deploy] astro preview --host 0.0.0.0 --port 3000
[deploy] Server listening on http://0.0.0.0:3000
```

---

## 🚨 If Still Failing: Simplified Approach

Try this minimal `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

And let Nixpacks auto-detect everything from `package.json` and `nixpacks.toml`.

---

## 📊 Debugging Commands

### Check if Astro builds successfully:
```bash
cd /Users/jm_eid/Developer/DevPath
npm run build
echo $?  # Should output 0 if successful
```

### Test the start command locally:
```bash
PORT=3000 npm start
# Then visit http://localhost:3000
```

### Check Railway logs in real-time:
```bash
railway logs --service devpath-frontend
```

---

## ✅ Success Indicators

Frontend is deployed when:

- ✅ Railway dashboard shows "Active"
- ✅ Build logs show "Built in X seconds"
- ✅ Start logs show "Server listening on..."
- ✅ Opening the Railway URL shows your site
- ✅ No 502/503 errors

---

## 📝 Next Steps

1. **Commit and push the latest railway.json fix**
2. **Wait for Railway auto-deploy (or trigger manually)**
3. **Check deployment logs for specific errors**
4. **If still failing, try the "Manual Deployment Steps" above**
5. **Report the exact error from logs for more specific help**

---

**Fix Version:** 2.0  
**Date:** November 9, 2025  
**Status:** Awaiting deployment test
