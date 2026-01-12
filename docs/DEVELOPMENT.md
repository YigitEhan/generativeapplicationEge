# Development Guide

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Git

### Initial Setup

1. Clone and install:
```bash
git clone <repository-url>
cd generativeapplicationEge
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. Set up environment files (see README.md)

3. Start PostgreSQL and create database

4. Run migrations and seed:
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Development Workflow

### Running in Development Mode

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Or from root:
```bash
npm run dev
```

### Code Structure

#### Backend Structure
```
backend/src/
├── config/          # Configuration (database, swagger)
├── controllers/     # Request handlers
├── middleware/      # Express middleware (auth, upload, errors)
├── routes/          # Route definitions
├── services/        # Business logic
└── validators/      # Zod validation schemas
```

#### Frontend Structure
```
frontend/src/
├── components/      # Reusable React components
├── pages/          # Page components
├── lib/            # Utilities (API client)
├── store/          # Zustand state management
└── types/          # TypeScript type definitions
```

## Coding Standards

### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Avoid `any` type
- Use proper type annotations

### Backend
- Follow RESTful conventions
- Use async/await for asynchronous code
- Validate all inputs with Zod
- Handle errors properly
- Write unit tests for services

### Frontend
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Handle loading and error states
- Use semantic HTML

## Database Development

### Creating Migrations

1. Modify `backend/prisma/schema.prisma`

2. Create migration:
```bash
cd backend
npx prisma migrate dev --name description_of_change
```

3. The migration is automatically applied

### Viewing Data

```bash
cd backend
npm run prisma:studio
```

Opens GUI at http://localhost:5555

### Resetting Database

```bash
cd backend
npx prisma migrate reset
```

This will:
- Drop the database
- Create a new database
- Apply all migrations
- Run seed script

## Testing

### Backend Unit Tests

Run tests:
```bash
cd backend
npm test
```

Watch mode:
```bash
npm run test:watch
```

Coverage:
```bash
npm run test:coverage
```

### Writing Tests

Example service test:
```typescript
import { JobService } from '../job.service';
import prisma from '../../config/database';

jest.mock('../../config/database');

describe('JobService', () => {
  let jobService: JobService;

  beforeEach(() => {
    jobService = new JobService();
    jest.clearAllMocks();
  });

  it('should create a job', async () => {
    const mockJob = { id: '1', title: 'Test Job' };
    (prisma.job.create as jest.Mock).mockResolvedValue(mockJob);

    const result = await jobService.createJob(data, userId);
    
    expect(result).toEqual(mockJob);
    expect(prisma.job.create).toHaveBeenCalled();
  });
});
```

## API Development

### Adding a New Endpoint

1. **Define Validator** (`backend/src/validators/`)
```typescript
import { z } from 'zod';

export const createSchema = z.object({
  field: z.string().min(1),
});

export type CreateInput = z.infer<typeof createSchema>;
```

2. **Create Service** (`backend/src/services/`)
```typescript
import prisma from '../config/database';
import { CreateInput } from '../validators/schema.validator';

export class MyService {
  async create(data: CreateInput) {
    return await prisma.model.create({ data });
  }
}
```

3. **Create Controller** (`backend/src/controllers/`)
```typescript
import { Response } from 'express';
import { MyService } from '../services/my.service';
import { createSchema } from '../validators/schema.validator';
import { AuthRequest } from '../middleware/auth';

const service = new MyService();

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const result = await service.create(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
```

4. **Add Route** (`backend/src/routes/`)
```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { create } from '../controllers/my.controller';

const router = Router();
router.post('/', authenticate, create);

export default router;
```

5. **Register Route** (`backend/src/index.ts`)
```typescript
import myRoutes from './routes/my.routes';
app.use('/api/my', myRoutes);
```

## Frontend Development

### Adding a New Page

1. **Create Page Component** (`frontend/src/pages/MyPage.tsx`)
```typescript
import { useEffect, useState } from 'react';
import api from '../lib/api';

function MyPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/my-endpoint');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>My Page</h1>
      {/* Content */}
    </div>
  );
}

export default MyPage;
```

2. **Add Route** (`frontend/src/App.tsx`)
```typescript
import MyPage from './pages/MyPage';

// In Routes:
<Route path="/my-page" element={<MyPage />} />
```

3. **Add Navigation** (`frontend/src/components/Layout.tsx`)
```typescript
<Link to="/my-page" className="nav-link">My Page</Link>
```

## Debugging

### Backend Debugging

Add to `backend/.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal"
    }
  ]
}
```

### Frontend Debugging

Use React DevTools browser extension

Console logging:
```typescript
console.log('Debug:', data);
```

## Common Issues

### Port Already in Use
```bash
# Find process
lsof -i :3000  # or :5173

# Kill process
kill -9 <PID>
```

### Database Connection Failed
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check database exists

### Prisma Client Not Generated
```bash
cd backend
npm run prisma:generate
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Git Workflow

1. Create feature branch:
```bash
git checkout -b feature/my-feature
```

2. Make changes and commit:
```bash
git add .
git commit -m "feat: add my feature"
```

3. Push and create PR:
```bash
git push origin feature/my-feature
```

## Commit Message Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/config changes

