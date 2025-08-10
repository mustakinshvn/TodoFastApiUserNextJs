# Deployment Guide

## 🚀 Deploy to Railway (Recommended)

### Prerequisites
1. Create a GitHub repository
2. Sign up for Railway account

### Steps:

#### 1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

#### 2. **Deploy Backend to Railway**
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect and deploy both services

#### 3. **Add Database**
1. In Railway dashboard, click "New Service" → "Database" → "PostgreSQL"
2. Copy the `DATABASE_URL` from the database service

#### 4. **Set Environment Variables**
In Railway dashboard for your backend service:
- `DATABASE_URL`: (from step 3)
- `SECRET_KEY`: `your-secret-jwt-key-here`
- `PYTHONPATH`: `/app/Backend/todo/src`

For frontend service:
- `NEXT_PUBLIC_API_URL`: `https://your-backend-service.railway.app`

#### 5. **Update Backend for Production Database**
The backend is currently using SQLite. Update `main.py`:
```python
import os
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo.db")
engine = create_engine(DATABASE_URL)
```

## 🔗 Other Deployment Options

### **Render**
1. Connect GitHub repo
2. Create Web Service for backend
3. Create Static Site for frontend
4. Add PostgreSQL database

### **Vercel + Railway**
1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Connect them via environment variables

### **DigitalOcean App Platform**
1. Create new app from GitHub
2. Configure both frontend and backend components
3. Add managed database

## 📝 Production Checklist

- [ ] Environment variables configured
- [ ] Database connected
- [ ] CORS settings updated for production domain
- [ ] JWT secret key set
- [ ] Build processes working
- [ ] API URLs pointing to production

## 🔧 Local Development Setup
```bash
# Backend
cd Backend/todo
poetry install
poetry run uvicorn src.todo.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## 📱 Access Your App
After deployment:
- Frontend: `https://your-frontend-url.railway.app`
- Backend API: `https://your-backend-url.railway.app/docs`
