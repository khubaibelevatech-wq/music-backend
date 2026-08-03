const express = require('express');
const router = express.Router();
const { searchMusic, searchAuthors, searchAlbums } = require('../controllers/searchController');

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Search across music, authors, and albums
 */

/**
 * @swagger
 * /api/search/music:
 *   get:
 *     summary: Search for music tracks by title, genre, or author
 *     tags: [Search]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (min 2 characters)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Search results
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
 *       400:
 *         description: Invalid or empty query
 */
router.get('/music', searchMusic);

/**
 * @swagger
 * /api/search/authors:
 *   get:
 *     summary: Search for authors by username or full name
 *     tags: [Search]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (min 2 characters)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Search results with track and follower counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/User'
 *                       - type: object
 *                         properties:
 *                           trackCount: { type: integer }
 *                           followersCount: { type: integer }
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       400:
 *         description: Invalid or empty query
 */
router.get('/authors', searchAuthors);

/**
 * @swagger
 * /api/search/albums:
 *   get:
 *     summary: Search for albums by title
 *     tags: [Search]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (min 2 characters)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Search results with track counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Album'
 *                       - type: object
 *                         properties:
 *                           trackCount: { type: integer }
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       400:
 *         description: Invalid or empty query
 */
router.get('/albums', searchAlbums);

module.exports = router;
