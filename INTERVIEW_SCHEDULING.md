# Interview Scheduling Implementation

## Overview

Complete implementation of interview scheduling functionality with support for multiple interviewers, rescheduling, cancellation, and automatic notifications.

## Features Implemented

### ✅ Recruiter Endpoints
- **POST /api/applications/:id/interviews** - Schedule an interview
- **PUT /api/interviews/:id/reschedule** - Reschedule an interview
- **POST /api/interviews/:id/cancel** - Cancel an interview
- **POST /api/interviews/:id/assign-interviewers** - Assign/update interviewers

### ✅ Interviewer Endpoints
- **GET /api/interviewer/interviews** - Get all assigned interviews
- **GET /api/interviewer/interviews/:id** - Get interview details (with CV and evaluations)
- **POST /api/interviewer/interviews/:id/complete** - Mark interview as complete

### ✅ Key Features
- **Multiple Interviewers** - Support for assigning multiple interviewers per interview
- **Automatic Notifications** - Notify applicants and interviewers on schedule/reschedule/cancel
- **Application Status Integration** - Updates application status to INTERVIEW_R1 or INTERVIEW_R2
- **Interview Completion Tracking** - Track individual interviewer feedback and completion
- **Role-Based Access Control** - Proper RBAC for all endpoints
- **Complete Audit Logging** - All actions logged for compliance

## Database Schema

### Interview Model
```prisma
model Interview {
  id               String          @id @default(uuid())
  applicationId    String
  application      Application     @relation(...)
  vacancyId        String
  vacancy          Vacancy         @relation(...)
  title            String
  description      String?
  round            Int             @default(1)
  scheduledAt      DateTime
  duration         Int             // minutes
  location         String?         // meeting link or physical location
  status           InterviewStatus @default(SCHEDULED)
  notes            String?
  cancelReason     String?
  rescheduleReason String?
  completedAt      DateTime?
  scheduledById    String
  scheduledBy      User            @relation(...)
  interviewers     InterviewerAssignment[]
}
```

### InterviewerAssignment Model
```prisma
model InterviewerAssignment {
  id             String    @id @default(uuid())
  interviewId    String
  interview      Interview @relation(...)
  interviewerId  String
  interviewer    User      @relation(...)
  feedback       String?
  rating         Int?      // 1-10
  recommendation String?   // REJECT, MAYBE, PROCEED, STRONG_YES
  attended       Boolean   @default(false)
  completedAt    DateTime?
}
```

### InterviewStatus Enum
```prisma
enum InterviewStatus {
  SCHEDULED
  RESCHEDULED
  COMPLETED
  CANCELLED
}
```

## API Examples

### 1. Schedule Interview

**Request:**
```bash
POST /api/applications/{applicationId}/interviews
Authorization: Bearer {recruiterToken}
Content-Type: application/json

{
  "title": "Technical Interview - Round 1",
  "description": "Technical assessment focusing on JavaScript and React",
  "round": 1,
  "scheduledAt": "2024-02-01T10:00:00Z",
  "duration": 60,
  "location": "https://meet.google.com/abc-defg-hij",
  "notes": "Please prepare coding examples",
  "interviewerIds": ["interviewer-uuid-1", "interviewer-uuid-2"]
}
```

**Response:**
```json
{
  "id": "interview-uuid",
  "title": "Technical Interview - Round 1",
  "status": "SCHEDULED",
  "scheduledAt": "2024-02-01T10:00:00Z",
  "duration": 60,
  "interviewers": [
    {
      "interviewer": {
        "id": "interviewer-uuid-1",
        "email": "interviewer1@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

**Side Effects:**
- ✅ Application status → `INTERVIEW_R1` (or `INTERVIEW_R2` if round=2)
- ✅ Notification sent to applicant
- ✅ Notifications sent to all interviewers
- ✅ Audit log created

### 2. Reschedule Interview

**Request:**
```bash
PUT /api/interviews/{interviewId}/reschedule
Authorization: Bearer {recruiterToken}
Content-Type: application/json

{
  "scheduledAt": "2024-02-02T14:00:00Z",
  "duration": 90,
  "reason": "Interviewer unavailable at original time"
}
```

**Side Effects:**
- ✅ Interview status → `RESCHEDULED`
- ✅ Notifications sent to applicant and all interviewers
- ✅ Audit log created

### 3. Cancel Interview

**Request:**
```bash
POST /api/interviews/{interviewId}/cancel
Authorization: Bearer {recruiterToken}
Content-Type: application/json

