# How the Recruitment Process Works

## Overview

This document explains the complete recruitment workflow in the Recruitment Management System, from vacancy creation to candidate hiring.

## Complete Recruitment Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RECRUITMENT PROCESS FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

1. VACANCY CREATION
   Manager → Creates Vacancy Request → Recruiter Reviews → Approves/Declines
   
2. VACANCY PUBLISHING
   Recruiter → Creates Vacancy → Publishes → Visible to Public
   
3. APPLICATION SUBMISSION
   Applicant → Browses Vacancies → Applies with CV → Application Created
   
4. SCREENING
   Recruiter → Reviews Application → Updates Status → Screening Decision
   
5. TESTING (Optional)
   Recruiter → Creates Test → Invites Applicant → Applicant Takes Test
   
6. INTERVIEW SCHEDULING
   Recruiter → Schedules Interview → Assigns Interviewers → Notifications Sent
   
7. INTERVIEW EXECUTION
   Interviewer → Conducts Interview → Submits Feedback → Evaluation Created
   
8. EVALUATION
   Interviewer → Completes Evaluation → Manager Reviews → Recommendation
   
9. DECISION
   Recruiter → Reviews All Feedback → Makes Decision → Offer/Rejection
   
10. HIRING
    Recruiter → Extends Offer → Applicant Accepts → Status: HIRED
