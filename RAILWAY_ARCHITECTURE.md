# 🎯 Railway Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      DEVPATH DEPLOYMENT                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │         │              │         │              │
│   FRONTEND   │────────▶│   BACKEND    │────────▶│   DATABASE   │
│   (Astro)    │         │   (Express)  │         │  (Supabase)  │
│              │         │              │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
     Railway                 Railway               Postgres 15.x
  devpath.sh             api.devpath.sh
```

---

## 📁 Repository Structure

```
DevPath/
├── frontend (root)           → Railway Service 1
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── astro.config.mjs
│   └── railway.json          ✅ Updated for frontend
│
└── backend/                  → Railway Service 2
    ├── src/
    │   ├── server.js         ✅ Updated health check
    │   ├── routes/
    │   ├── controllers/
    │   ├── models/
    │   └── config/
    ├── package.json
    ├── railway.json          ✅ Updated with healthcheck
    └── railway.toml          ✅ New configuration file
```

---

## 🔧 Configuration Files

### ✅ `/backend/railway.json`

```json
{
  "deploy": {
    "startCommand": "node src/server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

### ✅ `/backend/railway.toml`

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install"

[deploy]
startCommand = "node src/server.js"
healthcheckPath = "/health"
```

### ✅ `/railway.json` (Frontend)

```json
{
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100
  }
}
```

---

## 🌐 Network Flow

```
User Request → Cloudflare DNS → Railway Edge → Your Service
     ↓              ↓              ↓              ↓
devpath.sh → CNAME Record → Railway CDN → Frontend (Astro)
                                             ↓
                                    API Call (fetch)
                                             ↓
api.devpath.sh → CNAME Record → Railway CDN → Backend (Express)
                                                  ↓
                                          Database Query
                                                  ↓
                                          Supabase (PostgreSQL)
```

---

## 🔐 Environment Variables

### Backend (`devpath-api`)

```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
JWT_SECRET=<64-byte-hex>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://devpath.sh,...
PUBLIC_API_URL=https://api.devpath.sh/api
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (`devpath-frontend`)

```
PUBLIC_API_URL=https://api.devpath.sh/api
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<key>
PORT=3000
```

---

## 🚀 Deployment Steps Summary

```
1. Setup Supabase
   └─▶ Get DATABASE_URL

2. Deploy Backend to Railway
   ├─▶ Set root directory: backend
   ├─▶ Add environment variables
   ├─▶ Deploy
   └─▶ Run: npm run init-db

3. Deploy Frontend to Railway
   ├─▶ Set root directory: / (root)
   ├─▶ Add environment variables
   └─▶ Deploy

4. Configure Custom Domains (optional)
   ├─▶ Add api.devpath.sh → backend
   ├─▶ Add devpath.sh → frontend
   └─▶ Update DNS CNAME records

5. Test Everything
   ├─▶ /health endpoint
   ├─▶ User registration
   ├─▶ User login
   └─▶ Progress save/load
```

---

## 📊 Service Health Indicators

### ✅ Backend Health Check

**Endpoint:** `GET /health`

**Success Response (200):**

```json
{
  "status": "ok",
  "message": "DevPath API is running",
  "environment": "production",
  "database": "connected",
  "timestamp": "2025-11-09T12:34:56.789Z"
}
```

**Failure Response (503):**

```json
{
  "status": "error",
  "message": "Service unavailable",
  "environment": "production",
  "database": "disconnected",
  "timestamp": "2025-11-09T12:34:56.789Z"
}
```

### ✅ Frontend Health Check

**Endpoint:** `GET /`

**Success:** Homepage loads with status 200  
**Failure:** 500/503 error or blank page

---

## 🗄️ Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Progress Table
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  roadmap_id VARCHAR(255),
  topic_id VARCHAR(255),
  done BOOLEAN,
  skipped BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, roadmap_id, topic_id)
);
```

---

## 🔄 Auto-Deploy Flow

```
GitHub Push
    ↓
Railway Webhook Trigger
    ↓
Build Phase (Nixpacks)
    ├─▶ npm install
    └─▶ npm run build (frontend only)
    ↓
