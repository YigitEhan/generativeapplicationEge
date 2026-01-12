# Database Schema

## Overview

The recruitment management system uses PostgreSQL with Prisma ORM. The database consists of four main entities:

1. **User** - System users (admins, recruiters, hiring managers)
2. **Job** - Job postings
3. **Candidate** - Job candidates
4. **Application** - Job applications linking candidates to jobs

## Entity Relationship Diagram

```
User (1) ----< (N) Job
User (1) ----< (N) Application (reviewer)
Job (1) ----< (N) Application
Candidate (1) ----< (N) Application
```

## Tables

### User

Stores system users with authentication credentials.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique email address |
| password | String | Hashed password |
| firstName | String | User's first name |
| lastName | String | User's last name |
| role | Enum | User role (ADMIN, RECRUITER, HIRING_MANAGER) |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relations:**
- Has many Jobs (as creator)
- Has many Applications (as reviewer)

### Job

Stores job postings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | String | Job title |
| description | String | Job description |
| department | String | Department name |
| location | String | Job location |
| type | Enum | Job type (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP) |
| status | Enum | Job status (OPEN, CLOSED, DRAFT) |
| salary | String? | Salary range (optional) |
| requirements | String? | Job requirements (optional) |
| createdById | UUID | Foreign key to User |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relations:**
- Belongs to User (creator)
- Has many Applications

### Candidate

Stores candidate information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| firstName | String | Candidate's first name |
| lastName | String | Candidate's last name |
| email | String | Unique email address |
| phone | String? | Phone number (optional) |
| resumePath | String? | Path to resume file (optional) |
| skills | String[] | Array of skills |
| experience | Int? | Years of experience (optional) |
| education | String? | Education background (optional) |
| linkedIn | String? | LinkedIn profile URL (optional) |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relations:**
- Has many Applications

### Application

Links candidates to jobs and tracks application status.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| jobId | UUID | Foreign key to Job |
| candidateId | UUID | Foreign key to Candidate |
| status | Enum | Application status (PENDING, REVIEWING, INTERVIEW, OFFERED, ACCEPTED, REJECTED) |
| coverLetter | String? | Cover letter text (optional) |
| notes | String? | Internal notes (optional) |
| reviewedById | UUID? | Foreign key to User (reviewer, optional) |
| appliedAt | DateTime | Application timestamp |
| updatedAt | DateTime | Last update timestamp |

**Unique Constraint:** (jobId, candidateId) - A candidate can only apply once per job

**Relations:**
- Belongs to Job
- Belongs to Candidate
- Belongs to User (reviewer, optional)

## Enums

### UserRole
- ADMIN
- RECRUITER
- HIRING_MANAGER

### JobType
- FULL_TIME
- PART_TIME
- CONTRACT
- INTERNSHIP

### JobStatus
- OPEN
- CLOSED
- DRAFT

### ApplicationStatus
- PENDING
- REVIEWING
- INTERVIEW
- OFFERED
- ACCEPTED
- REJECTED

## Migrations

### Running Migrations

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Viewing Database

```bash
# Open Prisma Studio
npm run prisma:studio
```

This opens a GUI at http://localhost:5555 to view and edit data.

## Seeding

The seed script (`backend/prisma/seed.ts`) creates:

1. **Admin User**
   - Email: admin@recruitment.com
   - Password: admin123
   - Role: ADMIN

2. **Recruiter User**
   - Email: recruiter@recruitment.com
   - Password: recruiter123
   - Role: RECRUITER

3. **Sample Jobs**
   - Senior Full Stack Developer
   - Product Manager

4. **Sample Candidates**
   - John Doe
   - Sarah Smith

5. **Sample Applications**
   - Linking candidates to jobs with various statuses

Run seed:
```bash
npm run prisma:seed
```