```

## Detailed Process Steps

### Step 1: Vacancy Request Creation

**Actor**: Manager (Hiring Manager)

**Process**:
1. Manager identifies hiring need in their department
2. Manager logs into the system
3. Manager creates a vacancy request with:
   - Job title and description
   - Required qualifications
   - Salary range
   - Number of positions
   - Justification for the position
4. System creates request with status "PENDING"
5. System notifies recruiting team

**Output**: Vacancy Request (Status: PENDING)

**Business Rules**:
- Only managers can create requests
- Department is auto-assigned from manager's profile
- Salary max must be greater than salary min
- Justification is required

---

### Step 2: Vacancy Request Approval

**Actor**: Recruiter

**Process**:
1. Recruiter receives notification of new request
2. Recruiter reviews the vacancy request details
3. Recruiter evaluates:
   - Business justification
   - Budget availability
   - Alignment with hiring plan
4. Recruiter makes decision:
   - **Approve**: Request status → APPROVED
   - **Decline**: Request status → DECLINED (with reason)
5. System notifies manager of decision

**Output**: 
- If approved: Vacancy Request (Status: APPROVED)
- If declined: Vacancy Request (Status: DECLINED)

**Business Rules**:
- Only recruiters can approve/decline
- Declined requests can be revised and resubmitted
- Approved requests can be converted to vacancies

---

### Step 3: Vacancy Creation and Publishing

**Actor**: Recruiter

**Process**:
1. Recruiter creates vacancy from approved request
2. Recruiter adds additional details:
   - Detailed job description
   - Responsibilities
   - Benefits
   - Location
   - Employment type
   - Experience level
3. Recruiter saves vacancy as DRAFT
4. Recruiter reviews and publishes vacancy
5. System updates status to PUBLISHED
6. Vacancy appears on public careers page

**Output**: Vacancy (Status: PUBLISHED)

**Business Rules**:
- Only approved requests can become vacancies
- Only DRAFT vacancies can be published
- Published vacancies are visible to public
- Vacancies can be closed when position is filled

---

### Step 4: Application Submission

**Actor**: Applicant (Job Seeker)

**Process**:
1. Applicant browses public careers page
2. Applicant views vacancy details
3. Applicant clicks "Apply for this position"
4. System prompts login/registration if needed
5. Applicant fills application form:
   - Cover letter
   - CV upload (PDF)
   - Structured data (education, experience, skills)
6. Applicant submits application
7. System validates and stores application
8. System parses CV and extracts structured data
9. System creates application with status "APPLIED"
10. System sends confirmation email to applicant
11. System notifies recruiter

**Output**: Application (Status: APPLIED)

**Business Rules**:
- Applicant must be logged in
- One application per vacancy per applicant
- CV must be PDF format, max 5MB
- Cover letter is required
- Vacancy must be PUBLISHED

---

### Step 5: Application Screening

**Actor**: Recruiter

**Process**:
1. Recruiter receives notification of new application
2. Recruiter reviews application:
   - Cover letter
   - CV (structured data)
   - Qualifications match
3. Recruiter makes screening decision:
   - **Proceed**: Status → SCREENING
   - **Reject**: Status → REJECTED (with reason)
4. System updates application status
5. System notifies applicant

**Output**: Application (Status: SCREENING or REJECTED)

**Business Rules**:
- Only recruiters can update application status
- Status changes are logged in audit trail
- Applicant receives notification of status change

---

### Step 6: Testing (Optional)

**Actor**: Recruiter, Applicant

**Process**:

**6a. Test Creation (Recruiter)**:
1. Recruiter creates test for vacancy
2. Recruiter selects test type:
   - **QUIZ**: Multiple choice questions
   - **CODING**: Programming challenges
3. Recruiter adds questions and correct answers
4. Recruiter sets passing score and duration
5. System saves test

**6b. Test Invitation (Recruiter)**:
1. Recruiter invites applicant to take test
2. System updates application status to TEST_INVITED
3. System sends test invitation email to applicant

**6c. Test Taking (Applicant)**:
1. Applicant receives test invitation
2. Applicant starts test
3. Applicant answers questions within time limit
4. Applicant submits test
5. System auto-grades QUIZ tests
6. System updates status to TEST_COMPLETED

**6d. Test Review (Recruiter)**:
1. Recruiter reviews test results
2. For CODING tests, recruiter manually evaluates
3. Recruiter marks test as complete
4. Recruiter decides to proceed or reject

**Output**: TestAttempt with score and pass/fail status

**Business Rules**:
- Tests are optional
- QUIZ tests are auto-graded
- CODING tests require manual review
- Applicant can only take test once
- Test must be completed within time limit

---

### Step 7: Interview Scheduling

**Actor**: Recruiter

**Process**:
1. Recruiter decides to interview candidate
2. Recruiter schedules interview:
   - Date and time
   - Location (physical or video link)
   - Interview type (PHONE, VIDEO, IN_PERSON)
   - Duration
3. Recruiter assigns one or more interviewers
4. System creates interview with status SCHEDULED
5. System updates application status to INTERVIEW_SCHEDULED
6. System sends notifications:
   - Email to applicant with interview details
   - Email to each interviewer with assignment
7. Calendar invites sent (optional feature)

**Output**: Interview (Status: SCHEDULED)

**Business Rules**:
- Interview date must be in the future
- At least one interviewer must be assigned
- Applicant must be notified at least 24 hours in advance
- Interviews can be rescheduled or cancelled

---

### Step 8: Interview Execution

**Actor**: Interviewer, Applicant

**Process**:
1. Interviewer and applicant meet at scheduled time
2. Interviewer conducts interview
3. Interviewer takes notes during interview
4. After interview, interviewer submits feedback:
   - Overall rating (1-5)
   - Technical skills assessment
   - Communication skills
   - Cultural fit
   - Strengths and weaknesses
   - Recommendation
5. System stores feedback
6. System marks interview as COMPLETED
7. System updates application status to INTERVIEW_COMPLETED
8. System notifies recruiter and manager

**Output**: InterviewerAssignment with feedback and rating

**Business Rules**:
- Only assigned interviewers can submit feedback
- Feedback can only be submitted after interview time
- Multiple interviewers can provide separate feedback
- All feedback is aggregated for review

---

### Step 9: Evaluation and Assessment

**Actor**: Interviewer, Manager

**Process**:

**9a. Evaluation Creation (Recruiter)**:
1. Recruiter creates evaluation for application
2. System assigns to interviewer(s)
3. Evaluation status: PENDING

**9b. Evaluation Completion (Interviewer)**:
1. Interviewer reviews all interview feedback
2. Interviewer completes comprehensive evaluation:
   - Overall rating (1-5)
   - Strengths
   - Weaknesses
   - Detailed notes
   - Recommendation (STRONGLY_RECOMMEND, RECOMMEND, NEUTRAL, NOT_RECOMMEND)
3. Interviewer submits evaluation
4. System updates evaluation status to COMPLETED
5. System notifies manager

**9c. Manager Recommendation (Manager)**:
1. Manager reviews all evaluations
2. Manager reviews interview feedback
3. Manager provides final recommendation
4. System stores manager's recommendation
5. System notifies recruiter

**Output**: Evaluation (Status: COMPLETED) with recommendation

**Business Rules**:
- Only assigned interviewers can evaluate
- Manager can only recommend for their department
- All evaluations are considered in final decision
- Evaluations are immutable once submitted (audit trail)

---

### Step 10: Final Decision

**Actor**: Recruiter

**Process**:
1. Recruiter reviews all information:
   - Application and CV
   - Test results
   - Interview feedback
   - Evaluations
   - Manager recommendation
2. Recruiter makes final decision:
   - **Offer**: Status → OFFER_EXTENDED
   - **Reject**: Status → REJECTED
3. System updates application status
4. System sends notification to applicant
5. If offer:
   - Recruiter sends formal offer letter
   - Applicant accepts/declines
   - If accepted: Status → HIRED
   - If declined: Status → OFFER_DECLINED

**Output**: Application (Status: OFFER_EXTENDED, HIRED, or REJECTED)

**Business Rules**:
- Only recruiters make final hiring decisions
- All decisions must be documented
- Rejected candidates receive feedback (optional)
- Hired candidates trigger onboarding process

---

### Step 11: Vacancy Closure

**Actor**: Recruiter

**Process**:
1. When position is filled, recruiter closes vacancy
2. System updates vacancy status to CLOSED
3. Vacancy no longer appears on public page
4. Remaining applications are updated to REJECTED
5. System sends notifications to remaining applicants

**Output**: Vacancy (Status: CLOSED)

---

## Application Status Flow

```
APPLIED
  ↓
