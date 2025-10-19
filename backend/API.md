# DevPath API Documentation

## Base URL

```
http://localhost:4000
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are valid for 7 days by default.

---

## Endpoints

### Health Check

#### GET `/health`

Check if the API server is running.

**Request:**

```bash
curl http://localhost:4000/health
```

**Response:**

```json
{
  "status": "ok",
  "message": "DevPath API is running"
}
```

---

### Authentication

#### POST `/api/v1-signup`

Create a new user account.

**Request:**

```bash
curl -X POST http://localhost:4000/api/v1-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address (must be unique) |
| password | string | Yes | User's password (min 6 characters recommended) |
| name | string | No | User's display name |

**Success Response (201):**

```json
{
  "status": "ok",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**

```json
{
  "status": 400,
  "message": "Email and password are required"
}
```

or

```json
{
  "status": 400,
  "message": "User already exists"
}
```

---

#### POST `/api/v1-login`

Login with existing credentials.

**Request:**

```bash
curl -X POST http://localhost:4000/api/v1-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |

**Success Response (200):**

```json
{
  "status": "ok",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**

```json
{
  "status": 401,
  "message": "Invalid credentials"
}
```

---

### User Profile

#### GET `/api/v1-me`

Get current user's profile information. **Requires authentication.**

**Request:**

```bash
curl -X GET http://localhost:4000/api/v1-me \
  -H "Authorization: Bearer <your_token>"
```

**Success Response (200):**

```json
{
  "status": "ok",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-10-18T12:00:00.000Z"
  }
}
```

**Error Response (401):**

```json
{
  "status": 401,
  "message": "Authentication required"
}
```

---

#### PATCH `/api/v1-update-profile`

Update user's profile information. **Requires authentication.**

**Request:**

```bash
curl -X PATCH http://localhost:4000/api/v1-update-profile \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | New display name |

**Success Response (200):**

```json
{
  "status": "ok",
  "message": "Profile updated successfully"
}
```

---

#### PATCH `/api/v1-update-password`

Change user's password. **Requires authentication.**

**Request:**

```bash
curl -X PATCH http://localhost:4000/api/v1-update-password \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "currentPassword123",
    "newPassword": "newSecurePassword456"
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| oldPassword | string | Yes | Current password |
| newPassword | string | Yes | New password |

**Success Response (200):**

```json
{
  "status": "ok",
  "message": "Password updated successfully"
}
```

**Error Response (400):**

```json
{
  "status": 400,
  "message": "Current password is incorrect"
}
```

---

### Progress Tracking

#### PATCH `/api/v1-toggle-mark-resource-done`

Mark a learning resource topic as complete or incomplete. **Requires authentication.**

**Request:**

```bash
curl -X PATCH http://localhost:4000/api/v1-toggle-mark-resource-done \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "roadmap",
    "resourceId": "frontend",
    "topicId": "html-basics"
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| resourceType | string | Yes | Type of resource (e.g., "roadmap", "guide") |
| resourceId | string | Yes | ID of the resource (e.g., "frontend", "backend") |
| topicId | string | Yes | ID of the specific topic within the resource |

**Success Response (200):**

```json
{
  "status": "ok",
  "message": "Progress updated",
  "completed": true
}
```

or if toggling to incomplete:

```json
{
  "status": "ok",
  "message": "Progress updated",
  "completed": false
}
```

---

#### GET `/api/v1-get-user-resource-progress`

Get user's progress for a specific resource. **Requires authentication.**

**Request:**

```bash
curl -X GET "http://localhost:4000/api/v1-get-user-resource-progress?resourceType=roadmap&resourceId=frontend" \
  -H "Authorization: Bearer <your_token>"
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| resourceType | string | Yes | Type of resource (e.g., "roadmap", "guide") |
| resourceId | string | Yes | ID of the resource (e.g., "frontend", "backend") |

**Success Response (200):**

```json
{
  "status": "ok",
  "progress": [
    {
      "topic_id": "html-basics",
      "completed_at": "2025-10-18T12:30:00.000Z"
    },
    {
      "topic_id": "css-fundamentals",
      "completed_at": "2025-10-18T13:00:00.000Z"
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "status": 400,
  "message": "Descriptive error message"
}
```

### 401 Unauthorized

```json
{
  "status": 401,
  "message": "Authentication required"
}
```

or

```json
{
  "status": 401,
  "message": "Invalid or expired token"
}
```

### 404 Not Found

```json
{
  "status": 404,
  "message": "Endpoint not found"
}
```

### 500 Internal Server Error

```json
{
  "status": 500,
  "message": "Internal server error"
}
```

---

## Database Schema

### users

| Column        | Type         | Description                    |
| ------------- | ------------ | ------------------------------ |
| id            | SERIAL       | Primary key                    |
| email         | VARCHAR(255) | Unique user email              |
| password_hash | VARCHAR(255) | Bcrypt hashed password         |
| name          | VARCHAR(255) | User's display name (nullable) |
| created_at    | TIMESTAMP    | Account creation timestamp     |
| updated_at    | TIMESTAMP    | Last update timestamp          |

### user_progress

| Column        | Type         | Description          |
| ------------- | ------------ | -------------------- |
| id            | SERIAL       | Primary key          |
| user_id       | INTEGER      | Foreign key to users |
| resource_type | VARCHAR(50)  | Type of resource     |
| resource_id   | VARCHAR(100) | ID of the resource   |
| topic_id      | VARCHAR(100) | ID of the topic      |
| completed_at  | TIMESTAMP    | Completion timestamp |

**Unique Constraint:** (user_id, resource_type, resource_id, topic_id)

**Indexes:**

- `idx_user_progress_user_id` on `user_id`
- `idx_user_progress_resource` on `(user_id, resource_type, resource_id)`

---

## Testing

Run the automated test suite:

```bash
./test-api.sh
```

Or use the individual curl commands provided in each endpoint section.

---

## Security Notes

1. **Passwords** are hashed using bcryptjs with a salt factor of 10
2. **JWT tokens** expire after 7 days (configurable via `JWT_EXPIRES_IN`)
3. **CORS** is enabled for the configured frontend URL
4. **Input validation** is performed on all endpoints
5. Store your **JWT_SECRET** securely and never commit it to version control

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider adding:

- express-rate-limit for API rate limiting
- helmet for security headers
- express-validator for enhanced input validation
