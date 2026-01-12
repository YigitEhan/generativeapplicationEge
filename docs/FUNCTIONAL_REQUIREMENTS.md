# Functional Requirements

## 1. User Management

### 1.1 Authentication
- **FR-1.1.1**: The system shall allow users to register with email and password
- **FR-1.1.2**: The system shall authenticate users using JWT tokens
- **FR-1.1.3**: The system shall hash passwords using bcrypt before storage
- **FR-1.1.4**: The system shall support five user roles: APPLICANT, RECRUITER, MANAGER, INTERVIEWER, ADMIN

### 1.2 Authorization
- **FR-1.2.1**: The system shall restrict access to features based on user roles
- **FR-1.2.2**: The system shall allow only authenticated users to access protected endpoints
- **FR-1.2.3**: The system shall provide role-specific dashboards and interfaces

## 2. Vacancy Management

### 2.1 Vacancy Requests
- **FR-2.1.1**: Managers shall be able to create vacancy requests for their departments
- **FR-2.1.2**: Vacancy requests shall include: title, department, description, requirements, salary range
- **FR-2.1.3**: Recruiters shall be able to approve or decline vacancy requests
- **FR-2.1.4**: The system shall track vacancy request status (PENDING, APPROVED, DECLINED)

### 2.2 Vacancy Publishing
- **FR-2.2.1**: Recruiters shall be able to create vacancies from approved requests
- **FR-2.2.2**: Recruiters shall be able to publish vacancies to make them public
- **FR-2.2.3**: The system shall display published vacancies on the public careers page
- **FR-2.2.4**: Recruiters shall be able to close vacancies when positions are filled
- **FR-2.2.5**: Vacancies shall include: title, description, requirements, responsibilities, benefits, location, employment type, experience level, salary range

### 2.3 Vacancy Browsing
- **FR-2.3.1**: Public users shall be able to browse published vacancies without authentication
- **FR-2.3.2**: The system shall allow filtering vacancies by department and employment type
- **FR-2.3.3**: The system shall display vacancy details including all job information

## 3. Application Management

### 3.1 Application Submission
- **FR-3.1.1**: Applicants shall be able to apply for published vacancies
- **FR-3.1.2**: Applications shall require a cover letter and CV upload (PDF format)
- **FR-3.1.3**: The system shall parse and store structured CV data (education, experience, skills)
- **FR-3.1.4**: The system shall prevent duplicate applications for the same vacancy

### 3.2 Application Tracking
- **FR-3.2.1**: Applicants shall be able to view all their applications and their statuses
- **FR-3.2.2**: The system shall track application status through the recruitment pipeline
- **FR-3.2.3**: Application statuses shall include: APPLIED, SCREENING, TEST_INVITED, TEST_COMPLETED, INTERVIEW_SCHEDULED, INTERVIEW_COMPLETED, OFFER_EXTENDED, HIRED, REJECTED, WITHDRAWN
- **FR-3.2.4**: The system shall display application timeline showing all status changes

### 3.3 Application Review
- **FR-3.3.1**: Recruiters shall be able to view all applications for their vacancies
- **FR-3.3.2**: Recruiters shall be able to update application status
- **FR-3.3.3**: Recruiters shall be able to download applicant CVs
- **FR-3.3.4**: Recruiters shall be able to filter applications by status and vacancy

## 4. Testing System

### 4.1 Test Creation
- **FR-4.1.1**: Recruiters shall be able to create tests for vacancies
- **FR-4.1.2**: Tests shall support two types: QUIZ (multiple choice) and CODING (programming challenges)
- **FR-4.1.3**: Quiz tests shall include questions with multiple choice answers
- **FR-4.1.4**: The system shall store correct answers for automatic grading

### 4.2 Test Administration
- **FR-4.2.1**: Recruiters shall be able to invite applicants to take tests
- **FR-4.2.2**: Applicants shall receive notifications when invited to tests
- **FR-4.2.3**: Applicants shall be able to submit test answers
- **FR-4.2.4**: The system shall automatically grade quiz tests
- **FR-4.2.5**: Recruiters shall be able to manually mark coding tests as complete

### 4.3 Test Results
- **FR-4.3.1**: The system shall calculate and store test scores
- **FR-4.3.2**: Recruiters shall be able to view test results and answers
- **FR-4.3.3**: The system shall update application status when tests are completed

## 5. Interview Management

### 5.1 Interview Scheduling
- **FR-5.1.1**: Recruiters shall be able to schedule interviews for applications
- **FR-5.1.2**: Interviews shall include: date, time, location, type (PHONE, VIDEO, IN_PERSON)
- **FR-5.1.3**: Recruiters shall be able to assign multiple interviewers to an interview
- **FR-5.1.4**: The system shall send notifications to applicants and interviewers

