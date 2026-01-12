# API Overview

## Introduction

The Recruitment Management System provides a comprehensive RESTful API built with Node.js, Express, and TypeScript. The API follows REST principles and includes complete Swagger/OpenAPI documentation.

**Base URL**: `http://localhost:3000/api`  
**Documentation**: `http://localhost:3000/api-docs`

## Authentication

### Authentication Method
- **Type**: JWT (JSON Web Token)
- **Header**: `Authorization: Bearer <token>`
- **Token Expiry**: 7 days
- **Password Hashing**: bcrypt

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login and get JWT token | Public |
| GET | `/auth/me` | Get current user profile | Authenticated |

**Example Login Request**:
```json
POST /api/auth/login
{
  "email": "applicant@example.com",
  "password": "password123"
}
```

**Example Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "applicant@example.com",
    "role": "APPLICANT",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## Authorization

### Role-Based Access Control (RBAC)

The system implements five user roles with specific permissions:

| Role | Permissions |
|------|-------------|
| **APPLICANT** | Browse vacancies, apply for jobs, view own applications, take tests, view interviews |
| **RECRUITER** | Manage vacancies, review applications, schedule interviews, create tests, view evaluations |
| **MANAGER** | Create vacancy requests, view department applications, provide recommendations |
| **INTERVIEWER** | View assigned interviews, submit evaluations and feedback |
| **ADMIN** | Full system access, user management, system configuration |

## API Endpoints Summary

### 1. Authentication & Users (5 endpoints)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| GET | `/auth/me` | Get current user | Authenticated |
| POST | `/users` | Create user (admin) | ADMIN |
| GET | `/users` | List all users | ADMIN |

### 2. Vacancy Requests (6 endpoints)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | `/vacancy-requests` | Create vacancy request | MANAGER |
| GET | `/vacancy-requests` | List all requests | RECRUITER, MANAGER |
| GET | `/vacancy-requests/:id` | Get request details | RECRUITER, MANAGER |
| PATCH | `/vacancy-requests/:id` | Update request | MANAGER |
| POST | `/vacancy-requests/:id/approve` | Approve request | RECRUITER |
| POST | `/vacancy-requests/:id/decline` | Decline request | RECRUITER |

### 3. Vacancies (8 endpoints)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | `/vacancies` | Create vacancy | RECRUITER |
| GET | `/vacancies` | List vacancies (filtered) | RECRUITER |
| GET | `/vacancies/public` | List published vacancies | Public |
| GET | `/vacancies/public/:id` | Get vacancy details | Public |
| GET | `/vacancies/:id` | Get vacancy (recruiter) | RECRUITER |
| PATCH | `/vacancies/:id` | Update vacancy | RECRUITER |
| POST | `/vacancies/:id/publish` | Publish vacancy | RECRUITER |
| POST | `/vacancies/:id/close` | Close vacancy | RECRUITER |

### 4. Applications (9 endpoints)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | `/applications` | Submit application | APPLICANT |
| GET | `/applications/mine` | Get my applications | APPLICANT |
| GET | `/applications/mine/:id` | Get my application detail | APPLICANT |
| GET | `/applications` | List all applications | RECRUITER |
| GET | `/applications/:id` | Get application detail | RECRUITER |
| PATCH | `/applications/:id/status` | Update application status | RECRUITER |
| GET | `/applications/:id/cv` | Download CV | RECRUITER |
| POST | `/applications/:id/withdraw` | Withdraw application | APPLICANT |
| GET | `/applications/vacancy/:vacancyId` | Get applications by vacancy | RECRUITER |

### 5. Tests (7 endpoints)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | `/tests` | Create test | RECRUITER |
| GET | `/tests/vacancy/:vacancyId` | Get tests for vacancy | RECRUITER |
| GET | `/tests/:id` | Get test details | RECRUITER |
| POST | `/tests/:id/invite` | Invite applicant to test | RECRUITER |
| POST | `/tests/:id/submit` | Submit test answers | APPLICANT |
| POST | `/tests/:id/complete` | Mark test complete | RECRUITER |
| GET | `/tests/attempts/:applicationId` | Get test attempts | RECRUITER, APPLICANT |

### 6. Interviews (8 endpoints)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | `/interviews` | Schedule interview | RECRUITER |
| GET | `/interviews` | List all interviews | RECRUITER |
| GET | `/interviews/mine` | Get my interviews | INTERVIEWER, APPLICANT |
| GET | `/interviews/:id` | Get interview details | RECRUITER, INTERVIEWER |
| PATCH | `/interviews/:id` | Update interview | RECRUITER |
| POST | `/interviews/:id/cancel` | Cancel interview | RECRUITER |
| POST | `/interviews/:id/assign` | Assign interviewer | RECRUITER |
| POST | `/interviews/:id/feedback` | Submit feedback | INTERVIEWER |

