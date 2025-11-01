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

### Option 1: Docker Compose (Recommended for VPS/Cloud)

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

### Option 2: Railway

1. **Install Railway CLI:**

   ```bash
   npm i -g @railway/cli
   ```

2. **Login and initialize:**

   ```bash
   railway login
   railway init
   ```

3. **Add PostgreSQL:**

   ```bash
   railway add -p postgres
   ```

4. **Set environment variables:**

   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=<your-generated-secret>
   railway variables set FRONTEND_URL=https://your-frontend.com
   # Railway automatically sets DATABASE_URL for postgres
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

### Option 3: Render

1. **Create new Web Service** on Render dashboard
2. **Connect your GitHub repository**
3. **Configure:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Add all variables from `.env.example`
4. **Add PostgreSQL database** from Render dashboard
5. **Deploy**

### Option 4: Heroku

1. **Install Heroku CLI**
2. **Create app:**

   ```bash
   heroku create devpath-api
   ```

3. **Add PostgreSQL:**

   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set environment variables:**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=<your-secret>
   heroku config:set FRONTEND_URL=https://your-frontend.com
   ```

5. **Deploy:**

   ```bash
   git push heroku main
   ```

6. **Initialize database:**
   ```bash
   heroku run npm run init-db
   ```

### Option 5: DigitalOcean App Platform

1. **Create new App** from GitHub repository
2. **Add PostgreSQL database** component
3. **Configure environment variables** in dashboard
4. **Deploy**

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
