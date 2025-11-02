# Production Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables set in production
- [ ] Strong JWT_SECRET generated
- [ ] Database password set
- [ ] FRONTEND_URL set to production domain
- [ ] NODE_ENV=production
- [ ] SSL certificates configured (if self-hosting)
- [ ] Database backups configured

## Deployment Options

### ⭐ Option 1: Supabase + Render (Recommended)

**Best for:** Production deployments with managed database and easy hosting

See detailed guide: **[SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md)**

**Quick Steps:**

1. Create Supabase project and get DATABASE_URL
2. Deploy API on Render (or Railway/Vercel)
3. Set environment variables
4. Run `npm run init-db`

**Why this option?**

- ✅ Free tier available
- ✅ Auto-scaling database
- ✅ Built-in backups
- ✅ No database management needed
- ✅ SSL certificates included

---

### Option 2: Docker Compose (Self-hosted)

**Prerequisites:**

- Docker and Docker Compose installed
- Domain name configured

**Steps:**

1. **Clone repository on server:**

   ```bash
   git clone <your-repo-url>
   cd DevPath/backend
   ```

2. **Create production .env file:**

   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

3. **Generate secure JWT secret:**

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Start services:**

   ```bash
   docker-compose up -d
   ```

5. **Initialize database:**

   ```bash
   docker-compose exec api npm run init-db
   ```

6. **Check logs:**

   ```bash
   docker-compose logs -f api
   ```

7. **Access API:**
   ```
   http://your-server-ip:4000/health
   ```

### Option 3: Railway

**Note:** For Railway deployments, we recommend using Supabase for the database instead of Railway's PostgreSQL add-on for better scalability and management.

See **[SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md)** for complete Railway + Supabase setup instructions.

**Quick steps:**

1. Get DATABASE_URL from Supabase
2. Install Railway CLI: `npm i -g @railway/cli`
3. Login: `railway login`
4. Initialize: `railway init`
5. Set environment variables with Supabase DATABASE_URL
6. Deploy: `railway up`

### Option 4: Render

**Note:** We recommend using Supabase for the database instead of Render's PostgreSQL for better features and free tier benefits.

See **[SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md)** for complete Render + Supabase setup instructions.

**Quick steps:**

1. Get DATABASE_URL from Supabase
2. Create new Web Service on Render dashboard
3. Connect your GitHub repository
4. Configure build/start commands
5. Add environment variables including Supabase DATABASE_URL
6. Deploy

### Option 5: Heroku

**Note:** Heroku no longer offers a free tier. We recommend Render or Railway instead.

If using Heroku, consider using Supabase for the database to save costs.

See **[SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md)** for alternative platforms.

### Option 6: DigitalOcean App Platform

**Note:** We recommend using Supabase for the database.

See **[SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md)** for complete DigitalOcean + Supabase setup instructions.

**Quick steps:**

1. Get DATABASE_URL from Supabase
2. Create new App from GitHub repository
3. Configure environment variables with Supabase DATABASE_URL
4. Deploy

## Post-Deployment

### 1. Test Health Endpoint

```bash
curl https://your-api-domain.com/health
```

### 2. Test Signup

```bash
curl -X POST https://your-api-domain.com/api/v1-signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123","name":"Test User"}'
```

### 3. Configure CORS

Update `FRONTEND_URL` in production .env to match your actual frontend domain.

### 4. Set up monitoring

- Configure error tracking (Sentry)
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure database backups

### 5. SSL/HTTPS

Most platforms (Railway, Render, Heroku) provide SSL automatically.
For VPS deployments, use Let's Encrypt with Nginx/Caddy.

## Nginx Configuration (for VPS)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then install SSL:

```bash
sudo certbot --nginx -d api.yourdomain.com
```

## Environment Variables Reference

| Variable       | Description       | Example                       |
| -------------- | ----------------- | ----------------------------- |
| NODE_ENV       | Environment       | `production`                  |
| PORT           | Server port       | `4000`                        |
| DB_HOST        | Database host     | `localhost` or service name   |
| DB_PORT        | Database port     | `5432`                        |
| DB_NAME        | Database name     | `devpath`                     |
| DB_USER        | Database user     | `devpath_user`                |
| DB_PASSWORD    | Database password | Strong password               |
| JWT_SECRET     | JWT signing key   | 64+ character random string   |
| JWT_EXPIRES_IN | Token expiry      | `7d`                          |
| FRONTEND_URL   | Frontend domain   | `https://devpath.com`         |
| PUBLIC_API_URL | API base URL      | `https://api.devpath.com/api` |

## Monitoring & Maintenance

### Check logs

```bash
# Docker
docker-compose logs -f api

# Railway
railway logs

# Heroku
heroku logs --tail
```

### Database backup

```bash
# Docker
docker-compose exec postgres pg_dump -U $DB_USER $DB_NAME > backup.sql

# Restore
docker-compose exec -T postgres psql -U $DB_USER $DB_NAME < backup.sql
```

### Scaling

Most platforms allow easy scaling through their dashboard or CLI.

## Security Best Practices

1. ✅ Never commit `.env` file
2. ✅ Use strong, unique passwords
3. ✅ Enable rate limiting (already configured)
4. ✅ Keep dependencies updated: `npm audit fix`
5. ✅ Use HTTPS only in production
6. ✅ Regular database backups
7. ✅ Monitor for suspicious activity
8. ✅ Implement proper error logging

## Troubleshooting

### Can't connect to database

- Check `DATABASE_URL` or individual DB\_ variables
- Verify database is running: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`

### 500 errors

- Check API logs for stack traces
- Verify all environment variables are set
- Test database connection

### CORS errors

- Verify `FRONTEND_URL` matches your frontend domain exactly
- Include protocol (https://)
- No trailing slash

## Support

For issues, check:

1. Application logs
2. Database connectivity
3. Environment variables
4. Platform-specific documentation
