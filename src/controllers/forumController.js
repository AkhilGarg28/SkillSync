const ForumPost = require('../models/ForumPost');

// @desc    Get all forum posts
// @route   GET /api/forum
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const posts = await ForumPost.find(filter)
      .populate('authorId', 'name profilePhoto isVerified')
      .populate('comments.authorId', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a forum post
// @route   POST /api/forum
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const authorId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required.' });
    }

    const post = new ForumPost({
      authorId,
      title,
      content,
      category: category || 'General',
    });

    const savedPost = await post.save();
    const populatedPost = await ForumPost.findById(savedPost._id).populate('authorId', 'name profilePhoto isVerified');

    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add comment to a post
// @route   POST /api/forum/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const authorId = req.user.id;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Comment text is required.' });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Forum post not found.' });
    }

    post.comments.push({ authorId, text });
    await post.save();

    const updatedPost = await ForumPost.findById(req.params.id)
      .populate('authorId', 'name profilePhoto isVerified')
      .populate('comments.authorId', 'name profilePhoto');

    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Like / Toggle Like on post
// @route   PUT /api/forum/:id/like
// @access  Private
exports.toggleLikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Forum post not found.' });
    }

    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.status(200).json({ success: true, likesCount: post.likes.length, isLiked: index === -1 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a forum post
// @route   DELETE /api/forum/:id
// @access  Private (Author or Admin)
exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Forum post not found.' });
    }

    if (post.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden: You cannot delete this post.' });
    }

    await ForumPost.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
