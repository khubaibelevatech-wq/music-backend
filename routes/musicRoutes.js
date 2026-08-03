const express = require('express');
const router = express.Router();
const {
  getAllMusic,
  getMusicById,
  getMusicByAuthor,
  uploadMusic,
  updateMusic,
  deleteMusic,
  getAuthorAnalytics,
} = require('../controllers/musicController');
const protect = require('../middleware/auth');
const authorOnly = require('../middleware/authorOnly');
const { musicUploadFields, uploadThumbnail } = require('../config/multer');
const { musicUploadValidator } = require('../middleware/validators/musicValidator');

/**
 * @swagger
 * tags:
 *   name: Music
 *   description: Music track management and discovery
 */

/**
 * @swagger
 * /api/music:
 *   get:
 *     summary: Get all music tracks (with optional filters)
 *     tags: [Music]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *       - in: query
 *         name: author_id
 *         schema: { type: integer }
 *       - in: query
 *         name: album_id
 *         schema: { type: integer }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, oldest, plays] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of music tracks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Music'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 */
router.get('/', getAllMusic);

/**
 * @swagger
 * /api/music/{id}:
 *   get:
 *     summary: Get a single music track by ID (increments play count)
 *     tags: [Music]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Music track details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Music'
 *       404:
 *         description: Track not found
 */
router.get('/:id', getMusicById);

/**
 * @swagger
 * /api/music/author/{authorId}:
 *   get:
 *     summary: Get all music tracks by a specific author
 *     tags: [Music]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Author's tracks
 *       404:
 *         description: Author not found
 */
router.get('/author/:authorId', getMusicByAuthor);

/**
 * @swagger
 * /api/music/author/{authorId}/analytics:
 *   get:
 *     summary: Get analytics for an author's music catalog (Author only, own data)
 *     tags: [Music]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Analytics summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTracks: { type: integer }
 *                     totalPlays: { type: integer }
 *                     totalLikes: { type: integer }
 *                     totalComments: { type: integer }
 *                     averageRating: { type: number }
 *                     followersCount: { type: integer }
 *       403:
 *         description: Forbidden
 */
router.get('/author/:authorId/analytics', protect, authorOnly, getAuthorAnalytics);

/**
 * @swagger
 * /api/music:
 *   post:
 *     summary: Upload a new music track (Author only)
 *     tags: [Music]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, audio]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               genre:
 *                 type: string
 *               duration:
 *                 type: integer
 *                 description: Duration in seconds
 *               album_id:
 *                 type: integer
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: MP3, WAV, or OGG (max 10MB)
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: JPEG, PNG, GIF (max 5MB)
 *     responses:
 *       201:
 *         description: Track uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Music'
 *       400:
 *         description: Missing audio file or invalid data
 *       403:
 *         description: Authors only
 */
router.post(
  '/',
  protect,
  authorOnly,
  musicUploadFields.fields([{ name: 'audio', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  musicUploadValidator,
  uploadMusic
);

/**
 * @swagger
 * /api/music/{id}:
 *   put:
 *     summary: Update a music track (Author only, own track)
 *     tags: [Music]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               genre: { type: string }
 *               duration: { type: integer }
 *               album_id: { type: integer }
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Track updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  protect,
  authorOnly,
  uploadThumbnail.single('thumbnail'),
  updateMusic
);

/**
 * @swagger
 * /api/music/{id}:
 *   delete:
 *     summary: Delete a music track (Author only, own track)
 *     tags: [Music]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Track deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete('/:id', protect, authorOnly, deleteMusic);

module.exports = router;
