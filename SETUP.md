# Quick Setup Guide

## ✅ Prisma Schema Created

The comprehensive Prisma schema has been created with all required entities:

### Entities:
- ✅ User (with Role enum: APPLICANT, RECRUITER, INTERVIEWER, MANAGER, ADMIN)
- ✅ Department
- ✅ VacancyRequest (with VacancyRequestStatus enum)
- ✅ Vacancy (with VacancyStatus enum)
- ✅ Application (with ApplicationStatus enum)
- ✅ CV
- ✅ MotivationLetter
- ✅ Evaluation
- ✅ Test
- ✅ TestAttempt
- ✅ Interview (with InterviewStatus enum)
- ✅ InterviewAssignment
- ✅ AuditLog
- ✅ Notification

### Seed Data Prepared:
- ✅ 3 Departments: Business, IT, HR
- ✅ 5 Users with different roles:
  - admin@recruitment.com / admin123 (ADMIN)
  - manager@recruitment.com / manager123 (MANAGER)
  - recruiter@recruitment.com / recruiter123 (RECRUITER)
  - interviewer@recruitment.com / interviewer123 (INTERVIEWER)
  - applicant@recruitment.com / applicant123 (APPLICANT)

## 🚀 Next Steps to Complete Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Make sure you have a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and update the DATABASE_URL:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/recruitment_db?schema=public"
```

### 3. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE recruitment_db;

# Exit
\q
```

### 4. Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

### 5. Run Migrations

```bash
cd backend
npm run prisma:migrate
```

When prompted for migration name, enter: `init_recruitment_system`

### 6. Seed the Database

```bash
cd backend
npm run prisma:seed
```

This will create:
- 3 departments (Business, IT, HR)
- 5 users with different roles
- 2 vacancy requests
- 2 vacancies
- 1 application with CV and motivation letter
- 1 evaluation
- 1 test with test attempt
- 1 interview with assignment
- Audit logs and notifications

### 7. Verify Database

```bash
cd backend
npm run prisma:studio
```

This opens Prisma Studio at http://localhost:5555 where you can view all the seeded data.

## 📊 Database Schema Overview

### Core Workflow:
1. **Manager** creates **VacancyRequest** for a **Department**
2. **Admin/Recruiter** approves request and creates **Vacancy**
3. **Applicant** submits **Application** with **CV** and **MotivationLetter**
4. **Recruiter** creates **Evaluation** for the application
5. **Recruiter** assigns **Test** to applicant
6. **Applicant** completes **TestAttempt**
7. **Recruiter** schedules **Interview** with **Interviewer**
8. **InterviewAssignment** links interview to application
9. All actions logged in **AuditLog**
10. **Notifications** sent to relevant users

### Key Relationships:
- User → Multiple roles in the system
- Department → VacancyRequests → Vacancies
- Vacancy → Applications → Evaluations, Tests, Interviews
- Application → CV, MotivationLetter, TestAttempts, InterviewAssignments
- All entities tracked via AuditLog and Notifications

## 🔍 Viewing the Schema

The complete schema is in: `backend/prisma/schema.prisma`

Key features:
- ✅ All required enums defined
- ✅ Proper foreign key relationships
- ✅ Cascade deletes where appropriate
- ✅ Indexes for performance
- ✅ Unique constraints
- ✅ Default values
- ✅ Timestamps (createdAt, updatedAt)

## 🧪 Testing the Setup

After seeding, you can test by:

1. **View all users:**
```sql
SELECT email, role FROM "User";
```

2. **View all vacancies:**
```sql
SELECT title, status FROM "Vacancy";
```

3. **View applications with status:**
```sql
SELECT v.title, u.email, a.status 
FROM "Application" a
JOIN "Vacancy" v ON a."vacancyId" = v.id
JOIN "User" u ON a."applicantId" = u.id;
```

## 📝 Notes

- All passwords are hashed with bcrypt
- Default user credentials are for development only
- Change passwords in production
- The schema supports the complete recruitment workflow
- Audit logs track all important actions
- Notifications keep users informed

## 🆘 Troubleshooting

### If migration fails:
```bash
cd backend
npx prisma migrate reset
npm run prisma:migrate
npm run prisma:seed
```

### If Prisma Client is not generated:
```bash
cd backend
npx prisma generate
```

### If database connection fails:
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

## ✅ Verification Checklist

- [ ] PostgreSQL database created
- [ ] Backend dependencies installed
- [ ] .env file configured
- [ ] Prisma Client generated
- [ ] Migrations run successfully
- [ ] Database seeded
- [ ] Can view data in Prisma Studio
- [ ] All 5 users created with correct roles
- [ ] All 3 departments created
- [ ] Sample vacancies and applications exist

