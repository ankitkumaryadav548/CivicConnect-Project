const express = require('express');
const {
  getCitizenLeaderboard,
  getDepartmentLeaderboard,
  getMyImpact,
} = require('../controllers/leaderboardController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/citizens', getCitizenLeaderboard);
router.get('/departments', getDepartmentLeaderboard);
router.get('/my-impact', protect, getMyImpact);

module.exports = router;
