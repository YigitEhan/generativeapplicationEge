# Use Case Descriptions

## Use Case 1: Applicant Applies for a Position

### Actors
- **Primary**: Applicant (Job Seeker)
- **Secondary**: System

### Preconditions
- Vacancy is published and open
- Applicant has registered an account

### Main Flow
1. Applicant browses the public careers page
2. Applicant views available vacancies with filters (department, employment type)
3. Applicant selects a vacancy to view full details
4. Applicant clicks "Apply for this position"
5. System redirects to login page if not authenticated
6. Applicant logs in with credentials
7. System displays application form
8. Applicant fills in cover letter
9. Applicant uploads CV (PDF format, max 5MB)
10. Applicant submits application
11. System validates the application data
12. System parses CV and extracts structured data (education, experience, skills)
13. System creates application record with status "APPLIED"
14. System sends confirmation email to applicant
15. System creates notification for recruiter
16. System displays success message and redirects to "My Applications"

### Postconditions
- Application is created and stored in database
- Application status is "APPLIED"
- CV file is stored in uploads directory
- Structured CV data is saved
- Applicant receives confirmation email
- Recruiter receives notification
- Audit log entry is created

### Alternative Flows

**3a. Applicant not logged in**
- System shows "Sign in to apply" button
- Applicant can register or login before applying

**10a. Duplicate application**
- System detects existing application for same vacancy
- System displays error: "You have already applied for this position"
- Application is not created

**10b. Invalid file format**
- System validates file type
- System displays error: "Please upload a PDF file"
- Applicant must upload correct format

**10c. File too large**
- System validates file size
- System displays error: "File size must be less than 5MB"
- Applicant must upload smaller file

### Business Rules
- One applicant can only apply once per vacancy
- CV must be in PDF format
- CV file size must not exceed 5MB
- Cover letter is required
- Vacancy must be in "PUBLISHED" status

---

## Use Case 2: Recruiter Schedules an Interview

### Actors
- **Primary**: Recruiter
- **Secondary**: Applicant, Interviewer(s), System

### Preconditions
- Recruiter is authenticated
- Application exists and is in appropriate status
- At least one interviewer is available in the system

### Main Flow
1. Recruiter logs into the system
2. Recruiter navigates to "Applications" section
3. Recruiter filters applications by vacancy or status
4. Recruiter selects an application to review
5. Recruiter views application details, CV, and cover letter
6. Recruiter decides to schedule an interview
7. Recruiter clicks "Schedule Interview" button
8. System displays interview scheduling form
9. Recruiter fills in interview details:
   - Date and time
   - Location (physical address or video link)
   - Interview type (PHONE, VIDEO, IN_PERSON)
   - Duration
   - Notes
10. Recruiter selects one or more interviewers from the list
11. Recruiter submits the interview schedule
12. System validates the interview data
13. System creates interview record with status "SCHEDULED"
14. System updates application status to "INTERVIEW_SCHEDULED"
15. System sends email notification to applicant with interview details
16. System sends email notification to each assigned interviewer
17. System creates in-app notifications for all parties
18. System displays success message
19. System creates audit log entry

### Postconditions
- Interview is created and scheduled
- Application status is updated to "INTERVIEW_SCHEDULED"
- Applicant receives interview invitation email
- Interviewers receive assignment notifications
- All parties can view interview details
- Audit log records the action

### Alternative Flows

**11a. Missing required fields**
- System validates form data
- System displays error messages for missing fields
- Recruiter must complete all required fields

**11b. Past date selected**
- System validates interview date
- System displays error: "Interview date must be in the future"
- Recruiter must select valid date

**13a. Interviewer not available**
- System checks interviewer availability (optional feature)
- System warns recruiter about potential conflicts
- Recruiter can proceed or select different time

**After scheduling - Reschedule needed**
1. Recruiter navigates to interview details
2. Recruiter clicks "Reschedule"
3. Recruiter updates date/time/location
4. System sends updated notifications to all parties
5. System logs the change

**After scheduling - Cancellation needed**
1. Recruiter navigates to interview details
2. Recruiter clicks "Cancel Interview"
3. Recruiter provides cancellation reason
4. System updates interview status to "CANCELLED"
5. System sends cancellation notifications
6. System updates application status

### Business Rules
- Interview date must be in the future
- At least one interviewer must be assigned
- Interview type must be PHONE, VIDEO, or IN_PERSON
- Only recruiters can schedule interviews
- Applicant must be notified at least 24 hours before interview (business rule)

---

## Use Case 3: Interviewer Evaluates a Candidate

### Actors
- **Primary**: Interviewer
- **Secondary**: Recruiter, Manager, System

### Preconditions
- Interviewer is authenticated
- Interview has been completed
- Interviewer was assigned to the interview
- Evaluation record exists for the application

### Main Flow
1. Interviewer logs into the system
2. Interviewer navigates to "My Interviews" dashboard
3. System displays list of assigned interviews
4. Interviewer selects a completed interview
5. System displays interview details and applicant information
6. Interviewer clicks "Submit Evaluation" button
7. System displays evaluation form
8. Interviewer reviews applicant's CV and interview notes
9. Interviewer fills in evaluation details:
   - Overall rating (1-5 scale)
   - Technical skills assessment
   - Communication skills assessment
   - Cultural fit assessment
   - Strengths (text)
   - Weaknesses (text)
   - Recommendation (STRONGLY_RECOMMEND, RECOMMEND, NEUTRAL, NOT_RECOMMEND)
   - Additional notes
