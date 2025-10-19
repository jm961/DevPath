# Database Setup Guide

## Prerequisites

You need PostgreSQL installed on your system.

### Install PostgreSQL

**macOS (using Homebrew):**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Or download from:** https://www.postgresql.org/download/

## Setup Steps

### 1. Create Database

Connect to PostgreSQL:

```bash
psql postgres
```

Create the database and user:

```sql
CREATE DATABASE devpath_db;
CREATE USER devpath_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE devpath_db TO devpath_user;
\q
```

### 2. Configure Environment Variables

Edit the `.env` file in the backend directory with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=devpath_db
DB_USER=devpath_user
DB_PASSWORD=your_secure_password
JWT_SECRET=generate_a_random_secret_here
```

**Important:** Change the `JWT_SECRET` to a random string. You can generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Initialize Database Tables

```bash
npm run init-db
```

This will create:

- `users` table for user authentication
- `user_progress` table for tracking learning progress
- Necessary indexes for performance

### 5. Start the Server

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The API will be available at: `http://localhost:4000`

## Test the Connection

1. **Health Check:**

   ```bash
   curl http://localhost:4000/health
   ```

2. **Create a User:**

   ```bash
   curl -X POST http://localhost:4000/api/v1-signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

3. **Login:**
   ```bash
   curl -X POST http://localhost:4000/api/v1-login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

## API Endpoints

### Public Endpoints

- `POST /api/v1-signup` - Create new user
- `POST /api/v1-login` - Login user

### Protected Endpoints (require Bearer token)

- `GET /api/v1-me` - Get current user info
- `PATCH /api/v1-update-profile` - Update user profile
- `PATCH /api/v1-update-password` - Change password
- `PATCH /api/v1-toggle-mark-resource-done` - Toggle resource completion
- `GET /api/v1-get-user-resource-progress` - Get user progress

## Database Schema

### users table

- `id` - Serial primary key
- `email` - Unique user email
- `password_hash` - Bcrypt hashed password
- `name` - User's display name
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### user_progress table

- `id` - Serial primary key
- `user_id` - Foreign key to users
- `resource_type` - Type of resource (roadmap, guide, etc.)
- `resource_id` - ID of the resource
- `topic_id` - Specific topic within resource
- `completed_at` - Completion timestamp

## Troubleshooting

### Connection Issues

1. Verify PostgreSQL is running:

   ```bash
   brew services list
   # or
   pg_isready
   ```

2. Test database connection:

   ```bash
   psql -U devpath_user -d devpath_db -h localhost
   ```

3. Check environment variables are loaded:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.DB_NAME)"
   ```

### Common Errors

**"role does not exist"**

- Create the database user as shown in step 1

**"database does not exist"**

- Create the database as shown in step 1

**"password authentication failed"**

- Verify credentials in `.env` match those created in PostgreSQL

**"JWT_SECRET is not defined"**

- Ensure `.env` file exists and has JWT_SECRET set
