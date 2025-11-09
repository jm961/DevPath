# 🚂 Railway Deployment Quick Checklist

Use this checklist when deploying to Railway. Print it out or keep it open in a separate tab.

---

## 📋 Pre-Deployment (5 min)

- [ ] Code pushed to GitHub `main` branch
- [ ] Railway account created (https://railway.app)
- [ ] Supabase account created (https://supabase.com)
- [ ] Node.js 18.x installed locally

---

## 🗄️ Database Setup (5 min)

- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] Connection string copied from Supabase Settings → Database
- [ ] Password replaced in connection string

**Connection string format:**

```
postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
```

---

## 🚂 Backend Deployment (10 min)

### Railway Setup

- [ ] Railway project created
- [ ] GitHub repo connected to Railway
- [ ] Service name set to: `devpath-api`
- [ ] Root directory set to: `backend`

### Environment Variables Set

- [ ] `NODE_ENV=production`
- [ ] `PORT=4000`
- [ ] `DATABASE_URL=postgresql://...` (from Supabase)
- [ ] `JWT_SECRET=...` (generated with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `FRONTEND_URL=https://devpath.up.railway.app,https://*.vercel.app,http://localhost:3000`
- [ ] `PUBLIC_API_URL=https://devpath-api.up.railway.app/api`
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=100`

### Deployment

- [ ] Backend deployed successfully (green checkmark)
- [ ] Railway domain generated (Settings → Networking → Generate Domain)
- [ ] Backend URL saved: `_______________________`
- [ ] Database initialized (`npm run init-db` in Railway shell)
- [ ] Health check works: `https://your-domain.up.railway.app/health` returns 200 OK

---

## 🎨 Frontend Deployment (10 min)

### Railway Setup

- [ ] New service created in same Railway project
- [ ] Service name set to: `devpath-frontend`
- [ ] Root directory: `/` (root)
- [ ] Build command: `npm install --legacy-peer-deps && npm run build`
- [ ] Start command: `npm start`

### Environment Variables Set

- [ ] `PUBLIC_API_URL=https://devpath-api.up.railway.app/api`
- [ ] `PUBLIC_SUPABASE_URL=https://xxx.supabase.co`
- [ ] `PUBLIC_SUPABASE_ANON_KEY=...` (from Supabase Settings → API)
- [ ] `PORT=3000`

### Update Backend CORS

- [ ] Backend `FRONTEND_URL` updated to include frontend Railway domain
- [ ] Backend redeployed with new FRONTEND_URL

### Deployment

- [ ] Frontend deployed successfully
- [ ] Frontend domain generated
- [ ] Frontend loads without errors
- [ ] API calls working (check browser console)

---

## 🌐 Custom Domains (Optional, 15 min)

### Backend Domain (`api.devpath.sh`)

- [ ] Custom domain added in Railway (Settings → Networking → Custom Domain)
- [ ] CNAME record added to DNS provider
- [ ] DNS propagated (5-10 minutes)
- [ ] SSL certificate issued by Railway
- [ ] Health check works on custom domain

### Frontend Domain (`devpath.sh`)

- [ ] Custom domain added in Railway
- [ ] CNAME record added to DNS provider
- [ ] DNS propagated
- [ ] SSL certificate issued
- [ ] Site loads on custom domain

### Update Environment Variables

- [ ] Backend `PUBLIC_API_URL=https://api.devpath.sh/api`
- [ ] Backend `FRONTEND_URL=https://devpath.sh,https://www.devpath.sh`
- [ ] Frontend `PUBLIC_API_URL=https://api.devpath.sh/api`
- [ ] Both services redeployed

---

## ✅ Testing & Verification (5 min)

### Backend Tests

- [ ] `/health` endpoint returns 200 OK
- [ ] Response shows `"database": "connected"`
- [ ] Response shows `"environment": "production"`

### Frontend Tests

- [ ] Homepage loads
- [ ] No console errors
- [ ] User registration works
- [ ] User login works
- [ ] Roadmap progress saves
- [ ] Roadmap progress loads

### Database Tests

- [ ] Supabase table editor shows tables: `users`, `progress`
- [ ] Test user created in database
- [ ] Progress records visible

---

## 📊 Post-Deployment (5 min)

- [ ] Railway logs checked for errors
- [ ] Supabase usage checked (should be minimal)
- [ ] All environment variables documented
- [ ] Deployment date recorded: `_______________________`
- [ ] Railway project URL bookmarked
- [ ] Supabase project URL bookmarked

---

## 🔒 Security Verification

- [ ] All `.env` files in `.gitignore`
- [ ] No secrets in GitHub repo
- [ ] Railway environment variables private
- [ ] CORS restricted to specific domains
- [ ] Rate limiting enabled
- [ ] HTTPS/SSL active on both services

---

## 🐛 Common Issues & Quick Fixes

### Backend won't connect to database

✅ Fix: Verify `DATABASE_URL` in Railway variables matches Supabase exactly

### CORS error on frontend

✅ Fix: Add frontend domain to backend `FRONTEND_URL` variable

### Frontend shows API error

✅ Fix: Check `PUBLIC_API_URL` matches backend Railway domain

### Database tables not found

✅ Fix: Run `npm run init-db` in Railway backend shell

### Build fails

✅ Fix: Check Railway deployment logs, verify root directory is set correctly

---

## 📞 Emergency Contacts

**Railway Support:**

- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app

**Supabase Support:**

- Discord: https://discord.supabase.com
- Docs: https://supabase.com/docs

---

## 🎯 Success Criteria

Your deployment is successful when ALL of these are true:

✅ Backend `/health` returns 200 OK  
✅ Frontend loads without errors  
✅ User can register  
✅ User can login  
✅ Progress saves and loads  
✅ No CORS errors in console  
✅ Both services show "Active" in Railway  
✅ Database shows data in Supabase

---

**Total Estimated Time:** 35-45 minutes  
**Difficulty:** Beginner-friendly  
**Cost:** $0-5/month (free tier)

---

Print this checklist and check off items as you go! 📝
