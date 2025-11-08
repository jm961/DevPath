# 🚀 Deploying DevPath (Frontend on Vercel, Backend on Railway)

This guide walks through taking the Astro frontend live on Vercel and the Express/PostgreSQL backend live on Railway. Follow the steps in order and check off each section as you go.

---

## 1. Prerequisites

- GitHub repository is up-to-date on the `main` branch.
- Supabase (or other PostgreSQL) instance provisioned and reachable from Railway.
- Domains purchased and managed in a DNS provider (e.g. Cloudflare, Route53) if you plan to use custom domains `devpath.sh` and `api.devpath.sh`.
- Vercel account connected to GitHub.
- Railway account with a team/project created.

---

## 2. Configure Environment Variables

### 2.1 Backend (`backend/.env` → Railway Project Settings)

| Variable                  | Purpose                                                                             | Example                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `NODE_ENV`                | Enable production mode                                                              | `production`                                                               |
| `PORT`                    | Railway will inject the port; keep fallback for local                               | `4000`                                                                     |
| `DATABASE_URL`            | PostgreSQL connection string (include `?sslmode=require` if your provider needs it) | `postgres://user:pass@host:port/db`                                        |
| `JWT_SECRET`              | 64-byte random string                                                               | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN`          | Token lifetime                                                                      | `7d`                                                                       |
| `FRONTEND_URL`            | Comma-separated frontend origins (supports wildcards)                               | `https://devpath.sh,https://www.devpath.sh,https://*.vercel.app`           |
| `PUBLIC_API_URL`          | Public API base URL                                                                 | `https://api.devpath.sh/api`                                               |
| `RATE_LIMIT_WINDOW_MS`    | Optional rate limit window                                                          | `900000`                                                                   |
| `RATE_LIMIT_MAX_REQUESTS` | Optional rate limit cap                                                             | `100`                                                                      |

> ℹ️ Set these in Railway under **Variables**. Railway will automatically add `PORT`, but keep the value defined so local dev still works.

### 2.2 Frontend (Vercel Project Environment Variables)

| Variable                   | Purpose                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| `PUBLIC_API_URL`           | `https://api.devpath.sh/api` (or Railway preview URL when testing) |
| `PUBLIC_SUPABASE_URL`      | Supabase project URL                                               |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key                                           |

Add the variables for **Production**, **Preview**, and optionally **Development** in the Vercel dashboard. For preview deployments you can point `PUBLIC_API_URL` to the Railway preview domain until the backend is promoted.

---

## 3. Backend on Railway

1. **Create Service**

   - Inside your Railway project choose **New → Service → Deploy from GitHub Repo**.
   - Select the `DevPath` repo and the `backend` directory when prompted. Railway detects Nixpacks automatically thanks to `railway.json`.

2. **Build & Start Commands**

   - Build: handled by Nixpacks (`npm install`).
   - Start: from `railway.json` (`node src/server.js`).

3. **Set Variables**

   - Add the variables listed in section 2.1.
   - If you use Supabase, copy the connection string from **Settings → Database**. Append `?sslmode=require` if Railway cannot connect without SSL.

4. **Deploy**

   - Trigger a deploy. Railway will install dependencies and start the service.
   - Once live, note the generated domain, e.g. `https://devpath-api.up.railway.app`.

5. **Database Migration**

   - From the Railway shell run `npm run init-db` to create the tables.
   - Validate with `railway logs` or by hitting `/health`.

6. **Custom Domain (Optional but recommended)**
   - In Railway → **Settings → Domains** add `api.devpath.sh`.
   - Railway provides the required DNS records (usually a CNAME). Add them at your DNS provider.
   - Wait for DNS to propagate and verify via Railway dashboard.

---

## 4. Frontend on Vercel

1. **Import Project**

   - In Vercel click **Add New → Project** and import the GitHub repo.
   - Vercel auto-detects Astro with the provided `vercel.json`.

2. **Project Settings**

   - Framework preset: Astro (auto).
   - Root directory: repository root (contains `astro.config.mjs`).
   - Build command: `pnpm install && pnpm run build` (Vercel sets this automatically because of `pnpm-lock.yaml`).
   - Output directory: `dist` (already configured in `vercel.json`).
   - Node.js version: 18.x (Vercel default).

3. **Environment Variables**

   - Configure the variables listed in section 2.2 for Production and Preview.
   - For preview environments you can temporarily set `PUBLIC_API_URL` to the Railway-generated domain until the custom domain is ready.

4. **First Deploy**

   - Trigger the deployment. The Astro build should succeed (confirm we ran `pnpm run build` locally already).
   - Verify the preview URL loads and can hit the backend preview domain (CORS wildcard now covers `*.vercel.app`).

5. **Custom Domain**
   - Add `devpath.sh` and `www.devpath.sh` in Vercel → **Domains**.
   - Update DNS records as instructed (A or CNAME). Enable automatic WWW redirect if desired.

---

## 5. Smoke Tests After Go-Live

- `curl https://api.devpath.sh/health` → expect `{ "status": "ok", ... }`.
- Frontend login/signup flow against production API.
- Supabase auth redirect (Google, GitHub, etc.) completes without CORS errors.
- Confirm database writes in Supabase console.
- Check Vercel and Railway logs for warnings.

---

## 6. Promotion Workflow

1. Merge to `main` → triggers both Vercel & Railway deploys via GitHub integration.
2. Railway preview environments can be promoted to production once validated.
3. Vercel preview URLs stay isolated; use them to validate frontend changes before production.

---

## 7. Troubleshooting

- **CORS errors:** ensure the origin is included in `FRONTEND_URL` (use commas and wildcards like `https://*.vercel.app`).
- **Database TLS issues:** append `?sslmode=require` to `DATABASE_URL`.
- **Railway port binding errors:** verify `PORT` is not hard-coded elsewhere; the server already reads `process.env.PORT`.
- **Astro build failures:** confirm environment variables exist in Vercel for both preview and production builds.

---

## 8. Next Steps

- Automate smoke tests with Playwright hitting the deployed URLs.
- Enable alerting (UptimeRobot, Healthchecks) on the `/health` endpoint.
- Schedule database backups via Supabase or Railway cron.

---

You are now set to ship DevPath with the frontend on Vercel and backend on Railway. ✅
