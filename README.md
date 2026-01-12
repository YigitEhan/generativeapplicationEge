# Recruitment Management System

A full-stack monorepo recruitment management system built with modern technologies.

## 🚀 Tech Stack

### Frontend
- **React** with **Vite** and **TypeScript**
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API calls
- **React Hook Form** with **Zod** validation

### Backend
- **Node.js** with **Express** and **TypeScript**
- **PostgreSQL** database with **Prisma** ORM
- **JWT** authentication
- **Multer** for file uploads (stored locally in `/uploads`)
- **Zod** for validation
- **Swagger/OpenAPI** for API documentation
- **Jest** for unit testing

## 📁 Project Structure

```
/
├── backend/          # Backend API server
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── validators/   # Zod schemas
│   ├── prisma/       # Database schema and migrations
│   └── uploads/      # Uploaded files storage
├── frontend/         # React frontend application
│   └── src/
│       ├── components/   # React components
│       ├── pages/        # Page components
│       ├── lib/          # Utilities
│       ├── store/        # State management
│       └── types/        # TypeScript types
└── docs/             # Documentation
```

## 🛠️ Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14

## 📦 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd generativeapplicationEge
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Set up environment variables

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/recruitment_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

#### Frontend (.env)
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

## 🗄️ Database Setup

### 1. Create PostgreSQL database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE recruitment_db;

# Exit psql
\q
```

### 2. Run Prisma migrations

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database (optional)
npm run prisma:seed
```

The seed script creates:
- Admin user: `admin@recruitment.com` / `admin123`
- Recruiter user: `recruiter@recruitment.com` / `recruiter123`
- Sample jobs, candidates, and applications

## 🚀 Running the Application

### Option 1: Run everything together (from root)

```bash
npm run dev
```

This will start both frontend and backend concurrently.

### Option 2: Run separately

#### Backend
```bash
cd backend
npm run dev
```
Server runs on: http://localhost:3000
API Documentation: http://localhost:3000/api-docs

#### Frontend
```bash
cd frontend
npm run dev
```
Application runs on: http://localhost:5173

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job (Auth required)
- `PUT /api/jobs/:id` - Update job (Auth required)
- `DELETE /api/jobs/:id` - Delete job (Auth required)

#### Candidates
- `GET /api/candidates` - Get all candidates
- `GET /api/candidates/:id` - Get candidate by ID
- `POST /api/candidates` - Create candidate (Auth required, supports file upload)
- `PUT /api/candidates/:id` - Update candidate (Auth required)
- `DELETE /api/candidates/:id` - Delete candidate (Auth required)

#### Applications
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications` - Create application (Auth required)
- `PUT /api/applications/:id` - Update application (Auth required)
- `DELETE /api/applications/:id` - Delete application (Auth required)

#### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Auth required)
- `DELETE /api/users/:id` - Delete user (Admin only)

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🔑 Default Users (After Seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@recruitment.com | admin123 | ADMIN |
| recruiter@recruitment.com | recruiter123 | RECRUITER |

## 📝 Features

- ✅ User authentication with JWT
- ✅ Role-based access control (Admin, Recruiter, Hiring Manager)
- ✅ Job posting management
- ✅ Candidate management with resume upload
- ✅ Application tracking with status updates
- ✅ Dashboard with statistics
- ✅ RESTful API with Swagger documentation
- ✅ Input validation with Zod
- ✅ Unit tests for services
- ✅ TypeScript throughout

## 🛡️ Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Protected routes with middleware
- Input validation on both frontend and backend
- CORS configuration
- File upload restrictions

## 📄 License

MIT

## 👥 Support

For issues and questions, please open an issue in the repository.

