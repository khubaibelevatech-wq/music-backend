# Quick Setup Guide - Music Platform Backend

## Step-by-Step Setup

### 1️⃣ Install MySQL (if not installed)

**Windows:**
- Download from: https://dev.mysql.com/downloads/installer/
- Run installer and follow setup wizard
- Remember your root password!

**Check if MySQL is running:**
```bash
mysql --version
```

### 2️⃣ Create Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE music_platform_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or use command line:
```bash
mysql -u root -p -e "CREATE DATABASE music_platform_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3️⃣ Configure Environment

The `.env` file is already created. Edit it with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=music_platform_db
```

### 4️⃣ Install Dependencies (Already Done!)

```bash
npm install
```

✅ Already completed!

### 5️⃣ Start the Server

```bash
npm run dev
```

The server will:
- Connect to MySQL
- Auto-create all database tables
- Start on http://localhost:5000

### 6️⃣ Test the API

Open your browser and go to:

**Swagger Docs:** http://localhost:5000/api-docs

Or test with curl:
```bash
curl http://localhost:5000
```

You should see:
```json
{
  "message": "🎵 Welcome to Music Sharing Platform API",
  "version": "1.0.0",
  "documentation": "/api-docs"
}
```

## 🧪 Quick Test Flow

### 1. Register an Author

```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"john_artist\",\"email\":\"john@example.com\",\"password\":\"password123\",\"full_name\":\"John Artist\",\"user_type\":\"author\"}"
```

**Save the token from response!**

### 2. Upload Music

```bash
curl -X POST http://localhost:5000/api/music ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -F "title=My First Song" ^
  -F "genre=Pop" ^
  -F "audio=@C:\path\to\your\song.mp3"
```

### 3. Get All Music

```bash
curl http://localhost:5000/api/music
```

## 🔧 Troubleshooting

### ❌ "Access denied for user"
**Problem:** Wrong MySQL credentials

**Solution:** 
1. Check your MySQL password
2. Update `DB_PASSWORD` in `.env`
3. Test: `mysql -u root -p`

### ❌ "Unknown database 'music_platform_db'"
**Problem:** Database not created

**Solution:**
```sql
CREATE DATABASE music_platform_db;
```

### ❌ "Port 5000 is already in use"
**Problem:** Another app is using port 5000

**Solution:** Change in `.env`:
```env
PORT=5001
```

### ❌ "Cannot find module..."
**Problem:** Dependencies not installed

**Solution:**
```bash
npm install
```

## 📱 Using Swagger UI

1. Start server: `npm run dev`
2. Open: http://localhost:5000/api-docs
3. Click **Authorize** button
4. After login, paste token: `Bearer YOUR_TOKEN`
5. Now you can test all endpoints!

## 🎯 What's Next?

Once backend is running:

1. ✅ Test all endpoints in Swagger
2. ✅ Register some users (both regular & authors)
3. ✅ Upload music tracks
4. ✅ Test likes, comments, ratings
5. 🚀 Build the frontend!

## 📞 Need Help?

- Check `README.md` for full documentation
- Check `PROJECT_DOCUMENTATION.md` in root folder
- Review API endpoints in Swagger UI

---

**You're all set! 🎵 Happy coding!**
