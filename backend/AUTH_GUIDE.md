# Authentication & Authorization Guide

## Overview

This recruitment system implements JWT-based authentication with role-based authorization. The system supports five user roles with different permission levels.

## User Roles

| Role | Description | Can Be Created By |
|------|-------------|-------------------|
| **APPLICANT** | Job applicants who can apply for vacancies | Public registration |
| **RECRUITER** | HR staff who manage vacancies and applications | Admin |
| **INTERVIEWER** | Conduct interviews and evaluate candidates | Admin |
| **MANAGER** | Department managers who request vacancies | Admin |
| **ADMIN** | System administrators with full access | Admin |

## Authentication Flow

### 1. Public Registration (Applicants Only)

**Endpoint:** `POST /api/auth/register`

Applicants can self-register. This endpoint only creates users with the `APPLICANT` role.

**Request:**
```json
{
  "email": "applicant@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "applicant@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "APPLICANT",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

**Endpoint:** `POST /api/auth/login`

All users (regardless of role) login using this endpoint.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "RECRUITER",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "RECRUITER",
  "phone": "+1234567890",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Admin User Management

### Create User (Admin Only)

**Endpoint:** `POST /api/auth/users`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request:**
```json
{
  "email": "recruiter@company.com",
  "password": "SecurePass123",
  "firstName": "Jane",
  "lastName": "Recruiter",
  "role": "RECRUITER",
  "phone": "+1234567890",
  "isActive": true
}
```

**Available Roles:**
- `APPLICANT`
- `RECRUITER`
- `INTERVIEWER`
- `MANAGER`
- `ADMIN`

### Get All Users (Admin Only)

**Endpoint:** `GET /api/auth/users`

**Optional Query Parameters:**
- `role` - Filter by role (e.g., `?role=RECRUITER`)

**Headers:**
```
Authorization: Bearer <admin-token>
```

### Get User by ID (Admin Only)

**Endpoint:** `GET /api/auth/users/:id`

**Headers:**
```
Authorization: Bearer <admin-token>
```

### Deactivate User (Admin Only)

**Endpoint:** `PATCH /api/auth/users/:id/deactivate`

**Headers:**
```
Authorization: Bearer <admin-token>
```

### Activate User (Admin Only)

**Endpoint:** `PATCH /api/auth/users/:id/activate`

**Headers:**
```
Authorization: Bearer <admin-token>
```

## Using Authentication in Routes

### Require Authentication

```typescript
import { authenticate } from '../middleware/auth';

router.get('/protected', authenticate, handler);
```

### Require Specific Role(s)

```typescript
import { authenticate, requireRole } from '../middleware/auth';

// Single role
router.post('/vacancy', authenticate, requireRole('ADMIN'), handler);

// Multiple roles
router.post('/vacancy', 
  authenticate, 
  requireRole('ADMIN', 'RECRUITER', 'MANAGER'), 
  handler
);
```

### Optional Authentication

```typescript
import { optionalAuth } from '../middleware/auth';

// Works for both authenticated and anonymous users
router.get('/public-vacancies', optionalAuth, handler);
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "No token provided. Please include a valid Bearer token in the Authorization header."
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Access denied. Required role(s): ADMIN. Your role: APPLICANT"
}
```

### 400 Bad Request (Validation)
```json
{
  "error": "Validation error",
  "message": "Invalid input data",
  "details": [
    {
      "path": ["password"],
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

## Testing

Use the provided `test-auth.http` file with REST Client extension in VS Code.

## Security Best Practices

1. **JWT Secret**: Set a strong `JWT_SECRET` in production
2. **Token Expiry**: Tokens expire after 7 days by default (configurable via `JWT_EXPIRES_IN`)
3. **Password Hashing**: All passwords are hashed with bcrypt (10 rounds)
4. **Active Users**: Inactive users cannot login
5. **HTTPS**: Always use HTTPS in production
6. **Token Storage**: Store tokens securely on the client (httpOnly cookies recommended)

## Default Credentials (Development Only)

| Email | Password | Role |
|-------|----------|------|
| admin@recruitment.com | admin123 | ADMIN |
| manager@recruitment.com | manager123 | MANAGER |
| recruiter@recruitment.com | recruiter123 | RECRUITER |
| interviewer@recruitment.com | interviewer123 | INTERVIEWER |
| applicant@recruitment.com | applicant123 | APPLICANT |

**⚠️ Change these credentials in production!**

