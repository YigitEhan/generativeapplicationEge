# ✅ VacancyRequest Endpoints Implementation Complete

## 📋 Summary

Comprehensive VacancyRequest management system with role-based access control (RBAC) and complete audit logging has been implemented.

## ✨ Features Implemented

### 1. **Manager Endpoints**

Managers can create and manage their own vacancy requests:

- ✅ `POST /api/vacancy-requests` - Create new vacancy request (DRAFT or PENDING)
- ✅ `PUT /api/vacancy-requests/:id` - Update request (only if not approved)
- ✅ `POST /api/vacancy-requests/:id/submit` - Submit request (DRAFT → PENDING)
- ✅ `POST /api/vacancy-requests/:id/cancel` - Cancel request (if not approved)
- ✅ `GET /api/vacancy-requests` - View own requests only
- ✅ `GET /api/vacancy-requests/:id` - View own request details
- ✅ `DELETE /api/vacancy-requests/:id` - Delete own DRAFT requests

### 2. **Recruiter Endpoints**

Recruiters can review and process pending requests:

- ✅ `GET /api/vacancy-requests?status=PENDING` - View all pending requests
- ✅ `POST /api/vacancy-requests/:id/approve` - Approve request
- ✅ `POST /api/vacancy-requests/:id/decline` - Decline with reason
- ✅ `GET /api/vacancy-requests` - View all requests
- ✅ `GET /api/vacancy-requests/:id` - View any request details

### 3. **Admin Endpoints**

Admins have full access to all operations:

- ✅ All Manager endpoints (for any user)
- ✅ All Recruiter endpoints
- ✅ `DELETE /api/vacancy-requests/:id` - Delete any request

### 4. **Audit Logging**

All status changes are automatically logged to the AuditLog table:

- ✅ Request creation
- ✅ Request updates
- ✅ Status changes (DRAFT → PENDING, PENDING → APPROVED, etc.)
- ✅ Approvals (with approver ID and timestamp)
- ✅ Declines (with reason and decliner ID)
- ✅ Cancellations (with canceller ID)
- ✅ Deletions
- ✅ IP address and user agent tracking

### 5. **Request Statuses**

- **DRAFT** - Initial state, can be edited and deleted
- **PENDING** - Submitted for review, awaiting recruiter action
- **APPROVED** - Approved by recruiter, cannot be edited
- **DECLINED** - Declined by recruiter with reason
- **CANCELLED** - Cancelled by manager

### 6. **Validation & Business Rules**

- ✅ Managers can only edit/view/cancel their own requests
- ✅ Cannot edit approved or declined requests
- ✅ Cannot cancel approved requests
- ✅ Only PENDING requests can be approved/declined
- ✅ Only DRAFT requests can be submitted
- ✅ Department must exist and be active
- ✅ Required fields validation (title, description, skills)
- ✅ Decline reason is required when declining

## 📁 Files Created

```
backend/src/validators/vacancyRequest.validator.ts    # Zod validation schemas
backend/src/services/auditLog.service.ts              # Audit logging service
backend/src/services/vacancyRequest.service.ts        # Business logic
backend/src/controllers/vacancyRequest.controller.ts  # Request handlers
backend/src/routes/vacancyRequest.routes.ts           # Route definitions
backend/scripts/test-vacancy-requests.ts              # Automated tests
backend/test-vacancy-requests.http                    # Manual API tests
```

## 📁 Files Modified

```
backend/src/index.ts                                  # Added vacancy request routes
backend/package.json                                  # Added test:vacancy-requests script
```

## 🚀 Quick Start

### 1. Start the Server
```bash
cd backend
npm run dev
```

### 2. Test the Endpoints

#### Option A: Automated Tests
```bash
npm run test:vacancy-requests
```

#### Option B: Manual Testing
1. Open `backend/test-vacancy-requests.http` in VS Code
2. Install REST Client extension
3. Update tokens and IDs
4. Click "Send Request" on any endpoint

#### Option C: Swagger UI
1. Navigate to http://localhost:3000/api-docs
2. Find "VacancyRequests" section
3. Test endpoints interactively

## 📖 API Documentation

### Manager: Create Vacancy Request

```bash
POST /api/vacancy-requests
Authorization: Bearer MANAGER_TOKEN
Content-Type: application/json

{
  "title": "Senior Software Engineer",
  "description": "We need an experienced software engineer",
  "departmentId": "uuid-here",
  "justification": "Team expansion due to increased workload",
  "numberOfPositions": 2,
  "requiredSkills": ["JavaScript", "TypeScript", "React", "Node.js"],
  "experienceLevel": "Senior (5+ years)",
  "salaryRange": "$100,000 - $130,000",
  "status": "DRAFT"
}
```

### Manager: Update Request