### 7. Evaluations (7 endpoints)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | `/evaluations` | Create evaluation | RECRUITER |
| GET | `/evaluations` | List evaluations | RECRUITER, MANAGER |
| GET | `/evaluations/:id` | Get evaluation details | RECRUITER, INTERVIEWER, MANAGER |
| PATCH | `/evaluations/:id` | Update evaluation | INTERVIEWER |
| POST | `/evaluations/:id/submit` | Submit evaluation | INTERVIEWER |
| POST | `/evaluations/:id/recommend` | Manager recommendation | MANAGER |
| GET | `/evaluations/application/:applicationId` | Get evaluations by application | RECRUITER, MANAGER |

### 8. Notifications (3 endpoints)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | `/notifications/mine` | Get my notifications | Authenticated |
| PATCH | `/notifications/:id/read` | Mark as read | Authenticated |
| GET | `/notifications/unread-count` | Get unread count | Authenticated |

### 9. Manager Endpoints (2 endpoints)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | `/manager/applications` | Get department applications | MANAGER |
| GET | `/manager/dashboard` | Get manager dashboard | MANAGER |

---

## Total: 55 API Endpoints

## Request/Response Format

### Standard Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ] // Validation errors if applicable
}
```

### Common HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PATCH requests |
| 201 | Created | Successful POST requests |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (e.g., duplicate application) |
| 500 | Internal Server Error | Server-side errors |

## Data Validation

All endpoints use **Zod** schemas for input validation:

- Request body validation
- Query parameter validation
- Path parameter validation
- File upload validation

**Example Validation Error**:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

## File Upload

### CV Upload Endpoint

**Endpoint**: `POST /api/applications`  
**Content-Type**: `multipart/form-data`

**Fields**:
- `vacancyId`: string (required)
- `coverLetter`: string (required)
- `cv`: file (required, PDF only, max 5MB)
- `education`: JSON array (optional)
- `experience`: JSON array (optional)
- `skills`: JSON array (optional)

**Example**:
```javascript
const formData = new FormData();
formData.append('vacancyId', 'vacancy-uuid');
formData.append('coverLetter', 'I am interested...');
formData.append('cv', fileBlob, 'resume.pdf');
formData.append('education', JSON.stringify([...]));
```

## Pagination

List endpoints support pagination via query parameters:

**Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Example**:
```
GET /api/applications?page=2&limit=20
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting:

**Vacancy Filters**:
- `department`: Filter by department
- `employmentType`: Filter by employment type
- `status`: Filter by status

**Application Filters**:
- `status`: Filter by application status
- `vacancyId`: Filter by vacancy
- `startDate`, `endDate`: Date range

**Example**:
```
GET /api/applications?status=INTERVIEW_SCHEDULED&vacancyId=uuid
```

## Swagger Documentation

Complete interactive API documentation is available at:

**URL**: `http://localhost:3000/api-docs`

**Features**:
- Try out endpoints directly
- View request/response schemas
- See example requests
- Authentication testing
- Model definitions

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Signed with secret key
3. **Input Validation**: Zod schemas on all inputs
4. **File Validation**: Type and size checks
5. **SQL Injection Protection**: Prisma ORM parameterized queries
6. **XSS Protection**: Input sanitization
7. **CORS**: Configured for frontend origin
8. **Rate Limiting**: (Recommended for production)

## Error Handling

All errors are caught and returned in consistent format:

```javascript
try {
  // Operation
} catch (error) {
  return res.status(500).json({
    success: false,
    error: error.message
  });
}
```

## Audit Logging

All create, update, and delete operations are logged:

**Logged Information**:
- User who performed action
- Action type (CREATE, UPDATE, DELETE)
- Entity type and ID
- Changes made (before/after)
- Timestamp

## Testing the API

### Using Swagger UI
1. Start the backend: `npm run dev`
2. Open `http://localhost:3000/api-docs`
3. Click "Authorize" and enter JWT token
4. Try out endpoints

### Using HTTP Files
The backend includes `.http` files for testing:
- `test-auth.http`
- `test-vacancies.http`
- `test-applications.http`
- `test-evaluations.http`

### Using cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"applicant@example.com","password":"password123"}'

# Get vacancies (with token)
curl http://localhost:3000/api/vacancies/public \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Versioning

Current version: **v1** (implicit in base URL)

Future versions can be added as: `/api/v2/...`

## Rate Limiting (Recommended)

For production deployment, implement rate limiting:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per authenticated user

## CORS Configuration

Configured to allow requests from:
- `http://localhost:5173` (Frontend dev server)
- Production frontend domain (configure in .env)

---

**For detailed endpoint documentation, visit the Swagger UI at http://localhost:3000/api-docs**

