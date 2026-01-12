# Deployment Guide

## Prerequisites

- Node.js 18+ installed on server
- PostgreSQL database
- Domain name (optional)
- SSL certificate (recommended for production)

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Production settings
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT
JWT_SECRET=<generate-strong-secret-key>
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

**Important:** Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend Environment Variables

Create a `.env.production` file in the `frontend` directory:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

## Database Setup

1. Create production database:
```bash
psql -U postgres
CREATE DATABASE recruitment_db_prod;
\q
```

2. Run migrations:
```bash
cd backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

3. (Optional) Seed initial data:
```bash
npm run prisma:seed
```

## Building the Application

### Backend

```bash
cd backend
npm install --production=false
npm run build
```

This creates a `dist` folder with compiled JavaScript.

### Frontend

```bash
cd frontend
npm install
npm run build
```

This creates a `dist` folder with optimized static files.

## Deployment Options

### Option 1: Traditional Server (VPS)

#### Using PM2 (Recommended)

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start backend:
```bash
cd backend
pm2 start dist/index.js --name recruitment-api
```

3. Serve frontend with nginx:

Create `/etc/nginx/sites-available/recruitment`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads {
        proxy_pass http://localhost:3000;
    }
}
```

4. Enable site and restart nginx:
```bash
sudo ln -s /etc/nginx/sites-available/recruitment /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. Set up SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

6. Configure PM2 to start on boot:
```bash
pm2 startup
pm2 save
```

### Option 2: Docker

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: recruitment_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/recruitment_db
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    depends_on:
      - postgres
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
```

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Deploy:
```bash
docker-compose up -d
```

### Option 3: Cloud Platforms

#### Heroku

1. Backend:
```bash
cd backend
heroku create recruitment-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku run npm run prisma:migrate
```

2. Frontend (Vercel/Netlify):
- Connect GitHub repository
- Set build command: `npm run build`
- Set publish directory: `dist`
- Add environment variable: `VITE_API_URL`

#### AWS (EC2 + RDS)

1. Set up RDS PostgreSQL instance
2. Launch EC2 instance
3. Follow VPS deployment steps above
4. Configure security groups for ports 80, 443, 5432

#### DigitalOcean App Platform

1. Create new app from GitHub
2. Add backend service (Node.js)
3. Add frontend service (Static Site)
4. Add PostgreSQL database
5. Configure environment variables

## Post-Deployment

### Monitoring

1. Set up PM2 monitoring:
```bash
pm2 install pm2-logrotate
pm2 logs recruitment-api
```

2. Monitor database:
```bash
# Check connections
psql -U postgres -c "SELECT * FROM pg_stat_activity;"

# Check database size
psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('recruitment_db'));"
```

### Backups

1. Database backups:
```bash
# Create backup
pg_dump -U postgres recruitment_db > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U postgres recruitment_db < backup_20240101.sql
```

2. Automate with cron:
```bash
crontab -e
# Add: 0 2 * * * pg_dump -U postgres recruitment_db > /backups/backup_$(date +\%Y\%m\%d).sql
```

### Security Checklist

- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Set secure CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable database SSL connection
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerts
- [ ] Regular database backups

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Check logs: `pm2 logs recruitment-api`

### Database connection errors
- Verify PostgreSQL credentials
- Check network connectivity
- Ensure database exists

### Frontend can't connect to API
- Verify VITE_API_URL is correct
- Check CORS settings
- Verify API is running

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, AWS ALB)
- Run multiple backend instances
- Use Redis for session storage

### Database Scaling
- Enable connection pooling
- Set up read replicas
- Consider database caching (Redis)

### File Storage
- Move uploads to S3/Cloud Storage
- Use CDN for static assets