{
  "reason": "Candidate withdrew application"
}
```

**Side Effects:**
- ✅ Interview status → `CANCELLED`
- ✅ Notifications sent to applicant and all interviewers
- ✅ Audit log created

### 4. Assign Interviewers

**Request:**
```bash
POST /api/interviews/{interviewId}/assign-interviewers
Authorization: Bearer {recruiterToken}
Content-Type: application/json

{
  "interviewerIds": ["interviewer-uuid-1", "interviewer-uuid-2", "interviewer-uuid-3"]
}
```

**Side Effects:**
- ✅ Removes old interviewer assignments
- ✅ Creates new interviewer assignments
- ✅ Notifications sent to newly added interviewers
- ✅ Audit log created

### 5. Get Interviewer Interviews

**Request:**
```bash
GET /api/interviewer/interviews?status=SCHEDULED&from=2024-01-01T00:00:00Z
Authorization: Bearer {interviewerToken}
```

**Response:**
```json
[
  {
    "id": "interview-uuid",
    "title": "Technical Interview - Round 1",
    "scheduledAt": "2024-02-01T10:00:00Z",
    "duration": 60,
    "status": "SCHEDULED",
    "application": {
      "applicant": {
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com"
      },
      "vacancy": {
        "title": "Senior Frontend Developer"
      }
    }
  }
]
```

### 6. Get Interview Details (with CV and Evaluations)

**Request:**
```bash
GET /api/interviewer/interviews/{interviewId}
Authorization: Bearer {interviewerToken}
```

**Response:**
```json
{
  "id": "interview-uuid",
  "title": "Technical Interview - Round 1",
  "scheduledAt": "2024-02-01T10:00:00Z",
  "application": {
    "applicant": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1234567890"
    },
    "cv": {
      "fileName": "jane_smith_cv.pdf",
      "filePath": "uploads/cvs/...",
      "education": [...],
      "experience": [...]
    },
    "motivationLetter": {...},
    "evaluations": [
      {
        "rating": 8,
        "comments": "Strong candidate",
        "evaluator": {
          "firstName": "John",
          "lastName": "Recruiter"
        }
      }
    ]
  }
}
```

### 7. Complete Interview

**Request:**
```bash
POST /api/interviewer/interviews/{interviewId}/complete
Authorization: Bearer {interviewerToken}
Content-Type: application/json

{
  "feedback": "Strong technical skills, excellent communication",
  "rating": 8,
  "recommendation": "PROCEED",
  "attended": true
}
```

**Response:**
```json
{
  "id": "assignment-uuid",
  "feedback": "Strong technical skills, excellent communication",
  "rating": 8,
  "recommendation": "PROCEED",
  "attended": true,
  "completedAt": "2024-02-01T11:00:00Z"
}
```

**Side Effects:**
- ✅ InterviewerAssignment marked as completed
- ✅ If all interviewers completed → Interview status → `COMPLETED`
- ✅ Audit log created

## Notification System

### Notification Types

#### INTERVIEW_SCHEDULED
Sent to: Applicant + All Interviewers
```
Title: "Interview Scheduled"
Message: "Your interview 'Technical Interview - Round 1' for Senior Frontend Developer
          has been scheduled for Feb 1, 2024 at 10:00 AM."
```

#### INTERVIEW_RESCHEDULED
Sent to: Applicant + All Interviewers
```
Title: "Interview Rescheduled"
Message: "Your interview 'Technical Interview - Round 1' for Senior Frontend Developer
          has been rescheduled from Feb 1, 2024 at 10:00 AM to Feb 2, 2024 at 2:00 PM.
          Reason: Interviewer unavailable at original time"
```

#### INTERVIEW_CANCELLED
Sent to: Applicant + All Interviewers
```
Title: "Interview Cancelled"
Message: "Your interview 'Technical Interview - Round 1' for Senior Frontend Developer
          scheduled for Feb 1, 2024 at 10:00 AM has been cancelled.
          Reason: Candidate withdrew application"
```

#### INTERVIEW_ASSIGNED
Sent to: Newly Assigned Interviewers
```
Title: "Interview Assignment"
Message: "You have been assigned to conduct an interview 'Technical Interview - Round 1'
          for Senior Frontend Developer on Feb 1, 2024 at 10:00 AM."
