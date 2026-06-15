const express = require('express');
const router = express.Router();
const {
  createInterview,
  getInterview,
  saveAnswer,
  toggleBookmark,
  generateFollowUp,
  saveFollowUpAnswer,
  submitInterview,
  getInterviewHistory,
  getBookmarkedQuestions,
  deleteInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createInterview);
router.get('/', getInterviewHistory);
router.get('/bookmarks', getBookmarkedQuestions);
router.get('/:id', getInterview);
router.put('/:id/answer', saveAnswer);
router.put('/:id/bookmark', toggleBookmark);
router.post('/:id/followup', generateFollowUp);
router.put('/:id/followup-answer', saveFollowUpAnswer);
router.post('/:id/submit', submitInterview);
router.delete('/:id', deleteInterview);

module.exports = router;