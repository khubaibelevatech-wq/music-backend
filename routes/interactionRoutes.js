const express = require('express');
const router = express.Router();
const {
  toggleLike,
  addComment,
  getComments,
  deleteComment,
  rateMusic,
  getRating,
  toggleFollow,
} = require('../controllers/interactionController');
const protect = require('../middleware/auth');
const { commentValidator, ratingValidator } = require('../middleware/validators/interactionValidator');

/**
 * @swagger
 * tags:
 *   name: Interactions
 *   description: Likes, comments, ratings, and follows
 */

/**
 * @swagger
 * /api/interactions/like/{musicId}:
 *   post:
 *     summary: Toggle like/unlike on a music track
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: musicId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201:
 *         description: Liked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked: { type: boolean }
 *                     likesCount: { type: integer }
 *       200:
 *         description: Unliked
 *       404:
 *         description: Track not found
 */
router.post('/like/:musicId', protect, toggleLike);

/**
 * @swagger
 * /api/interactions/comment/{musicId}:
 *   post:
 *     summary: Add a comment to a music track
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: musicId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comment_text]
 *             properties:
 *               comment_text:
 *                 type: string
 *                 example: This track is amazing!
 *     responses:
 *       201:
 *         description: Comment added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Empty comment
 *       404:
 *         description: Track not found
 */
router.post('/comment/:musicId', protect, commentValidator, addComment);

/**
 * @swagger
 * /api/interactions/comments/{musicId}:
 *   get:
 *     summary: Get all comments for a music track
 *     tags: [Interactions]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: musicId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Track not found
 */
router.get('/comments/:musicId', getComments);

/**
 * @swagger
 * /api/interactions/comment/{commentId}:
 *   delete:
 *     summary: Delete your own comment
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Comment deleted
 *       403:
 *         description: Not your comment
 *       404:
 *         description: Comment not found
 */
router.delete('/comment/:commentId', protect, deleteComment);

/**
 * @swagger
 * /api/interactions/rating/{musicId}:
 *   post:
 *     summary: Rate a music track (1–5). Updates if rated before.
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: musicId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *     responses:
 *       201:
 *         description: Rating created
 *       200:
 *         description: Rating updated
 *       400:
 *         description: Invalid rating value
 *       404:
 *         description: Track not found
 */
router.post('/rating/:musicId', protect, ratingValidator, rateMusic);

/**
 * @swagger
 * /api/interactions/rating/{musicId}:
 *   get:
 *     summary: Get average rating for a music track
 *     tags: [Interactions]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: musicId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Rating data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     averageRating: { type: number }
 *                     totalRatings: { type: integer }
 */
router.get('/rating/:musicId', getRating);

/**
 * @swagger
 * /api/interactions/follow/{authorId}:
 *   post:
 *     summary: Toggle follow/unfollow an author
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201:
 *         description: Now following
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     following: { type: boolean }
 *                     followersCount: { type: integer }
 *       200:
 *         description: Unfollowed
 *       400:
 *         description: Cannot follow yourself
 *       404:
 *         description: Author not found
 */
router.post('/follow/:authorId', protect, toggleFollow);

module.exports = router;