```

## Business Rules

### Scheduling
- ✅ At least one interviewer required
- ✅ All interviewers must have INTERVIEWER, MANAGER, or ADMIN role
- ✅ All interviewers must be active users
- ✅ Application status updated to INTERVIEW_R1 or INTERVIEW_R2 based on round

### Rescheduling
- ❌ Cannot reschedule cancelled interviews
- ❌ Cannot reschedule completed interviews
- ✅ Reason required
- ✅ Status changed to RESCHEDULED

### Cancellation
- ❌ Cannot cancel already cancelled interviews
- ❌ Cannot cancel completed interviews
- ✅ Reason required
- ✅ Status changed to CANCELLED

### Completion
- ✅ Only assigned interviewers can complete
- ✅ Each interviewer completes independently
- ✅ Interview marked COMPLETED when all interviewers complete
- ✅ Can provide feedback, rating (1-10), and recommendation

### Interviewer Assignment
- ✅ Can add/remove interviewers
- ❌ Cannot modify cancelled or completed interviews
- ✅ Notifications sent only to newly added interviewers

## Files Created

### Validators
- `backend/src/validators/interview.validator.ts` (70 lines)
  - Schedule, reschedule, cancel, assign, complete schemas

### Services
- `backend/src/services/notification.service.ts` (200 lines)
  - Generic notification sending
  - Interview-specific notification methods
- `backend/src/services/interview.service.ts` (854 lines)
  - Schedule, reschedule, cancel, assign, complete
  - Get interviewer interviews and details

### Controllers
- `backend/src/controllers/interview.controller.ts` (448 lines)
  - Full Swagger documentation
  - Request validation and error handling

### Routes
- `backend/src/routes/interview.routes.ts` (100 lines)
  - Recruiter routes with RBAC
  - Interviewer routes with RBAC

### Tests
- `backend/scripts/test-interviews.ts` (325 lines)
  - Automated test suite for all endpoints

### Documentation
- `INTERVIEW_SCHEDULING.md` (this file)

## Files Modified

### Database Schema
- `backend/prisma/schema.prisma`
  - Updated Interview model (removed single interviewer, added scheduledBy)
  - Renamed InterviewAssignment to InterviewerAssignment
  - Added cancelReason, rescheduleReason fields
  - Updated User relations
  - Updated Application relations

### Application
- `backend/src/index.ts`
  - Registered interview routes

### Package Configuration
- `backend/package.json`
  - Added `test:interviews` script

## Testing

### Automated Tests
```bash
cd backend
npm run test:interviews
```

Tests include:
- ✅ Schedule interview
- ✅ Get interviewer interviews
- ✅ Get interview details (with CV and evaluations)
- ✅ Reschedule interview
- ✅ Assign interviewers
- ✅ Complete interview
- ✅ Cancel interview

### Swagger UI
Navigate to http://localhost:3000/api-docs
- Find "Interviews" section
- Test all endpoints interactively

## Database Migration

**Required:** Run migration to update database schema

```bash
cd backend

# Create .env file if not exists
cp .env.example .env
# Edit .env and set DATABASE_URL

# Run migration
npx prisma migrate dev --name add-interview-scheduling

# Generate Prisma client
npx prisma generate

# Start server
npm run dev
```

## Role-Based Access Control

| Action | Recruiter | Interviewer | Applicant |
|--------|-----------|-------------|-----------|
| Schedule interview | ✅ | ❌ | ❌ |
| Reschedule interview | ✅ | ❌ | ❌ |
| Cancel interview | ✅ | ❌ | ❌ |
| Assign interviewers | ✅ | ❌ | ❌ |
| Get assigned interviews | ❌ | ✅ | ❌ |
| Get interview details | ❌ | ✅ (assigned only) | ❌ |
| Complete interview | ❌ | ✅ (assigned only) | ❌ |

## Summary

The interview scheduling system is **production-ready** with:

✅ **Multiple interviewers** per interview
✅ **Automatic notifications** on schedule/reschedule/cancel
✅ **Application status integration** (INTERVIEW_R1/R2)
✅ **Individual completion tracking** for each interviewer
✅ **Complete RBAC** for all endpoints
✅ **Full audit logging** for compliance
✅ **Comprehensive testing** (automated + manual)
✅ **Full Swagger documentation**

The system ensures proper workflow, notifications, and tracking throughout the interview process! 🎉


