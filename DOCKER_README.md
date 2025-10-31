# Expense Tracker - Docker Deployment Guide

## 🐳 Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## 🚀 Quick Start with Docker

### 1. Clone and Navigate
```bash
cd expense_tracker
```

### 2. Create Environment File
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
# At minimum, set a secure SECRET_KEY
```

### 3. Build and Run
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:8000/admin

### 5. Create Superuser (First Time)
```bash
docker-compose exec backend python manage.py createsuperuser
```

## 📋 Docker Commands

### Start Services
```bash
docker-compose up        # Start and show logs
docker-compose up -d     # Start in background
```

### Stop Services
```bash
docker-compose down      # Stop all services
docker-compose down -v   # Stop and remove volumes (data)
```

### View Logs
```bash
docker-compose logs              # All logs
docker-compose logs backend      # Backend only
docker-compose logs frontend     # Frontend only
docker-compose logs -f           # Follow logs (real-time)
```

### Rebuild After Changes
```bash
docker-compose up --build        # Rebuild and start
docker-compose build             # Build only
```

### Run Django Commands
```bash
# Make migrations
docker-compose exec backend python manage.py makemigrations

# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### Access Container Shell
```bash
# Backend container
docker-compose exec backend sh

# Frontend container
docker-compose exec frontend sh
```

## 🔧 Configuration

### Environment Variables

Edit `.env` file:

```env
# Django
SECRET_KEY=your-very-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# CORS
CORS_ALLOWED_ORIGINS=http://localhost,http://your-domain.com

# React
REACT_APP_API_URL=http://localhost:8000/api
```

### Production Deployment

For production, update:
1. Set `DEBUG=False` in `.env`
2. Generate secure `SECRET_KEY`
3. Update `ALLOWED_HOSTS` with your domain
4. Update `CORS_ALLOWED_ORIGINS`
5. Consider using PostgreSQL instead of SQLite

## 🗄️ Database

### SQLite (Default)
Data is stored in `db.sqlite3` which is mounted as a volume.

### Switch to PostgreSQL (Production)

1. Add PostgreSQL service to `docker-compose.yml`:
```yaml
db:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: expense_tracker
    POSTGRES_USER: your_user
    POSTGRES_PASSWORD: your_password
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

2. Update Django settings for PostgreSQL
3. Install `psycopg2-binary` in requirements.txt

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yml
ports:
  - "8080:8000"  # Backend on 8080
  - "3000:80"    # Frontend on 3000
```

### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Clean Start
```bash
# Remove everything and start fresh
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### View Container Status
```bash
docker-compose ps
docker ps
```

## 📦 What Gets Dockerized

### Backend (Django)
- Python 3.11
- All Python dependencies
- SQLite database (persistent volume)
- Static files
- Runs on port 8000

### Frontend (React)
- Node.js build process
- Nginx web server
- Production-optimized build
- Runs on port 80

## 🔐 Security Notes

- Always use a strong `SECRET_KEY` in production
- Set `DEBUG=False` in production
- Keep `.env` file secret (already in .gitignore)
- Use HTTPS in production
- Regularly update dependencies

## 📝 Next Steps

1. ✅ Docker setup complete
2. Configure environment variables
3. Run `docker-compose up --build`
4. Create superuser
5. Test the application
6. Deploy to cloud (AWS, Azure, DigitalOcean, etc.)

## 🌐 Cloud Deployment Options

- **AWS:** ECS, EC2, Elastic Beanstalk
- **Azure:** Container Instances, App Service
- **Google Cloud:** Cloud Run, GKE
- **DigitalOcean:** App Platform, Droplets
- **Heroku:** Container Registry
- **Railway:** Direct Docker support
