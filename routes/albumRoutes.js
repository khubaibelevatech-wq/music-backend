const express = require('express');
const router = express.Router();
const {
  getAllAlbums,
  getAlbumById,
  getAlbumsByAuthor,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} = require('../controllers/albumController');
const protect = require('../middleware/auth');
const authorOnly = require('../middleware/authorOnly');
const { albumUploadFields, uploadThumbnail } = require('../config/multer');
const { albumCreateValidator } = require('../middleware/validators/musicValidator');

/**
 * @swagger
 * tags:
 *   name: Albums
 *   description: Album management
 */

/**
 * @swagger
 * /api/albums:
 *   get:
 *     summary: Get all albums
 *     tags: [Albums]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of albums
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Album'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 */
router.get('/', getAllAlbums);

/**
 * @swagger
 * /api/albums/{id}:
 *   get:
 *     summary: Get album by ID with all tracks
 *     tags: [Albums]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Album with tracks
 *       404:
 *         description: Album not found
 */
router.get('/:id', getAlbumById);

/**
 * @swagger
 * /api/albums/author/{authorId}:
 *   get:
 *     summary: Get all albums by a specific author
 *     tags: [Albums]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Author's albums
 */
router.get('/author/:authorId', getAlbumsByAuthor);

/**
 * @swagger
 * /api/albums:
 *   post:
 *     summary: Create a new album (Author only)
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               release_date: { type: string, format: date }
 *               track_ids:
 *                 type: array
 *                 maxItems: 5
 *                 items:
 *                   type: integer
 *                 description: Existing uploaded music track IDs to attach to this album. Maximum 5 tracks.
 *                 example: [1, 2, 3]
 *               audio_files:
 *                 type: array
 *                 maxItems: 5
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New audio files to upload directly into this album. MP3, WAV, or OGG. Existing track_ids + audio_files cannot exceed 5 total tracks.
 *               cover_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Album created with selected tracks attached
 *       400:
 *         description: Invalid track_ids or more than 5 tracks selected
 *       403:
 *         description: Authors only
 */
router.post(
  '/',
  protect,
  authorOnly,
  albumUploadFields.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'audio_files', maxCount: 5 },
  ]),
  albumCreateValidator,
  createAlbum
);

/**
 * @swagger
 * /api/albums/{id}:
 *   put:
 *     summary: Update an album (Author only, own album)
 *     tags: [Albums]
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
 *               release_date: { type: string, format: date }
 *               cover_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Album updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Album not found
 */
router.put(
  '/:id',
  protect,
  authorOnly,
  uploadThumbnail.single('cover_image'),
  updateAlbum
);

/**
 * @swagger
 * /api/albums/{id}:
 *   delete:
 *     summary: Delete an album (Author only, own album)
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Album deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Album not found
 */
router.delete('/:id', protect, authorOnly, deleteAlbum);

module.exports = router;
