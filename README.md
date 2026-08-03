# Music Sharing Platform - Backend API

A modern, full-featured RESTful API for a music-sharing platform built with Node.js, Express.js, MySQL, and Sequelize ORM.

## 🎵 Features

### User Management
- **Dual User Types**: Regular Users & Authors (Artists)
- JWT-based authentication
- Profile management with avatar uploads
- Secure password hashing with bcrypt

### Music & Album Management (Authors)
- Upload music tracks with thumbnails
- Create and organize albums
- Track metadata (title, genre, description, duration)
- Play count tracking
- Full CRUD operations

### Social Interactions
- **Like System**: Like/unlike tracks
- **Comments**: Comment on tracks with moderation
- **Ratings**: 1-5 star rating system
- **Follow System**: Follow your favorite authors

### Notifications
- Real-time notifications for likes, comments, ratings, and follows
- Mark as read/unread functionality
- Notification management

### Search & Discovery
- Search music by title, genre, or artist
- Search authors by username or name
- Search albums by title
- Advanced filtering and sorting

### Analytics (Authors)
- Total plays, likes, comments
- Average ratings across catalog
- Follower count
- Per-track metrics

## 🚀 Tech Stack

- **Runtime**: Node.js v22+
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Documentation**: Swagger (OpenAPI 3.0)
- **Security**: CORS, Rate Limiting, Input Sanitization

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** v18 or higher
- **MySQL** 8.0 or higher
- **npm** or **yarn**

## 🔧 Installation

### 1. Clone or Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file (or copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=music_platform_db
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# File Upload Limits
MAX_FILE_SIZE=10485760    # 10MB for audio
MAX_IMAGE_SIZE=5242880     # 5MB for images

# Frontend (for CORS)
CLIENT_URL=http://localhost:3000
```

### 4. Create MySQL Database

Log into MySQL and create the database:

```sql
CREATE DATABASE music_platform_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or use the command line:

```bash
mysql -u root -p -e "CREATE DATABASE music_platform_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 5. Start the Server

The server will automatically sync database tables on startup.

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:

```
✅ MySQL Database connected successfully.
✅ Database tables synced.

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎵  Music Sharing Platform API                              ║
║                                                               ║
║   Server:        http://localhost:5000                        ║
║   API Docs:      http://localhost:5000/api-docs               ║
║   Environment:   development                                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

## 📚 API Documentation

Once the server is running, access the **interactive Swagger documentation** at:

**http://localhost:5000/api-docs**

The Swagger UI provides:
- Complete API endpoint reference
- Request/response schemas
- Interactive testing with "Try it out" feature
- Authentication token management

## 🔑 Authentication

Most endpoints require authentication. After registering or logging in, you'll receive a JWT token.

### Using the Token

Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

In Swagger UI:
1. Click **Authorize** button (top right)
2. Enter: `Bearer <your_token>`
3. Click **Authorize**

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # Sequelize configuration
│   ├── multer.js            # File upload configuration
│   └── swagger.js           # Swagger/OpenAPI setup
├── controllers/
│   ├── authController.js
│   ├── musicController.js
│   ├── albumController.js
│   ├── interactionController.js
│   ├── notificationController.js
│   └── searchController.js
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── authorOnly.js        # Author role check
│   ├── errorHandler.js      # Global error handler
│   └── validators/          # Request validation
├── models/
│   ├── User.js
│   ├── Music.js
│   ├── Album.js
│   ├── Like.js
│   ├── Comment.js
│   ├── Rating.js
│   ├── Notification.js
│   ├── Follow.js
│   └── index.js             # Model associations
├── routes/
│   ├── authRoutes.js
│   ├── musicRoutes.js
│   ├── albumRoutes.js
│   ├── interactionRoutes.js
│   ├── notificationRoutes.js
│   └── searchRoutes.js
├── utils/
│   ├── generateToken.js
│   ├── sanitize.js
│   ├── pagination.js
│   ├── fileUtils.js
│   └── notificationHelper.js
├── uploads/                 # File storage
│   ├── music/
│   ├── thumbnails/
│   └── profiles/
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── README.md
└── server.js                # Entry point
```

## 🛣️ API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get current user profile
- `PUT /profile` - Update profile
- `GET /authors/:id` - Get author public profile

### Music (`/api/music`)
- `GET /` - Get all music (with filters)
- `GET /:id` - Get single track
- `GET /author/:authorId` - Get tracks by author
- `GET /author/:authorId/analytics` - Author analytics
- `POST /` - Upload music (Author only)
- `PUT /:id` - Update track (Author only)
- `DELETE /:id` - Delete track (Author only)

### Albums (`/api/albums`)
- `GET /` - Get all albums
- `GET /:id` - Get album with tracks
- `GET /author/:authorId` - Get albums by author
- `POST /` - Create album (Author only)
- `PUT /:id` - Update album (Author only)
- `DELETE /:id` - Delete album (Author only)

### Interactions (`/api/interactions`)
- `POST /like/:musicId` - Toggle like
- `POST /comment/:musicId` - Add comment
- `GET /comments/:musicId` - Get comments
- `DELETE /comment/:commentId` - Delete own comment
- `POST /rating/:musicId` - Rate track (1-5)
- `GET /rating/:musicId` - Get average rating
- `POST /follow/:authorId` - Toggle follow

### Notifications (`/api/notifications`)
- `GET /` - Get all notifications
- `PUT /:id/read` - Mark as read
- `PUT /read-all` - Mark all as read
- `DELETE /:id` - Delete notification

### Search (`/api/search`)
- `GET /music?q=query` - Search music
- `GET /authors?q=query` - Search authors
- `GET /albums?q=query` - Search albums

## 🧪 Testing the API

### Using cURL

**Register a new author:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_musician",
    "email": "john@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "user_type": "author"
  }'
```

