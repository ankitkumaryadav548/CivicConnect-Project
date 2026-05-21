const Comment = require('../models/Comment');
const Issue = require('../models/Issue');

// @desc    Get comments for an issue
// @route   GET /api/issues/:id/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ issueId: req.params.id })
      .populate('userId', 'name')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Add comment to an issue
// @route   POST /api/issues/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    req.body.issueId = req.params.id;
    req.body.userId = req.user.id;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    let comment = await Comment.create(req.body);
    
    // populate user info so frontend can display immediately by querying freshly
    comment = await Comment.findById(comment._id).populate('userId', 'name');

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    // Make sure user is comment owner or admin
    if (!comment.userId || (comment.userId.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
