# DevPath Backend API

Backend API for DevPath application with authentication and progress tracking.

## 🚀 Quick Start

### Option 1: Supabase (Recommended for Production) ⭐

**Best for:** Cloud deployment with managed database

```bash
cd backend
./setup-supabase.sh
```

This will guide you through:

- ✅ Supabase project setup
- ✅ Secure JWT secret generation
- ✅ Environment configuration
- ✅ Database initialization
- ✅ Dependencies installation

Then start the server:

```bash
npm run dev
```

📖 **For deployment:** See [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md) for complete Supabase deployment guide with Render, Railway, Vercel, and more.

---

### Option 2: Local PostgreSQL (For Development)

**Best for:** Local development and testing

```bash
cd backend
./quick-setup.sh
```

This will:

- ✅ Check PostgreSQL installation and status
- ✅ Create local database
- ✅ Generate secure environment variables
- ✅ Install dependencies
- ✅ Initialize database tables

Then start the server:

```bash
npm run dev
```

---

### Option 3: Manual Setup

If you prefer manual configuration, see [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

## 📋 Available Scripts

- `npm run dev` - Start server in development mode with auto-reload
- `npm start` - Start server in production mode
- `npm run setup` - Interactive environment configuration
- `npm run setup:supabase` - **Automated Supabase setup (recommended)** ⭐
- `npm run init-db` - Initialize/recreate database tables
- `npm run reset-db` - Drop all tables (destructive!)

## 🧪 Testing

### Run Full Test Suite

```bash
./test-api.sh
```

This tests all endpoints including:

- Health check
- User signup and login
- Profile management
- Authentication and authorization
- Error handling

### Manual Testing

**Health Check:**

```bash
curl http://localhost:4000/health
```

**Create User:**

```bash
curl -X POST http://localhost:4000/api/v1-signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123","name":"John Doe"}'
```

**Login:**

```bash
curl -X POST http://localhost:4000/api/v1-login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123"}'
```

For more examples, see [API_EXAMPLES.http](./API_EXAMPLES.http) (use with REST Client VS Code extension).

## 📚 API Documentation

Full API documentation is available in [API.md](./API.md).

### Quick Reference

#### Public Endpoints

- `POST /api/v1-signup` - Register new user
- `POST /api/v1-login` - Login

#### Protected Endpoints (require Bearer token)

- `GET /api/v1-me` - Get current user profile
- `PATCH /api/v1-update-profile` - Update profile
- `PATCH /api/v1-update-password` - Change password
- `PATCH /api/v1-toggle-mark-resource-done` - Toggle topic completion
- `GET /api/v1-get-user-resource-progress` - Get user progress

## 🗄️ Database Schema

### users table

| Column        | Type         | Constraints     | Description            |
| ------------- | ------------ | --------------- | ---------------------- |
| id            | SERIAL       | PRIMARY KEY     | User ID                |
| email         | VARCHAR(255) | UNIQUE NOT NULL | Email address          |
| password_hash | VARCHAR(255) | NOT NULL        | Bcrypt hashed password |
| name          | VARCHAR(255) |                 | Display name           |
| created_at    | TIMESTAMP    | DEFAULT NOW()   | Account creation       |
| updated_at    | TIMESTAMP    | DEFAULT NOW()   | Last update            |

### user_progress table

| Column        | Type         | Constraints                            | Description                |
| ------------- | ------------ | -------------------------------------- | -------------------------- |
| id            | SERIAL       | PRIMARY KEY                            | Progress ID                |
| user_id       | INTEGER      | REFERENCES users(id) ON DELETE CASCADE | User reference             |
| resource_type | VARCHAR(50)  | NOT NULL                               | Type (roadmap, guide, etc) |
| resource_id   | VARCHAR(100) | NOT NULL                               | Resource identifier        |
| topic_id      | VARCHAR(100) | NOT NULL                               | Topic identifier           |
| completed_at  | TIMESTAMP    | DEFAULT NOW()                          | Completion time            |

**Unique constraint:** (user_id, resource_type, resource_id, topic_id)

## 🔧 Configuration

Environment variables in `.env`:

```bash
# Database (Option A: single connection string)
DATABASE_URL=postgres://postgres:password@host:5432/postgres

# Database (Option B: individual params)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=devpath_db
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=4000
FRONTEND_URL=http://localhost:4321

# Security
JWT_SECRET=your_secure_random_secret
JWT_EXPIRES_IN=7d
```

Notes:

- If `DATABASE_URL` is set (e.g., from Supabase), it will be used and SSL will be enabled automatically in production.
- Otherwise the individual DB params are used.
- Never commit `.env` to version control. Use `.env.example` as a template.

## 🛠️ Tech Stack

- **Node.js** & **Express** - Server framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment configuration

## 📦 Dependencies

```json
{
  "bcryptjs": "^2.4.3", // Password hashing
  "cookie-parser": "^1.4.6", // Cookie parsing
  "cors": "^2.8.5", // CORS middleware
  "dotenv": "^16.3.1", // Environment variables
  "express": "^4.18.2", // Web framework
  "jsonwebtoken": "^9.0.2", // JWT tokens
  "pg": "^8.11.3" // PostgreSQL client
}
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ JWT authentication with expiration
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Protected routes with authentication middleware

## 🐛 Troubleshooting

### PostgreSQL Connection Issues

1. **Check if PostgreSQL is running:**

   ```bash
   pg_isready
   ```

2. **Start PostgreSQL:**

   ```bash
   brew services start postgresql@15
   ```

3. **Verify database exists:**

   ```bash
   psql -l | grep devpath_db
   ```

4. **Using Supabase**

- Ensure `DATABASE_URL` is set from Supabase (Settings > Database > Connection Info)
- Supabase requires SSL; the server enables it automatically in production
- Initialize tables with:

  ```bash
  npm run init-db
  ```

### JWT Token Issues

- Ensure `JWT_SECRET` is set in `.env`
- Check token hasn't expired (default: 7 days)
- Verify `Authorization: Bearer <token>` header format

### Database Tables Missing

```bash
npm run init-db
```

## 📝 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   └── progressController.js # Progress tracking
│   ├── middleware/
│   │   └── auth.js              # JWT verification
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   └── progress.js          # Progress routes
│   ├── scripts/
│   │   ├── init-db.js           # Database initialization
│   │   └── reset-db.js          # Database reset
│   └── server.js                # Main server file
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Environment template
├── package.json                 # Dependencies
├── quick-setup.sh              # Automated setup script
├── test-api.sh                 # API test suite
├── API.md                      # Full API documentation
└── README.md                   # This file
```

## 📄 License

MIT
