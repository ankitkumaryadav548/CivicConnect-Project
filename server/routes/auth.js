const express = require('express');
const { registerUser, loginUser, getMe, getUsers } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, adminOnly, getUsers);

module.exports = router;
