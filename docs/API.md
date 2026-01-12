# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register
**POST** `/auth/register`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "RECRUITER"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "RECRUITER"
  },
  "token": "jwt-token"
}
```

### Login
**POST** `/auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "RECRUITER"
  },
  "token": "jwt-token"
}
```

## Jobs

### Get All Jobs
**GET** `/jobs`

Query parameters:
- `status` (optional): Filter by status (OPEN, CLOSED, DRAFT)
- `type` (optional): Filter by type (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP)
- `department` (optional): Filter by department

### Get Job by ID
**GET** `/jobs/:id`

### Create Job
**POST** `/jobs` (Auth required)

Request body:
```json
{
  "title": "Senior Developer",
  "description": "Job description",
  "department": "Engineering",
  "location": "Remote",
  "type": "FULL_TIME",
  "status": "OPEN",
  "salary": "$100,000 - $150,000",
  "requirements": "5+ years experience"
}
```

### Update Job
**PUT** `/jobs/:id` (Auth required)

### Delete Job
**DELETE** `/jobs/:id` (Auth required)

## Candidates

### Get All Candidates
**GET** `/candidates`

Query parameters:
- `skills` (optional): Filter by skill
- `experience` (optional): Minimum years of experience

### Get Candidate by ID
**GET** `/candidates/:id`

### Create Candidate
**POST** `/candidates` (Auth required)

Content-Type: `multipart/form-data`

Form fields:
- `firstName`: string
- `lastName`: string
- `email`: string
- `phone`: string (optional)
- `skills`: array of strings
- `experience`: number (optional)
- `education`: string (optional)
- `linkedIn`: string (optional)
- `resume`: file (optional)

### Update Candidate
**PUT** `/candidates/:id` (Auth required)

### Delete Candidate
**DELETE** `/candidates/:id` (Auth required)

## Applications

### Get All Applications
**GET** `/applications`

Query parameters:
- `status` (optional): Filter by status
- `jobId` (optional): Filter by job ID

### Get Application by ID
**GET** `/applications/:id`

### Create Application
**POST** `/applications` (Auth required)

Request body:
```json
{
  "jobId": "uuid",
  "candidateId": "uuid",
  "coverLetter": "Cover letter text",
  "notes": "Additional notes"
}
```

### Update Application
**PUT** `/applications/:id` (Auth required)

Request body:
```json
{
  "status": "REVIEWING",
  "notes": "Updated notes"
}
```

Status options:
- PENDING
- REVIEWING
- INTERVIEW
- OFFERED
- ACCEPTED
- REJECTED

### Delete Application
**DELETE** `/applications/:id` (Auth required)

## Users

### Get All Users
**GET** `/users` (Admin only)

### Get User by ID
**GET** `/users/:id` (Auth required)

### Delete User
**DELETE** `/users/:id` (Admin only)

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": [...]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden: Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

