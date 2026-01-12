# Application Flow Implementation

## Overview

Complete implementation of the application flow with CV upload support (file OR structured JSON), role-based access control, and comprehensive audit logging.

## Features Implemented

### ✅ Applicant Endpoints
- **POST /api/applications** - Apply to vacancy (CV file OR structured CV JSON)
- **GET /api/applications/mine** - List my applications with filters
- **GET /api/applications/mine/:id** - Get application detail with timeline
- **POST /api/applications/:id/withdraw** - Withdraw application

### ✅ Recruiter/Admin Endpoints
- **GET /api/vacancies/:vacancyId/applications** - Get all applications for a vacancy
- **GET /api/applications/:id** - Get application detail (candidate info)
- **PUT /api/applications/:id/status** - Update application status
- **GET /api/applications/cv/:cvId/download** - Download CV file

## Application Workflow

```
APPLIED → SCREENING → INTERVIEW → OFFERED → ACCEPTED
   ↓                                           ↓
WITHDRAWN                                   REJECTED
```

### Status Transitions

1. **APPLIED** - Initial status when application is submitted
2. **SCREENING** - Application is being reviewed
3. **INTERVIEW** - Candidate invited for interview
4. **OFFERED** - Job offer extended
5. **ACCEPTED** - Candidate accepted the offer
6. **REJECTED** - Application rejected
7. **WITHDRAWN** - Applicant withdrew application

## CV Submission Options

### Option 1: File Upload
- Supports PDF, DOC, DOCX, TXT
- Max file size: 5MB (configurable)
- Stored in `/uploads` directory
- Accessible via download endpoint

### Option 2: Structured CV (JSON)
- Comprehensive JSON schema with:
  - Personal information
  - Education history
  - Work experience
  - Skills (technical, languages, soft)
  - Certifications
  - Projects
- Stored in database as JSON
- Searchable and filterable

### Option 3: Both
- Can provide both file AND structured data
- Gives recruiters flexibility in viewing

## Business Rules

### Application Submission
- ✅ Must provide either CV file OR structured CV data (or both)
- ✅ Can only apply to OPEN and PUBLISHED vacancies
- ✅ Cannot apply to same vacancy twice
- ✅ Motivation letter is optional
- ✅ Creates CV and MotivationLetter records automatically

### Withdrawal
- ✅ Can only withdraw own applications
- ✅ Cannot withdraw if already WITHDRAWN or REJECTED
- ✅ Reason is optional but recommended
- ✅ Status changes to WITHDRAWN
- ✅ Fully audit logged

### Recruiter Actions
- ✅ Can view all applications for vacancies
- ✅ Can update application status
- ✅ Can add notes to applications
- ✅ Can download CV files
- ✅ Can view complete candidate profile

### Access Control
- ✅ Applicants can only see their own applications
- ✅ Recruiters/Admins can see all applications
- ✅ CV download requires ownership or recruiter/admin role
- ✅ Status updates require recruiter/admin role

## Structured CV Schema

```typescript
{
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    portfolio?: string;
  };
  summary?: string;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    gpa?: string;
    description?: string;
  }>;
  experience?: Array<{
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    achievements?: string[];
  }>;
  skills?: {
    technical?: string[];
    languages?: Array<{
      language: string;
      proficiency: 'NATIVE' | 'FLUENT' | 'INTERMEDIATE' | 'BASIC';
    }>;
    soft?: string[];
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
  }>;
}
```

## Application Detail Response

Includes complete timeline with:
- ✅ Vacancy details
- ✅ CV (file and/or structured data)
- ✅ Motivation letter
- ✅ Evaluations (with evaluator info)
- ✅ Test attempts (with test info)
- ✅ Interview assignments (with interview details)
- ✅ Application status and notes
- ✅ Timestamps (applied, updated)

## Filters

### Applicant Filters (My Applications)
- `status` - Filter by application status
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)

### Recruiter Filters (Vacancy Applications)
- `status` - Filter by application status
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

## Role-Based Access Control

| Endpoint | APPLICANT | RECRUITER | ADMIN | PUBLIC |
|----------|-----------|-----------|-------|--------|
| POST /applications | ✅ | ✅ | ✅ | ❌ |
| GET /applications/mine | ✅ | ✅ | ✅ | ❌ |
| GET /applications/mine/:id | ✅ | ✅ | ✅ | ❌ |
| POST /applications/:id/withdraw | ✅ (own) | ❌ | ❌ | ❌ |
| GET /vacancies/:id/applications | ❌ | ✅ | ✅ | ❌ |
| GET /applications/:id | ❌ | ✅ | ✅ | ❌ |
| PUT /applications/:id/status | ❌ | ✅ | ✅ | ❌ |
| GET /applications/cv/:id/download | ✅ (own) | ✅ | ✅ | ❌ |

