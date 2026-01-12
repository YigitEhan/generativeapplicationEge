# Quick Start Guide - Online Tests

## 🚀 Setup (One-Time)

### 1. Database Migration

```bash
cd backend

# Create .env file if not exists
cp .env.example .env

# Edit .env and set your DATABASE_URL
# Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/recruitment_db?schema=public"

# Run migration
npx prisma migrate dev --name add-test-types

# Generate Prisma client
npx prisma generate
```

### 2. Start Server

```bash
npm run dev
```

Server will start at http://localhost:3000

## 📝 Quick Examples

### Create External Link Test (HackerRank, Codility, etc.)

```bash
POST http://localhost:3000/api/vacancies/{vacancyId}/test
Authorization: Bearer {recruiterToken}
Content-Type: application/json

{
  "type": "EXTERNAL_LINK",
  "title": "HackerRank Coding Challenge",
  "description": "Complete the coding challenge on HackerRank",
  "instructions": "You have 2 hours to complete the challenge",
  "externalUrl": "https://www.hackerrank.com/test/abc123",
  "duration": 120,
  "passingScore": 70
}
```

### Create Internal Quiz

```bash
POST http://localhost:3000/api/vacancies/{vacancyId}/test
Authorization: Bearer {recruiterToken}
Content-Type: application/json

{
  "type": "INTERNAL_QUIZ",
  "title": "JavaScript Fundamentals Quiz",
  "description": "Test your knowledge of JavaScript",
  "instructions": "Answer all questions. You have 30 minutes.",
  "duration": 30,
  "passingScore": 70,
  "questions": [
    {
      "type": "MULTIPLE_CHOICE",
      "question": "What is the output of: typeof null?",
      "points": 10,
      "options": ["null", "undefined", "object", "number"],
      "correctAnswer": "object"
    },
    {
      "type": "TRUE_FALSE",
      "question": "JavaScript is a statically typed language.",
      "points": 5,
      "correctAnswer": false
    },
    {
      "type": "SHORT_ANSWER",
      "question": "What keyword is used to declare a block-scoped variable?",
      "points": 5,
      "correctAnswer": "let",
      "acceptableAnswers": ["let", "const"]
    }
  ]
}
```

### Invite Applicant to Test

```bash
POST http://localhost:3000/api/applications/{applicationId}/test-invite
Authorization: Bearer {recruiterToken}
Content-Type: application/json

{
  "testId": "{testId}",
  "message": "Please complete this test within 48 hours"
}
```

**Result:**
- ✅ Application status → `TEST_INVITED`
- ✅ TestAttempt created
- ✅ Applicant can now access the test

### Applicant Takes Quiz

**Step 1: Get Test (without answers)**
```bash
GET http://localhost:3000/api/applications/{applicationId}/test
Authorization: Bearer {applicantToken}
```

**Step 2: Submit Answers (Auto-Graded)**
```bash
POST http://localhost:3000/api/applications/{applicationId}/test/submit
Authorization: Bearer {applicantToken}
Content-Type: application/json

{
  "answers": [
    { "questionId": "{q1Id}", "answer": "object" },
    { "questionId": "{q2Id}", "answer": false },
    { "questionId": "{q3Id}", "answer": "let" }
  ]
}
```

**Response:**
```json
{
  "score": 20,
  "totalScore": 20,
  "percentage": 100,
  "isPassed": true,
  "completedAt": "2024-01-15T10:30:00Z"
}
```

**Result:**
- ✅ Application status → `TEST_COMPLETED`
- ✅ Score calculated automatically
- ✅ Pass/Fail determined

### Applicant Completes External Test

```bash
POST http://localhost:3000/api/applications/{applicationId}/test/mark-complete
Authorization: Bearer {applicantToken}
Content-Type: application/json

{
  "notes": "Completed HackerRank challenge. Score: 85/100"
}
```

**Result:**
- ✅ Application status → `TEST_COMPLETED`
- ✅ Notes saved for recruiter review

### Recruiter Reviews Results

```bash
GET http://localhost:3000/api/applications/{applicationId}/test-attempt
Authorization: Bearer {recruiterToken}
```

**Response (Internal Quiz):**
```json
{
  "score": 20,
  "totalScore": 20,
  "percentage": 100,
  "isPassed": true,
  "answers": [...],
  "test": {
    "questions": [...] // With correct answers
  }
}
```

**Response (External Link):**
```json
{
  "externalCompleted": true,
  "externalNotes": "Completed. Score: 85/100",
  "completedAt": "2024-01-15T11:00:00Z"
}
```

## 🧪 Testing

### Automated Tests
```bash
npm run test:tests
```

### Manual Tests
1. Open `backend/test-tests.http` in VS Code
2. Install REST Client extension
3. Click "Send Request" on each test

### Swagger UI
Navigate to http://localhost:3000/api-docs
- Find "Tests" section
- Try out endpoints interactively

## 📊 Application Status Flow

```
APPLIED → UNDER_REVIEW → SHORTLISTED → TEST_INVITED → TEST_COMPLETED → INTERVIEW_R1 → ...
```

## 🔐 Role-Based Access

| Action | Recruiter | Applicant |
|--------|-----------|-----------|
| Create test | ✅ | ❌ |
| Invite to test | ✅ | ❌ |
| View test (without answers) | ✅ | ✅ (own only) |
| Submit quiz | ❌ | ✅ (own only) |
| Mark external complete | ❌ | ✅ (own only) |
| View results | ✅ | ✅ (own only) |

## ⚠️ Important Notes

### Security
- ✅ Correct answers are **hidden** from applicants
- ✅ Applicants can only submit **once**
- ✅ Applicants can only access **their own** tests
- ✅ All actions are **audit logged**

### Validation
- ✅ Cannot invite to same test twice
- ✅ Cannot submit quiz twice
- ✅ Cannot mark external test twice
- ✅ Test must belong to vacancy

### Grading
- ✅ **Multiple Choice**: Case-insensitive exact match
- ✅ **True/False**: Boolean comparison
- ✅ **Short Answer**: Case-insensitive with acceptable answers
- ✅ **Score**: Sum of correct answer points
- ✅ **Pass/Fail**: percentage >= passingScore

## 📚 Documentation

- `TEST_IMPLEMENTATION.md` - Complete implementation guide
- `IMPLEMENTATION_SUMMARY.md` - Summary of changes
- `QUICK_START_TESTS.md` - This file
- Swagger UI - http://localhost:3000/api-docs

## 🎯 Common Use Cases

### Use Case 1: Technical Screening
1. Create internal quiz with coding questions
2. Invite all shortlisted applicants
3. Auto-grade submissions
4. Proceed with high scorers to interview

### Use Case 2: External Assessment
1. Create external link test (HackerRank)
2. Invite applicant
3. Applicant completes on external platform
4. Applicant marks as complete with notes
5. Recruiter reviews external results

### Use Case 3: Mixed Assessment
1. Create both internal quiz and external test
2. Invite to internal quiz first
3. If passed, invite to external test
4. Review both results before interview

## 🐛 Troubleshooting

### "Test not found"
- Verify test exists and is active
- Verify test belongs to the vacancy

### "Already invited"
- Each applicant can only be invited once per test
- Check existing test attempts

### "Already submitted"
- Quizzes can only be submitted once
- Check if test is already completed

### "Access denied"
- Applicants can only access their own tests
- Verify application ownership

## 🎉 You're Ready!

The online test system is fully functional and ready to use. Start by creating a test and inviting applicants!

For detailed API documentation, visit: http://localhost:3000/api-docs

