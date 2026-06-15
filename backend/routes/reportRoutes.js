const express = require('express');
const router = express.Router();
const { generatePDFReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/:id/pdf', protect, generatePDFReport);

module.exports = router;