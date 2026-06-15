const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  type: { type: String, enum: ['technical', 'behavioral', 'situational'], required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  userAnswer: { type: String, default: '' },
  timeTaken: { type: Number, default: 0 }, // seconds
  isBookmarked: { type: Boolean, default: false },
  followUpQuestion: { type: String, default: '' },
  followUpAnswer: { type: String, default: '' },
  evaluation: {
    technicalAccuracy: { type: Number, min: 0, max: 10, default: null },
    communicationScore: { type: Number, min: 0, max: 10, default: null },
    confidenceScore: { type: Number, min: 0, max: 10, default: null },
    overallScore: { type: Number, min: 0, max: 10, default: null },
    suggestions: { type: String, default: '' },
    sampleAnswer: { type: String, default: '' },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
  },
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  experienceLevel: { type: String, enum: ['Fresher', '1-3 years', '3-5 years'], required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  numberOfQuestions: { type: Number, required: true },
  questions: [questionSchema],
  status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress' },
  overallScore: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  totalDuration: { type: Number, default: 0 }, // seconds
  strengthAnalysis: [{ type: String }],
  weaknessAnalysis: [{ type: String }],
  recommendations: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);