SCREENING
  ↓
TEST_INVITED → TEST_COMPLETED
  ↓
INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED
  ↓
OFFER_EXTENDED
  ↓
HIRED ✓

(At any point) → REJECTED ✗
(Applicant can) → WITHDRAWN ✗
```

## Notification Timeline

| Event | Recipient | Notification Type |
|-------|-----------|-------------------|
| Vacancy request created | Recruiter | Email + In-app |
| Request approved/declined | Manager | Email + In-app |
| Vacancy published | - | - |
| Application submitted | Recruiter | Email + In-app |
| Application status changed | Applicant | Email + In-app |
| Test invitation | Applicant | Email + In-app |
| Test completed | Recruiter | In-app |
| Interview scheduled | Applicant, Interviewers | Email + In-app |
| Interview rescheduled | Applicant, Interviewers | Email + In-app |
| Interview cancelled | Applicant, Interviewers | Email + In-app |
| Feedback submitted | Recruiter | In-app |
| Evaluation completed | Manager, Recruiter | In-app |
| Final decision | Applicant | Email + In-app |

## Key Features

### 1. Transparency
- Applicants can track their application status in real-time
- Clear timeline showing all status changes
- Notifications at every step

### 2. Collaboration
- Multiple interviewers can participate
- Manager provides input on hiring decisions
- Recruiter coordinates entire process

### 3. Compliance
- Complete audit trail of all actions
- Immutable evaluation records
- Documented decision-making process

### 4. Efficiency
- Automated notifications reduce manual communication
- Structured workflow ensures no steps are missed
- Centralized information for all stakeholders

### 5. Quality
- Structured evaluation process
- Multiple assessment points (CV, test, interview, evaluation)
- Data-driven hiring decisions

## Process Duration (Typical)

| Stage | Duration |
|-------|----------|
| Vacancy request approval | 1-3 days |
| Vacancy publishing | Same day |
| Application screening | 1-5 days |
| Testing | 3-7 days |
| Interview scheduling | 5-10 days |
| Interview execution | 1 day |
| Evaluation | 2-5 days |
| Final decision | 1-3 days |
| **Total** | **2-5 weeks** |

## Success Metrics

- **Time to hire**: Average days from application to offer
- **Application quality**: Percentage reaching interview stage
- **Offer acceptance rate**: Percentage of offers accepted
- **Interviewer participation**: Average feedback submission time
- **Process completion**: Percentage of applications reaching final decision

---

**This structured process ensures fair, efficient, and compliant recruitment while providing excellent candidate experience.**

