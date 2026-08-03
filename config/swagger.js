const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Soundwave Backend API',
      version: '1.0.0',
      description: [
        'REST API for the Soundwave music-sharing platform.',
        '',
        '**Specification:** [Download OpenAPI JSON](/openapi.json)',
        '',
        '### What this API provides',
        '- **Authentication** — register listeners or authors, login, and manage profiles.',
        '- **Music & albums** — discover public releases and let authors manage their own catalog.',
        '- **Community** — likes, comments, ratings, follows, and notifications.',
        '- **Search** — find tracks, artists, and albums with pagination.',
        '',
        '### Authentication',
        'Endpoints marked with a lock require a JWT. Click **Authorize** and paste the token returned by `POST /api/auth/login`.',
        'Public discovery endpoints can be tested without a token.',
        '',
        '> Upload endpoints use `multipart/form-data`. All other write endpoints use JSON unless noted.',
      ].join('\n'),
      contact: {
        name: 'Soundwave API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste the JWT access token returned by the login or register endpoint. Swagger adds the Bearer prefix automatically.',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Request completed successfully.' },
            data: { type: 'object', nullable: true },
          },
        },
        // ── User ──────────────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            full_name: { type: 'string', example: 'John Doe' },
            user_type: { type: 'string', enum: ['user', 'author'], example: 'author' },
            profile_picture: { type: 'string', nullable: true, example: 'uploads/profiles/avatar.jpg' },
            bio: { type: 'string', nullable: true, example: 'A passionate music creator' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Music ─────────────────────────────────────────────────────────
        Music: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            author_id: { type: 'integer', example: 2 },
            album_id: { type: 'integer', nullable: true, example: 1 },
            title: { type: 'string', example: 'My First Track' },
            description: { type: 'string', nullable: true },
            audio_file_url: { type: 'string', example: 'uploads/music/track.mp3' },
            thumbnail_url: { type: 'string', nullable: true },
            duration: { type: 'integer', nullable: true, example: 213 },
            genre: { type: 'string', nullable: true, example: 'Pop' },
            plays_count: { type: 'integer', example: 1024 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Album ─────────────────────────────────────────────────────────
        Album: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            author_id: { type: 'integer', example: 2 },
            title: { type: 'string', example: 'My First Album' },
            description: { type: 'string', nullable: true },
            cover_image: { type: 'string', nullable: true },
            release_date: { type: 'string', format: 'date', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Comment ───────────────────────────────────────────────────────
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 3 },
            music_id: { type: 'integer', example: 1 },
            comment_text: { type: 'string', example: 'Amazing track!' },
            createdAt: { type: 'string', format: 'date-time' },
            User: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                profile_picture: { type: 'string', nullable: true },
              },
            },
          },
        },
        // ── Notification ──────────────────────────────────────────────────
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer' },
            sender_id: { type: 'integer' },
            music_id: { type: 'integer', nullable: true },
            type: { type: 'string', enum: ['like', 'comment', 'rating', 'follow'] },
            message: { type: 'string', example: 'john_doe liked your track "My First Track"' },
            is_read: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Error ─────────────────────────────────────────────────────────
        Error: {
          type: 'object',
          required: ['error'],
          properties: {
            error: { type: 'string', example: 'Something went wrong' },
            field: { type: 'string', nullable: true, example: 'email' },
          },
        },
        // ── Pagination Meta ───────────────────────────────────────────────
        Meta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Authentication token is missing, expired, or invalid.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Not authorized. Please log in.', field: null },
            },
          },
        },
        Forbidden: {
          description: 'You are authenticated but do not have permission for this action.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Author access required.', field: null },
            },
          },
        },
        NotFound: {
          description: 'The requested resource does not exist.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Resource not found.', field: null },
            },
          },
        },
        ValidationError: {
          description: 'One or more request fields are invalid.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

swaggerSpec.tags = [
  {
    name: 'Auth',
    description: 'Account access and identity. Register, login, retrieve public author details, and manage the authenticated profile.',
  },
  {
    name: 'Music',
    description: 'Track discovery and author catalog management. Public reads do not require a token; uploads and changes require an author account.',
  },
  {
    name: 'Albums',
    description: 'Album discovery and publishing. Authors can create albums with existing tracks or upload up to five new audio files.',
  },
  {
    name: 'Interactions',
    description: 'Community actions for tracks and artists: likes, comments, 1–5 ratings, and follows.',
  },
  {
    name: 'Notifications',
    description: 'The authenticated user’s activity inbox. Read, mark as read, or remove notifications.',
  },
  {
    name: 'Search',
    description: 'Public paginated search across music tracks, author profiles, and albums.',
  },
];

const operationDetails = {
  'POST /api/auth/register': ['registerUser', 'Creates a listener or author account, hashes the password, and returns the new user with a JWT for immediate authentication.'],
  'POST /api/auth/login': ['loginUser', 'Checks the supplied email and password, then returns a JWT and the authenticated user profile.'],
  'POST /api/auth/logout': ['logoutUser', 'Confirms logout. JWTs are stateless, so the client must remove its stored token after this request.'],
  'GET /api/auth/profile': ['getMyProfile', 'Returns the complete profile of the user identified by the supplied JWT.'],
  'PUT /api/auth/profile': ['updateMyProfile', 'Updates the authenticated user’s name, email, bio, password, and optional profile image.'],
  'GET /api/auth/authors/{id}': ['getPublicAuthorProfile', 'Returns a public author profile together with catalog and follower information.'],

  'GET /api/music': ['listMusic', 'Returns a paginated music catalog. Filter by genre, author, or album and sort by newest, oldest, or play count.'],
  'GET /api/music/{id}': ['getMusicTrack', 'Returns one track with author and interaction details. A successful request also increments its play counter.'],
  'GET /api/music/author/{authorId}': ['listAuthorMusic', 'Returns the paginated public track catalog belonging to a specific author.'],
  'GET /api/music/author/{authorId}/analytics': ['getAuthorAnalytics', 'Returns private totals for tracks, plays, likes, comments, ratings, and followers. Authors can only view their own analytics.'],
  'POST /api/music': ['uploadMusic', 'Uploads one audio file and an optional thumbnail, then creates a new track owned by the authenticated author.'],
  'PUT /api/music/{id}': ['updateMusic', 'Changes metadata or thumbnail for a track owned by the authenticated author.'],
  'DELETE /api/music/{id}': ['deleteMusic', 'Permanently removes a track owned by the authenticated author and deletes its stored media files when applicable.'],

  'GET /api/albums': ['listAlbums', 'Returns all published albums with pagination, author information, and track counts.'],
  'GET /api/albums/{id}': ['getAlbum', 'Returns one album, its author, and the ordered tracks attached to it.'],
  'GET /api/albums/author/{authorId}': ['listAuthorAlbums', 'Returns all public albums published by a specific author.'],
  'POST /api/albums': ['createAlbum', 'Creates an album for the authenticated author. It can attach existing track IDs, upload new audio, and accept a cover image.'],
  'PUT /api/albums/{id}': ['updateAlbum', 'Updates album metadata and an optional cover image. Only the author who owns the album can change it.'],
  'DELETE /api/albums/{id}': ['deleteAlbum', 'Deletes an album owned by the authenticated author. Associated tracks are not presented as standalone deletion requests.'],

  'POST /api/interactions/like/{musicId}': ['toggleMusicLike', 'Toggles the authenticated user’s like on a track and returns the new like state and total count.'],
  'POST /api/interactions/comment/{musicId}': ['addMusicComment', 'Adds a non-empty comment from the authenticated user to the selected track.'],
  'GET /api/interactions/comments/{musicId}': ['listMusicComments', 'Returns all comments for a track with basic commenter profile information.'],
  'DELETE /api/interactions/comment/{commentId}': ['deleteMusicComment', 'Deletes a comment only when it belongs to the authenticated user.'],
  'POST /api/interactions/rating/{musicId}': ['rateMusic', 'Creates a 1–5 rating or replaces the authenticated user’s previous rating for the track.'],
  'GET /api/interactions/rating/{musicId}': ['getMusicRating', 'Returns the current average rating and total number of ratings for a track.'],
  'POST /api/interactions/follow/{authorId}': ['toggleAuthorFollow', 'Follows or unfollows an author and returns the new relationship state and follower count.'],

  'GET /api/notifications': ['listNotifications', 'Returns the authenticated user’s notifications with pagination and sender/track context.'],
  'PUT /api/notifications/{id}/read': ['markNotificationRead', 'Marks one notification as read when it belongs to the authenticated user.'],
  'PUT /api/notifications/read-all': ['markAllNotificationsRead', 'Marks every unread notification belonging to the authenticated user as read.'],
  'DELETE /api/notifications/{id}': ['deleteNotification', 'Deletes one notification from the authenticated user’s inbox.'],

  'GET /api/search/music': ['searchMusic', 'Searches track titles, genres, and author names. The query must contain at least two characters.'],
  'GET /api/search/authors': ['searchAuthors', 'Searches author usernames and full names, including track and follower counts in each result.'],
  'GET /api/search/albums': ['searchAlbums', 'Searches album titles and returns matching albums with their track counts.'],
};

Object.entries(swaggerSpec.paths || {}).forEach(([path, pathItem]) => {
  Object.entries(pathItem).forEach(([method, operation]) => {
    const detail = operationDetails[`${method.toUpperCase()} ${path}`];
    if (!detail || !operation || typeof operation !== 'object') return;

    operation.operationId = detail[0];
    operation.description = detail[1];

    const requiresAuth = Array.isArray(operation.security)
      && operation.security.some((entry) => entry.bearerAuth);

    if (requiresAuth) {
      operation.responses = {
        ...operation.responses,
        401: operation.responses?.[401] || { $ref: '#/components/responses/Unauthorized' },
      };
    }
  });
});

const swaggerUiOptions = {
  customSiteTitle: 'Soundwave Backend API',
  customCss: `
    html { box-sizing: border-box; background: #fff; }
    body { margin: 0; background: #fff; color: #27364b; }
    .swagger-ui { color: #27364b; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .swagger-ui .topbar { display: block; padding: 0 22px; background: #373737; border-bottom: 1px solid #202020; }
    .swagger-ui .topbar .wrapper { max-width: 1450px; }
    .swagger-ui .topbar-wrapper img { display: none; }
    .swagger-ui .topbar-wrapper .link::after { content: "♫  Soundwave API"; color: #fff; font-size: 14px; font-weight: 800; letter-spacing: .02em; }
    .swagger-ui .topbar-wrapper .link { min-width: 180px; }
    .swagger-ui .download-url-wrapper { display: none; }
    .swagger-ui .wrapper { max-width: 1450px; padding: 0 28px; }
    .swagger-ui .information-container { padding: 54px 0 42px; border-bottom: 1px solid #e8edf2; }
    .swagger-ui .info { margin: 0; }
    .swagger-ui .info .title { color: #2d3d55; font-size: 38px; letter-spacing: -.025em; }
    .swagger-ui .info .title small { top: -4px; border-radius: 7px; padding: 4px 8px; vertical-align: middle; }
    .swagger-ui .info a { color: #1769e0; }
    .swagger-ui .info .base-url { margin: 8px 0; }
    .swagger-ui .info .description { display: none; }
    .swagger-ui .info .description h3 { margin: 22px 0 6px; color: #2d3d55; font-size: 17px; }
    .swagger-ui .info .description li { margin: 3px 0; }
    .swagger-ui .info .description blockquote { margin: 18px 0 0; border-left: 3px solid #1769e0; background: #f4f8ff; padding: 10px 14px; color: #34445a; }
    .swagger-ui .scheme-container { margin: 0 0 28px; background: #fff; box-shadow: 0 1px 2px rgba(20,36,56,.12); padding: 32px 0; }
    .swagger-ui .scheme-container .schemes { align-items: center; }
    .swagger-ui .auth-wrapper .authorize { border-color: #23bd79; color: #16a76a; border-radius: 4px; }
    .swagger-ui .opblock-tag { margin: 0; border-bottom: 1px solid #d9e0e8; padding: 28px 10px 12px; color: #2d3d55; font-size: 24px; }
    .swagger-ui .opblock-tag small { color: #66758a; font-size: 13px; font-weight: 500; }
    .swagger-ui .operation-tag-content { padding-top: 4px; }
    .swagger-ui .opblock { margin: 10px 0; border-radius: 4px; box-shadow: none; }
    .swagger-ui .opblock .opblock-summary { min-height: 44px; padding: 5px; }
    .swagger-ui .opblock .opblock-summary-method { min-width: 82px; border-radius: 3px; text-shadow: none; font-size: 13px; }
    .swagger-ui .opblock .opblock-summary-path { color: #26364c; font-size: 15px; }
    .swagger-ui .opblock .opblock-summary-description { color: #3d4d62; font-size: 13px; }
    .swagger-ui .opblock.opblock-get { border-color: #4c9ef7; background: rgba(76,158,247,.09); }
    .swagger-ui .opblock.opblock-post { border-color: #36c987; background: rgba(54,201,135,.10); }
    .swagger-ui .opblock.opblock-put { border-color: #f0a33a; background: rgba(240,163,58,.10); }
    .swagger-ui .opblock.opblock-delete { border-color: #ef6262; background: rgba(239,98,98,.09); }
    .swagger-ui .opblock-body { background: rgba(255,255,255,.82); }
    .swagger-ui .btn { border-radius: 4px; box-shadow: none; }
    .swagger-ui .model-box { border-radius: 4px; background: #f7f9fc; }
    .swagger-ui section.models { display: none; }
    @media (max-width: 700px) {
      .swagger-ui .wrapper { padding: 0 12px; }
      .swagger-ui .information-container { padding-top: 34px; }
      .swagger-ui .info .title { font-size: 30px; }
      .swagger-ui .opblock .opblock-summary-description { display: none; }
      .swagger-ui .opblock .opblock-summary-method { min-width: 66px; }
    }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    defaultModelsExpandDepth: -1,
    defaultModelExpandDepth: 2,
    deepLinking: true,
    showExtensions: true,
  },
};

module.exports = { swaggerSpec, swaggerUiOptions };
