const express = require('express');
const {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  toggleUpvote,
  changeStatus,
  getAnalytics,
} = require('../controllers/issueController');

// We also need comments route to re-route into comment router
const commentRouter = require('./comments');

const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Re-route into other resource routers
router.use('/:id/comments', commentRouter);

router
  .route('/')
  .get(getIssues)
  .post(protect, upload.array('images', 3), createIssue);

router.route('/analytics').get(getAnalytics);

router
  .route('/:id')
  .get(getIssue)
  .put(protect, updateIssue)
  .delete(protect, deleteIssue);

router.route('/:id/upvote').patch(protect, toggleUpvote);
router.route('/:id/status').patch(protect, adminOnly, changeStatus);

module.exports = router;
