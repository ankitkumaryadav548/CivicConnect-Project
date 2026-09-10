const express = require('express');
const {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  toggleUpvote,
  changeStatus,
  citizenVerifyIssue,
  getAnalytics,
} = require('../controllers/issueController');

// We also need comments route to re-route into comment router
const commentRouter = require('./comments');

const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Re-route into other resource routers
router.use('/:id/comments', commentRouter);

router
  .route('/')
  .get(optionalAuth, getIssues)
  .post(protect, upload.array('images', 3), createIssue);

router.route('/analytics').get(getAnalytics);

router
  .route('/:id')
  .get(optionalAuth, getIssue)
  .put(protect, updateIssue)
  .delete(protect, deleteIssue);

router.route('/:id/upvote').patch(protect, toggleUpvote);
router.route('/:id/status').patch(protect, adminOnly, changeStatus);
router.route('/:id/citizen-verify').patch(protect, citizenVerifyIssue);

module.exports = router;