```bash
PUT /api/vacancy-requests/:id
Authorization: Bearer MANAGER_TOKEN
Content-Type: application/json

{
  "numberOfPositions": 3,
  "salaryRange": "$110,000 - $140,000"
}
```

### Manager: Submit Request

```bash
POST /api/vacancy-requests/:id/submit
Authorization: Bearer MANAGER_TOKEN
```

### Manager: Cancel Request

```bash
POST /api/vacancy-requests/:id/cancel
Authorization: Bearer MANAGER_TOKEN
```

### Recruiter: Get Pending Requests

```bash
GET /api/vacancy-requests?status=PENDING
Authorization: Bearer RECRUITER_TOKEN
```

### Recruiter: Approve Request

```bash
POST /api/vacancy-requests/:id/approve
Authorization: Bearer RECRUITER_TOKEN
```

### Recruiter: Decline Request

```bash
POST /api/vacancy-requests/:id/decline
Authorization: Bearer RECRUITER_TOKEN
Content-Type: application/json

{
  "declinedReason": "Budget constraints - please resubmit next quarter"
}
```

### Get All Requests (with filters)

```bash
# Manager - sees only their own
GET /api/vacancy-requests
Authorization: Bearer MANAGER_TOKEN

# Recruiter/Admin - sees all
GET /api/vacancy-requests?status=PENDING&page=1&limit=10
Authorization: Bearer RECRUITER_TOKEN
```

## 🔒 Role-Based Access Control

| Endpoint | Manager | Recruiter | Admin |
|----------|---------|-----------|-------|
| POST /vacancy-requests | ✅ Own | ❌ | ✅ Any |
| PUT /vacancy-requests/:id | ✅ Own (if not approved) | ❌ | ✅ Any |
| POST /vacancy-requests/:id/submit | ✅ Own | ❌ | ✅ Any |
| POST /vacancy-requests/:id/cancel | ✅ Own | ❌ | ✅ Any |
| POST /vacancy-requests/:id/approve | ❌ | ✅ | ✅ |
| POST /vacancy-requests/:id/decline | ❌ | ✅ | ✅ |
| GET /vacancy-requests | ✅ Own only | ✅ All | ✅ All |
| GET /vacancy-requests/:id | ✅ Own only | ✅ All | ✅ All |
| DELETE /vacancy-requests/:id | ✅ Own DRAFT | ❌ | ✅ Any |

## 📊 Audit Log Structure

Every action is logged with:

```typescript
{
  userId: string;           // Who performed the action
  action: string;           // CREATE, UPDATE, STATUS_CHANGE, DELETE
  entity: 'VacancyRequest';
  entityId: string;         // Request ID
  changes: {                // Action-specific data
    oldStatus?: string;
    newStatus?: string;
    approvedBy?: string;
    declinedReason?: string;
    // ... more fields
  };
  ipAddress?: string;       // Request IP
  userAgent?: string;       // Browser/client info
  createdAt: Date;          // When it happened
}
```

## 🎯 Workflow Example

1. **Manager creates DRAFT request**
   - Status: DRAFT
   - Audit: CREATE action logged

2. **Manager edits request** (optional)
   - Status: Still DRAFT
   - Audit: UPDATE action logged

3. **Manager submits request**
   - Status: DRAFT → PENDING
   - Audit: STATUS_CHANGE logged

4. **Recruiter reviews pending requests**
   - GET /vacancy-requests?status=PENDING

5. **Recruiter approves OR declines**
   - If approved: Status → APPROVED
   - If declined: Status → DECLINED (with reason)
   - Audit: STATUS_CHANGE logged with approver/decliner info

6. **Manager can cancel** (if not approved)
   - Status → CANCELLED
   - Audit: STATUS_CHANGE logged

## ✅ Testing Checklist

- [ ] Manager can create DRAFT request
- [ ] Manager can create PENDING request
- [ ] Manager can update own DRAFT request
- [ ] Manager cannot update APPROVED request
- [ ] Manager can submit DRAFT request
- [ ] Manager can cancel own request (if not approved)
- [ ] Manager can only view own requests
- [ ] Recruiter can view all PENDING requests
- [ ] Recruiter can approve PENDING request
- [ ] Recruiter can decline PENDING request with reason
- [ ] Manager cannot approve requests (403)
- [ ] All actions are logged to AuditLog
- [ ] Swagger docs are accessible
- [ ] Validation errors return proper messages

## 🎉 Next Steps

1. ✅ VacancyRequest endpoints are complete
2. 🔄 Consider creating Vacancy endpoints (when request is approved)
3. 🔄 Add email notifications for status changes
4. 🔄 Create frontend UI for request management
5. 🔄 Add analytics/reporting for requests

## 📝 Notes

- All audit logs include IP address and user agent for security tracking
- Managers are restricted to their own requests for data isolation
- Recruiters and Admins can see all requests for oversight
- Cannot delete requests that have associated vacancies
- Decline reason is mandatory to ensure proper communication

