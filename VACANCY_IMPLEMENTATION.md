# Vacancy Management Implementation

## Overview

Complete implementation of Vacancy management endpoints with role-based access control, public access for job seekers, and comprehensive audit logging.

## Features Implemented

### ✅ Recruiter Endpoints
- **POST /api/vacancies** - Create vacancy from approved request
- **PUT /api/vacancies/:id** - Update vacancy details
- **POST /api/vacancies/:id/publish** - Publish vacancy (make public)
- **POST /api/vacancies/:id/unpublish** - Unpublish vacancy (hide from public)
- **POST /api/vacancies/:id/close** - Close vacancy (stop accepting applications)
- **GET /api/vacancies** - List all vacancies with filters
- **GET /api/vacancies/:id** - Get vacancy details

### ✅ Admin Endpoints
- All Recruiter operations
- **DELETE /api/vacancies/:id** - Delete vacancy (only if no applications)

### ✅ Public Endpoints (No Authentication)
- **GET /api/public/vacancies** - List published and open vacancies
- **GET /api/public/vacancies/:id** - Get published vacancy details

## Vacancy Lifecycle

```
DRAFT → OPEN → CLOSED
  ↓       ↓
  ↓    DRAFT (unpublish)
  ↓
CLOSED
```

### State Transitions

1. **DRAFT** - Created but not published
   - Can be edited
   - Can be published
   - Can be closed
   - Not visible to public

2. **OPEN** - Published and accepting applications
   - Can be edited
   - Can be unpublished (→ DRAFT)
   - Can be closed
   - Visible to public

3. **CLOSED** - No longer accepting applications
   - Cannot be edited
   - Cannot be published/unpublished
   - Not visible to public

## Business Rules

### Creation
- ✅ Can only create from **APPROVED** vacancy requests
- ✅ One vacancy per vacancy request
- ✅ Salary min cannot exceed salary max
- ✅ Deadline cannot be in the past
- ✅ Inherits data from vacancy request (can be overridden)

### Publishing
- ✅ Only DRAFT or OPEN vacancies can be published
- ✅ Publishing sets status to OPEN and isPublished to true
- ✅ Records publishedAt timestamp

### Unpublishing
- ✅ Only published vacancies can be unpublished
- ✅ Cannot unpublish closed vacancies
- ✅ Sets status to DRAFT and isPublished to false

### Updating
- ✅ Cannot update CLOSED vacancies
- ✅ Can update title, description, requirements, etc.
- ✅ Salary validation enforced

### Closing
- ✅ Can close any non-closed vacancy
- ✅ Sets status to CLOSED and isPublished to false
- ✅ Records closedAt timestamp
- ✅ Irreversible operation

### Deletion
- ✅ Admin only
- ✅ Cannot delete if applications exist
- ✅ Audit logged

## Filters

### Recruiter/Admin Filters
- `status` - Filter by DRAFT, OPEN, or CLOSED
- `departmentId` - Filter by department
- `keyword` - Search in title and description
- `employmentType` - Filter by FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Public Filters
- `departmentId` - Filter by department
- `keyword` - Search in title and description
- `employmentType` - Filter by employment type
- `location` - Filter by location (partial match)
- `experienceYears` - Filter by max required experience
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)

## Role-Based Access Control

| Endpoint | RECRUITER | ADMIN | MANAGER | PUBLIC |
|----------|-----------|-------|---------|--------|
| POST /vacancies | ✅ | ✅ | ❌ | ❌ |
| PUT /vacancies/:id | ✅ | ✅ | ❌ | ❌ |
| POST /vacancies/:id/publish | ✅ | ✅ | ❌ | ❌ |
| POST /vacancies/:id/unpublish | ✅ | ✅ | ❌ | ❌ |
| POST /vacancies/:id/close | ✅ | ✅ | ❌ | ❌ |
| GET /vacancies | ✅ | ✅ | ❌ | ❌ |
| GET /vacancies/:id | ✅ | ✅ | ❌ | ❌ |
| DELETE /vacancies/:id | ❌ | ✅ | ❌ | ❌ |
| GET /public/vacancies | ✅ | ✅ | ✅ | ✅ |
| GET /public/vacancies/:id | ✅ | ✅ | ✅ | ✅ |

## Audit Logging

All operations are logged with:
- ✅ User ID
- ✅ Action (CREATE, UPDATE, PUBLISH, UNPUBLISH, CLOSE, DELETE)
- ✅ Entity (Vacancy)
- ✅ Entity ID
- ✅ Changes (before/after data)
- ✅ IP Address
- ✅ User Agent
- ✅ Timestamp

## Files Created

```
backend/src/validators/vacancy.validator.ts       # Zod validation schemas
backend/src/services/vacancy.service.ts            # Business logic (743 lines)
backend/src/controllers/vacancy.controller.ts      # Request handlers (474 lines)
backend/src/routes/vacancy.routes.ts               # Protected routes with Swagger
backend/src/routes/public.routes.ts                # Public routes
backend/scripts/test-vacancies.ts                  # Automated test script
backend/test-vacancies.http                        # Manual API tests
VACANCY_IMPLEMENTATION.md                          # This documentation
```

## Files Modified

```
backend/src/index.ts                               # Registered vacancy and public routes
backend/package.json                               # Added test:vacancies script
```

## Testing

### Automated Tests
```bash
cd backend
npm run test:vacancies
```