10. Interviewer submits the evaluation
11. System validates evaluation data
12. System updates evaluation record
13. System marks interview as "COMPLETED"
14. System updates evaluation status to "COMPLETED"
15. System sends notification to recruiter
16. System sends notification to hiring manager
17. System displays success message
18. System creates audit log entry

### Postconditions
- Evaluation is submitted and stored
- Interview status is "COMPLETED"
- Evaluation status is "COMPLETED"
- Recruiter receives notification
- Manager receives notification
- Evaluation is visible to authorized users
- Audit log records the submission

### Alternative Flows

**6a. Evaluation already submitted**
- System checks if interviewer already submitted evaluation
- System displays view-only mode with submitted evaluation
- Interviewer can view but not edit

**10a. Missing required fields**
- System validates evaluation form
- System displays error messages
- Interviewer must complete all required fields

**10b. Invalid rating value**
- System validates rating is between 1-5
- System displays error message
- Interviewer must provide valid rating

**Multiple interviewers scenario**
1. Multiple interviewers are assigned to same interview
2. Each interviewer submits their own evaluation
3. System aggregates ratings and recommendations
4. Recruiter sees all evaluations
5. Manager sees consolidated view

### Business Rules
- Only assigned interviewers can submit evaluations
- Rating must be between 1 and 5
- All required fields must be completed
- Evaluation can only be submitted after interview is completed
- Once submitted, evaluation cannot be edited (immutable for audit)
- Recommendation must be one of: STRONGLY_RECOMMEND, RECOMMEND, NEUTRAL, NOT_RECOMMEND

---

## Use Case 4: Manager Requests a Vacancy

### Actors
- **Primary**: Manager (Hiring Manager)
- **Secondary**: Recruiter, System

### Preconditions
- Manager is authenticated
- Manager has MANAGER or ADMIN role
- Manager belongs to a department

### Main Flow
1. Manager logs into the system
2. Manager navigates to "Vacancy Requests" section
3. Manager clicks "Create New Request" button
4. System displays vacancy request form
5. Manager fills in vacancy details:
   - Job title
   - Department (auto-filled from manager's department)
   - Number of positions
   - Employment type (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP)
   - Experience level (ENTRY, JUNIOR, MID, SENIOR, LEAD, EXECUTIVE)
   - Job description
   - Required qualifications
   - Responsibilities
   - Preferred skills
   - Salary range (min and max)
   - Location
   - Benefits
   - Justification for the position
   - Urgency level
6. Manager reviews the information
7. Manager submits the vacancy request
8. System validates the request data
9. System creates vacancy request with status "PENDING"
10. System assigns request to recruiting team
11. System sends notification to recruiters
12. System sends confirmation email to manager
13. System displays success message
14. System creates audit log entry

### Postconditions
- Vacancy request is created with status "PENDING"
- Request is visible to recruiters
- Manager receives confirmation
- Recruiters receive notification
- Request appears in manager's dashboard
- Audit log records the creation

### Alternative Flows

**7a. Missing required fields**
- System validates form data
- System displays error messages for each missing field
- Manager must complete all required fields

**7b. Invalid salary range**
- System validates that max salary > min salary
- System displays error: "Maximum salary must be greater than minimum salary"
- Manager must correct the values

**After submission - Recruiter approves**
1. Recruiter reviews the vacancy request
2. Recruiter clicks "Approve" button
3. System updates request status to "APPROVED"
4. System sends notification to manager
5. Recruiter can now create vacancy from approved request

**After submission - Recruiter declines**
1. Recruiter reviews the vacancy request
2. Recruiter clicks "Decline" button
3. Recruiter provides reason for declining
4. System updates request status to "DECLINED"
5. System sends notification to manager with reason
6. Manager can revise and resubmit

**After submission - Manager updates request**
1. Manager views pending request
2. Manager clicks "Edit" button (only if status is PENDING)
3. Manager updates information
4. System saves changes
5. System notifies recruiters of update

### Business Rules
- Only managers can create vacancy requests
- Department is automatically set to manager's department
- Salary range: maximum must be greater than minimum
- Request must include justification
- Only PENDING requests can be edited
- Only recruiters can approve/decline requests
- Approved requests can be converted to vacancies
- Declined requests can be revised and resubmitted

### Success Metrics
- Request is created successfully
- Recruiter receives notification within 1 minute
- Manager can track request status
- Request appears in reporting dashboards

---

## Use Case Summary

### System Workflow Overview

```
1. Manager requests vacancy → Recruiter approves → Vacancy published
2. Applicant applies → CV uploaded and parsed → Application created
3. Recruiter reviews → Invites to test → Applicant takes test
4. Recruiter schedules interview → Interviewer conducts → Evaluation submitted
5. Manager reviews evaluations → Final decision → Offer extended
```

### Actor Interactions

| Actor | Primary Actions | Interactions |
|-------|----------------|--------------|
| **Applicant** | Browse vacancies, Apply, Take tests, Attend interviews | System, Recruiter |
| **Recruiter** | Approve requests, Publish vacancies, Review applications, Schedule interviews, Manage process | Manager, Applicant, Interviewer, System |
| **Manager** | Request vacancies, Review evaluations, Make hiring decisions | Recruiter, System |
| **Interviewer** | Conduct interviews, Submit evaluations | Recruiter, Applicant, System |
| **Admin** | Manage users, System configuration | All actors, System |

### Key System Features

1. **Role-Based Access Control**: Each actor has specific permissions
2. **Automated Notifications**: Email and in-app notifications for all key events
3. **Audit Trail**: Complete logging of all actions for compliance
4. **Data Validation**: Input validation at all entry points
5. **File Management**: Secure CV upload and storage
6. **Status Tracking**: Clear status progression through recruitment pipeline