**Upload music (requires token):**
```bash
curl -X POST http://localhost:5000/api/music \
  -H "Authorization: Bearer <your_token>" \
  -F "title=My First Song" \
  -F "genre=Pop" \
  -F "audio=@/path/to/song.mp3" \
  -F "thumbnail=@/path/to/cover.jpg"
```

### Using Postman

1. Import the OpenAPI spec from `http://localhost:5000/api-docs`
2. Create an environment variable for `token`
3. Use `{{token}}` in Authorization headers

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: 10 requests/15 minutes on auth endpoints
- **Input Validation**: express-validator on all user inputs
- **SQL Injection Protection**: Sequelize parameterized queries
- **XSS Protection**: HTML sanitization on text fields
- **CORS Configuration**: Restricted to configured origins
- **File Upload Validation**: MIME type and size checks

## 🐛 Troubleshooting

### Database Connection Errors

**Error: Access denied for user**
- Check `DB_USER` and `DB_PASSWORD` in `.env`
- Ensure MySQL user has proper permissions

**Error: Unknown database**
- Create the database: `CREATE DATABASE music_platform_db;`

### Port Already in Use

Change the `PORT` in `.env` or kill the process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### JWT Token Errors

**"Invalid or expired token"**
- Token may have expired (default: 7 days)
- Log in again to get a new token

### File Upload Errors

**"File size exceeds limit"**
- Audio: max 10 MB
- Images: max 5 MB
- Compress files before uploading

## 📦 Database Schema

The database will be automatically created with these tables:

- **users** - User accounts (both regular and authors)
- **albums** - Album collections
- **music** - Music tracks
- **likes** - Track likes
- **comments** - Track comments
- **ratings** - Track ratings (1-5 stars)
- **notifications** - User notifications
- **follows** - Author follow relationships

All tables include automatic timestamps (`createdAt`, `updatedAt`).

## 🚀 Deployment

### Environment Variables

Update `.env` for production:
```env
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>
DB_HOST=<production-db-host>
CLIENT_URL=https://yourdomain.com
```

### Recommended Hosting

- **API**: Heroku, Railway, DigitalOcean, AWS EC2
- **Database**: AWS RDS, DigitalOcean MySQL, PlanetScale
- **File Storage**: Consider AWS S3 or Cloudinary for production

## 📝 License

ISC

## 👨‍💻 Developer Notes

- All responses follow consistent format: `{ data: ..., meta: ... }`
- All errors follow format: `{ error: "message", field: "fieldName" }`
- Pagination defaults: page=1, limit=20, max=100
- All date/times in ISO 8601 format
- File paths use forward slashes for consistency

## 📞 Support

For issues or questions, refer to the PROJECT_DOCUMENTATION.md file in the root directory.

---

**Happy Coding! 🎵**