## Audit Logging

All operations are logged with:
- ✅ User ID and role
- ✅ Action (CREATE, UPDATE)
- ✅ Entity (Application)
- ✅ Entity ID
- ✅ Changes (before/after data)
- ✅ IP Address
- ✅ User Agent
- ✅ Timestamp

## Files Created

```
backend/src/validators/application.validator.ts   # Zod validation (121 lines)
backend/src/services/application.service.ts        # Business logic (659 lines)
backend/src/controllers/application.controller.ts  # Request handlers (400 lines)
backend/src/routes/application.routes.ts           # Routes with file upload (102 lines)
backend/scripts/test-applications.ts               # Automated tests (356 lines)
backend/test-applications.http                     # Manual tests (11 scenarios)
APPLICATION_IMPLEMENTATION.md                      # This documentation
```

## Files Modified

```
backend/prisma/schema.prisma                       # Added structured CV support
backend/src/routes/vacancy.routes.ts               # Added vacancy applications endpoint
backend/package.json                               # Added test:applications script
```

## Database Changes

### CV Model Updates
```prisma
model CV {
  // File-based CV (optional)
  fileName    String?
  filePath    String?
  fileSize    Int?
  mimeType    String?
  
  // Structured CV data (optional)
  structuredData Json?
  
  // At least one must be provided
}
```

## Testing

### Automated Tests
```bash
cd backend
npm run test:applications
```

Tests include:
- ✅ Apply with structured CV
- ✅ Get my applications
- ✅ Get my application detail
- ✅ Get vacancy applications (Recruiter)
- ✅ Get application detail (Recruiter)
- ✅ Update application status
- ✅ Withdraw application
- ✅ Error: Apply without CV
- ✅ Error: Apply twice to same vacancy

### Manual Tests
Open `backend/test-applications.http` in VS Code with REST Client extension.

### Swagger UI
Navigate to http://localhost:3000/api-docs
- Find "Applications - Applicant" section
- Find "Applications - Recruiter" section

## Quick Examples

### Apply with File Upload
```bash
POST /api/applications
Authorization: Bearer APPLICANT_TOKEN
Content-Type: multipart/form-data

{
  "vacancyId": "uuid-here",
  "motivationLetter": "I am interested...",
  "cvFile": <file>
}
```

### Apply with Structured CV
```bash
POST /api/applications
Authorization: Bearer APPLICANT_TOKEN
Content-Type: application/json

{
  "vacancyId": "uuid-here",
  "motivationLetter": "I am interested...",
  "structuredCV": {
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "experience": [...]
  }
}
```

### Get My Applications
```bash
GET /api/applications/mine?status=APPLIED&page=1&limit=10
Authorization: Bearer APPLICANT_TOKEN
```

### Update Status (Recruiter)
```bash
PUT /api/applications/:id/status
Authorization: Bearer RECRUITER_TOKEN

{
  "status": "SCREENING",
  "notes": "Strong candidate"
}
```

## Integration Points

### With Vacancy System
- ✅ Can only apply to OPEN and PUBLISHED vacancies
- ✅ Vacancy details included in application response
- ✅ Application count shown in vacancy listings

### With User System
- ✅ Applicant info included in recruiter views
- ✅ Role-based access control enforced
- ✅ User authentication required

### With Evaluation/Test/Interview (Future)
- ✅ Timeline includes evaluations
- ✅ Timeline includes test attempts
- ✅ Timeline includes interview assignments
- 🔄 Can schedule interviews from application
- 🔄 Can assign tests from application

## Security Features

### File Upload Security
- ✅ File type validation (PDF, DOC, DOCX, TXT only)
- ✅ File size limit (5MB default)
- ✅ Unique filename generation
- ✅ Secure file storage
- ✅ Access control on downloads

### Data Validation
- ✅ Zod schema validation for all inputs
- ✅ UUID validation for IDs
- ✅ Email validation in structured CV
- ✅ URL validation for links

### Access Control
- ✅ JWT authentication required
- ✅ Role-based authorization
- ✅ Ownership verification for applicant actions
- ✅ Audit logging for all operations

## Next Steps

1. ✅ Test all endpoints
2. ✅ Verify RBAC
3. ✅ Test file upload
4. ✅ Test structured CV
5. 🔄 Add email notifications (application received, status changed)
6. 🔄 Build frontend UI for application submission
7. 🔄 Add CV parsing for uploaded files
8. 🔄 Add search/filter by CV content
9. 🔄 Integrate with evaluation system
10. 🔄 Add application analytics

