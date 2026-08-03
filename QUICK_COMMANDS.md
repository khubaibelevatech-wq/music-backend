# Quick Command Reference

## 🚀 Server Commands

```bash
# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# Install dependencies (if needed)
npm install
```

## 🗄️ MySQL Commands

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE music_platform_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Show databases
SHOW DATABASES;

# Use database
USE music_platform_db;

# Show tables
SHOW TABLES;

# Drop database (⚠️ careful!)
DROP DATABASE music_platform_db;
```

## 🧪 Testing with cURL (Windows)

### Register Author
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"john_artist\",\"email\":\"john@example.com\",\"password\":\"password123\",\"full_name\":\"John Artist\",\"user_type\":\"author\"}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:5000/api/auth/profile ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Upload Music
```bash
curl -X POST http://localhost:5000/api/music ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -F "title=My Song" ^
  -F "genre=Pop" ^
  -F "audio=@C:\path\to\song.mp3"
```

### Get All Music
```bash
curl http://localhost:5000/api/music
```

### Like a Track
```bash
curl -X POST http://localhost:5000/api/interactions/like/1 ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Add Comment
```bash
curl -X POST http://localhost:5000/api/interactions/comment/1 ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"comment_text\":\"Amazing track!\"}"
```

### Rate Track
```bash
curl -X POST http://localhost:5000/api/interactions/rating/1 ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"rating\":5}"
```

### Search Music
```bash
curl "http://localhost:5000/api/search/music?q=pop"
```

## 🔍 Useful URLs

- **Server Root**: http://localhost:5000
- **Swagger Docs**: http://localhost:5000/api-docs
- **Test Auth**: http://localhost:5000/api/auth/profile (requires token)
- **Get Music**: http://localhost:5000/api/music
- **Search**: http://localhost:5000/api/search/music?q=test

## 📝 Environment Setup

```bash
# Edit .env file
notepad .env

# Required variables:
# DB_PASSWORD=your_mysql_password
# JWT_SECRET=your_secret_key
# PORT=5000
```

## 🔑 Token Management

1. **Get Token**: Login or Register → Copy `token` from response
2. **Use Token**: Add header: `Authorization: Bearer YOUR_TOKEN`
3. **In Swagger**: Click "Authorize" → Enter `Bearer YOUR_TOKEN`

## 🛠️ Troubleshooting Commands

```bash
# Check if Node.js is installed
node --version

# Check if MySQL is running
mysql --version

# Kill process on port 5000 (if needed)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# View server logs
npm run dev

# Check database connection
mysql -u root -p -e "SELECT 1"
```

## 📦 NPM Useful Commands

```bash
# Install specific package
npm install package-name

# Update all packages
npm update

# Check for outdated packages
npm outdated

# View installed packages
npm list --depth=0

# Clear cache
npm cache clean --force
```

## 🗂️ File Locations

```bash
# Uploaded files
backend/uploads/music/
backend/uploads/thumbnails/
backend/uploads/profiles/

# Logs (if using morgan in file mode)
backend/logs/

# Config
backend/.env
backend/config/

# Documentation
backend/README.md
backend/SETUP_GUIDE.md
```

## ⚡ Quick Test Flow

```bash
# 1. Start server
npm run dev

# 2. Register user (save token from response)
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"test\",\"email\":\"test@test.com\",\"password\":\"password123\",\"full_name\":\"Test User\",\"user_type\":\"author\"}"

# 3. Check if user can access protected route
curl http://localhost:5000/api/auth/profile -H "Authorization: Bearer TOKEN_HERE"

# 4. Browse API docs
start http://localhost:5000/api-docs
```

## 🎯 Production Checklist

- [ ] Update JWT_SECRET in .env
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Update CORS CLIENT_URL
- [ ] Set strong DB password
- [ ] Review rate limits
- [ ] Setup backup strategy
- [ ] Configure logging
- [ ] Setup monitoring
- [ ] SSL/HTTPS setup

## 💻 Development Tips

```bash
# Watch file changes
npm run dev

# Clear console (Windows)
cls

# View environment variables
echo %PORT%

# Run specific file
node backend/config/database.js
```

---

**Quick Access**: Open Swagger UI for interactive testing → http://localhost:5000/api-docs