Health Check
    ├─▶ /health returns 200?
    │   ├─▶ YES: Deploy Success ✅
    │   └─▶ NO: Keep old version, alert ❌
    ↓
Live Traffic Switched
```

---

## 💰 Cost Breakdown

```
┌─────────────────┬──────────┬────────────┐
│ Service         │ Free     │ Paid       │
├─────────────────┼──────────┼────────────┤
│ Railway         │ $5 credit│ ~$10-20/mo │
│ Supabase        │ 500MB DB │ $25/mo     │
│ Cloudflare DNS  │ Free     │ Free       │
│ SSL Certs       │ Free     │ Free       │
├─────────────────┼──────────┼────────────┤
│ TOTAL           │ ~$0-5/mo │ ~$35-45/mo │
└─────────────────┴──────────┴────────────┘
```

---

## 🛡️ Security Layers

```
1. DNS Level
   └─▶ Cloudflare DDoS Protection

2. Network Level
   └─▶ Railway Edge Network

3. Application Level
   ├─▶ Helmet.js (Security Headers)
   ├─▶ CORS (Origin Restriction)
   ├─▶ Rate Limiting (Anti-Abuse)
   └─▶ JWT Authentication

4. Database Level
   ├─▶ SSL Required
   ├─▶ Connection Pooling
   └─▶ Supabase Row-Level Security (optional)
```

---

## 📈 Scaling Strategy

```
Traffic Growth → Railway Auto-Scales

Low Traffic (< 1000 users/day)
├─▶ Railway Starter Plan
└─▶ Supabase Free Tier

Medium Traffic (1000-10000 users/day)
├─▶ Railway Pro Plan
└─▶ Supabase Pro Plan

High Traffic (> 10000 users/day)
├─▶ Railway Enterprise
├─▶ Supabase Pro/Team
└─▶ Consider CDN for static assets
```

---

## 🐛 Debug Checklist

```
❌ Frontend not loading?
   └─▶ Check Railway deployment logs
   └─▶ Verify PUBLIC_API_URL is set
   └─▶ Check DNS propagation

❌ CORS errors?
   └─▶ Verify FRONTEND_URL includes frontend domain
   └─▶ Check backend logs for blocked requests

❌ Database errors?
   └─▶ Verify DATABASE_URL is correct
   └─▶ Check Supabase project is active
   └─▶ Run: npm run init-db

❌ Authentication failing?
   └─▶ Verify JWT_SECRET is set
   └─▶ Check user exists in database
   └─▶ Verify password hash algorithm

❌ 502/503 errors?
   └─▶ Check /health endpoint
   └─▶ Verify Railway service is running
   └─▶ Check resource limits
```

---

## 📚 Key Files Reference

| File                    | Purpose                    | Required Changes             |
| ----------------------- | -------------------------- | ---------------------------- |
| `backend/railway.json`  | Backend deployment config  | ✅ Added healthcheck         |
| `backend/railway.toml`  | Alternative config         | ✅ Created                   |
| `railway.json`          | Frontend deployment config | ✅ Updated start command     |
| `backend/src/server.js` | API server                 | ✅ Enhanced /health endpoint |
| `backend/.env.example`  | Environment template       | ✅ Already complete          |
| `package.json` (root)   | Frontend dependencies      | ✅ Already correct           |
| `backend/package.json`  | Backend dependencies       | ✅ Already correct           |

---

## ✅ Pre-Flight Checklist

Before deploying, ensure:

- [x] Code committed and pushed to GitHub
- [x] Railway account created
- [x] Supabase project created
- [x] JWT_SECRET generated
- [x] All `.env.example` values documented
- [x] `railway.json` files configured
- [x] Health endpoints implemented

---

## 🎓 Learning Resources

- **Railway Docs**: https://docs.railway.app
- **Supabase Guides**: https://supabase.com/docs/guides
- **Astro Deployment**: https://docs.astro.build/en/guides/deploy/
- **Express Security**: https://expressjs.com/en/advanced/best-practice-security.html

---

**Architecture Version:** 1.0  
**Last Updated:** November 2025  
**Compatibility:** Railway Nixpacks, Node.js 18.x, Postgres 15.x
