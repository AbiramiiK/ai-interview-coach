const express = require('express');
const router = express.Router();
const { updateProfile, getAnalytics } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.put('/profile', protect, updateProfile);
router.get('/analytics', protect, getAnalytics);

module.exports = router;