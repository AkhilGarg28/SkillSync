const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPosts,
  createPost,
  addComment,
  toggleLikePost,
  deletePost,
} = require('../controllers/forumController');

// Public route to view posts
router.get('/', getPosts);

// Protected routes
router.post('/', protect, createPost);
router.post('/:id/comments', protect, addComment);
router.post('/:id/comment', protect, addComment);
router.put('/:id/like', protect, toggleLikePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