### 5.2 Interview Management
- **FR-5.2.1**: Recruiters shall be able to reschedule interviews
- **FR-5.2.2**: Recruiters shall be able to cancel interviews
- **FR-5.2.3**: The system shall track interview status (SCHEDULED, COMPLETED, CANCELLED)
- **FR-5.2.4**: Interviewers shall be able to view their assigned interviews

### 5.3 Interview Feedback
- **FR-5.3.1**: Interviewers shall be able to submit feedback after interviews
- **FR-5.3.2**: Feedback shall include notes and rating (1-5 scale)
- **FR-5.3.3**: The system shall mark interviews as completed when feedback is submitted
- **FR-5.3.4**: Recruiters shall be able to view all interview feedback

## 6. Evaluation System

### 6.1 Evaluation Creation
- **FR-6.1.1**: Recruiters shall be able to create evaluations for applications
- **FR-6.1.2**: Evaluations shall include overall rating, strengths, weaknesses, and recommendation
- **FR-6.1.3**: The system shall track evaluation status (PENDING, IN_PROGRESS, COMPLETED)

### 6.2 Evaluation Process
- **FR-6.2.1**: Interviewers shall be able to update evaluations with their assessments
- **FR-6.2.2**: Interviewers shall be able to submit completed evaluations
- **FR-6.2.3**: Managers shall be able to provide final recommendations
- **FR-6.2.4**: The system shall enforce that only assigned interviewers can evaluate

### 6.3 Evaluation Review
- **FR-6.3.1**: Recruiters shall be able to view all evaluations
- **FR-6.3.2**: Managers shall be able to view evaluations for their department
- **FR-6.3.3**: The system shall aggregate ratings from multiple interviewers

## 7. Notification System

### 7.1 Notification Types
- **FR-7.1.1**: The system shall send notifications for application status changes
- **FR-7.1.2**: The system shall send notifications for test invitations
- **FR-7.1.3**: The system shall send notifications for interview scheduling
- **FR-7.1.4**: The system shall send notifications for evaluation updates

### 7.2 Notification Delivery
- **FR-7.2.1**: The system shall send email notifications to users
- **FR-7.2.2**: The system shall store notifications in the database
- **FR-7.2.3**: Users shall be able to view their notification history
- **FR-7.2.4**: Users shall be able to mark notifications as read

## 8. Audit and Compliance

### 8.1 Audit Logging
- **FR-8.1.1**: The system shall log all create, update, and delete operations
- **FR-8.1.2**: Audit logs shall include: user, action, entity type, entity ID, timestamp, changes
- **FR-8.1.3**: The system shall maintain immutable audit logs

### 8.2 Data Management
- **FR-8.2.1**: The system shall store uploaded CVs securely
- **FR-8.2.2**: The system shall validate file uploads (type, size)
- **FR-8.2.3**: The system shall maintain data integrity through database constraints

## 9. Reporting and Analytics

### 9.1 Dashboard Metrics
- **FR-9.1.1**: Applicants shall see their application statistics
- **FR-9.1.2**: Recruiters shall see vacancy and application metrics
- **FR-9.1.3**: Managers shall see department hiring metrics
- **FR-9.1.4**: Interviewers shall see their assigned interview count

### 9.2 Data Filtering
- **FR-9.2.1**: The system shall allow filtering data by date ranges
- **FR-9.2.2**: The system shall allow filtering by status
- **FR-9.2.3**: The system shall allow filtering by department

## 10. Non-Functional Requirements

### 10.1 Security
- **NFR-10.1.1**: All passwords shall be hashed using bcrypt
- **NFR-10.1.2**: All API endpoints shall use HTTPS in production
- **NFR-10.1.3**: JWT tokens shall expire after 7 days
- **NFR-10.1.4**: The system shall validate all user inputs

### 10.2 Performance
- **NFR-10.2.1**: API responses shall return within 2 seconds
- **NFR-10.2.2**: The system shall support concurrent users
- **NFR-10.2.3**: File uploads shall be limited to 5MB

### 10.3 Usability
- **NFR-10.3.1**: The interface shall be responsive and mobile-friendly
- **NFR-10.3.2**: The system shall provide clear error messages
- **NFR-10.3.3**: The system shall provide loading indicators for async operations

### 10.4 Maintainability
- **NFR-10.4.1**: The codebase shall be written in TypeScript
- **NFR-10.4.2**: The API shall be documented using Swagger/OpenAPI
- **NFR-10.4.3**: The system shall include unit tests for business logic