### Manual Tests
Open `backend/test-vacancies.http` in VS Code with REST Client extension.

### Swagger UI
Navigate to http://localhost:3000/api-docs
- Find "Vacancies" section for protected endpoints
- Find "Public" section for public endpoints

## Quick Examples

### Create Vacancy (Recruiter)
```bash
POST /api/vacancies
Authorization: Bearer RECRUITER_TOKEN

{
  "vacancyRequestId": "uuid-here",
  "title": "Senior Software Engineer",
  "description": "We are looking for...",
  "requirements": ["5+ years", "TypeScript"],
  "salaryMin": 80000,
  "salaryMax": 120000,
  "employmentType": "FULL_TIME"
}
```

### Publish Vacancy
```bash
POST /api/vacancies/:id/publish
Authorization: Bearer RECRUITER_TOKEN
```

### Get Public Vacancies (No Auth)
```bash
GET /api/public/vacancies?keyword=engineer&employmentType=FULL_TIME
```

## API Response Examples

### Create Vacancy Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "vacancyRequestId": "660e8400-e29b-41d4-a716-446655440000",
  "departmentId": "770e8400-e29b-41d4-a716-446655440000",
  "title": "Senior Software Engineer",
  "description": "We are looking for an experienced engineer",
  "requirements": ["5+ years experience", "TypeScript", "React"],
  "responsibilities": ["Lead development", "Code reviews"],
  "qualifications": ["Bachelor's degree"],
  "benefits": ["Health insurance", "Remote work"],
  "salaryMin": 80000,
  "salaryMax": 120000,
  "location": "Remote",
  "employmentType": "FULL_TIME",
  "experienceYears": 5,
  "educationLevel": "Bachelor's",
  "numberOfPositions": 2,
  "deadline": "2024-12-31T23:59:59.000Z",
  "status": "DRAFT",
  "isPublished": false,
  "publishedAt": null,
  "closedAt": null,
  "createdBy": "880e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-09T10:00:00.000Z",
  "updatedAt": "2024-01-09T10:00:00.000Z",
  "department": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "name": "Engineering"
  },
  "vacancyRequest": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "title": "Software Engineer Position",
    "requestedBy": "990e8400-e29b-41d4-a716-446655440000"
  },
  "creator": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "email": "recruiter@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "RECRUITER"
  }
}
```

### Public Vacancies Response
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Senior Software Engineer",
      "description": "We are looking for an experienced engineer",
      "requirements": ["5+ years experience", "TypeScript", "React"],
      "responsibilities": ["Lead development", "Code reviews"],
      "qualifications": ["Bachelor's degree"],
      "benefits": ["Health insurance", "Remote work"],
      "salaryMin": 80000,
      "salaryMax": 120000,
      "location": "Remote",
      "employmentType": "FULL_TIME",
      "experienceYears": 5,
      "educationLevel": "Bachelor's",
      "numberOfPositions": 2,
      "deadline": "2024-12-31T23:59:59.000Z",
      "publishedAt": "2024-01-09T10:30:00.000Z",
      "department": {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "name": "Engineering",
        "description": "Software development team"
      },
      "_count": {
        "applications": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["salaryMin"],
      "message": "Minimum salary cannot be greater than maximum salary"
    }
  ]
}
```

### 400 Bad Request - Business Rule Violation
```json
{
  "error": "Can only create vacancy from approved requests"
}
```

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
  "message": "Access denied. Required role(s): RECRUITER, ADMIN. Your role: MANAGER"
}
```

## Integration Points

### With VacancyRequest System
- ✅ Vacancies are created from **APPROVED** vacancy requests
- ✅ One-to-one relationship enforced
- ✅ Inherits department, title, description, and required skills
- ✅ Can override inherited data during creation

### With Application System (Future)
- 🔄 Applications can only be submitted to **OPEN** vacancies
- 🔄 Closing a vacancy prevents new applications
- 🔄 Cannot delete vacancy with existing applications
- 🔄 Application count shown in public listings

### With Department System
- ✅ Vacancy belongs to a department
- ✅ Department must exist and be active
- ✅ Department info included in responses

## Security Features

### Authentication
- ✅ JWT-based authentication for protected endpoints
- ✅ No authentication required for public endpoints
- ✅ Token verification on every request

### Authorization
- ✅ Role-based access control (RBAC)
- ✅ Recruiters can manage all vacancies
- ✅ Admins have full access including delete
- ✅ Managers cannot access vacancy endpoints
- ✅ Public can only view published vacancies

### Data Protection
- ✅ Public endpoints only expose published vacancies
- ✅ Sensitive data (creator details) hidden from public
- ✅ Audit logging for all operations
- ✅ IP address and user agent tracking

## Performance Considerations

### Database Queries
- ✅ Efficient filtering with indexed fields
- ✅ Pagination to limit result sets
- ✅ Selective field inclusion for public endpoints
- ✅ Relation loading optimized

### Caching Opportunities (Future)
- 🔄 Cache public vacancy listings
- 🔄 Cache department data
- 🔄 Invalidate cache on publish/unpublish/close

## Next Steps

1. ✅ Test all endpoints
2. ✅ Verify RBAC
3. ✅ Test public access
4. 🔄 Integrate with Application system
5. 🔄 Add email notifications (on publish, close)
6. 🔄 Build frontend UI for vacancy management
7. 🔄 Add search indexing for better keyword search
8. 🔄 Implement caching for public endpoints

