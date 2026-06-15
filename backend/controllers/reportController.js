const PDFDocument = require('pdfkit');
const Interview = require('../models/Interview');

// @desc    Generate PDF report for an interview
// @route   GET /api/reports/:id/pdf
exports.generatePDFReport = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id }).populate('user', 'name email');
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=interview-report-${interview._id}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(22).fillColor('#4f46e5').text('AI Mock Interview Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).fillColor('#666').text(`Generated for: ${interview.user.name} (${interview.user.email})`, { align: 'center' });
    doc.text(`Date: ${new Date(interview.completedAt || interview.createdAt).toLocaleString()}`, { align: 'center' });
    doc.moveDown(1.5);

    // Summary
    doc.fontSize(14).fillColor('#000').text('Interview Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#333');
    doc.text(`Role: ${interview.role}`);
    doc.text(`Experience Level: ${interview.experienceLevel}`);
    doc.text(`Difficulty: ${interview.difficulty}`);
    doc.text(`Total Questions: ${interview.numberOfQuestions}`);
    doc.text(`Overall Score: ${interview.overallScore} / 10`);
    doc.moveDown();

    // Strengths
    if (interview.strengthAnalysis?.length) {
      doc.fontSize(13).fillColor('#16a34a').text('Strengths', { underline: true });
      doc.fontSize(10).fillColor('#333');
      interview.strengthAnalysis.forEach(s => doc.text(`• ${s}`));
      doc.moveDown(0.5);
    }

    // Weaknesses
    if (interview.weaknessAnalysis?.length) {
      doc.fontSize(13).fillColor('#dc2626').text('Areas for Improvement', { underline: true });
      doc.fontSize(10).fillColor('#333');
      interview.weaknessAnalysis.forEach(w => doc.text(`• ${w}`));
      doc.moveDown(0.5);
    }

    // Recommendations
    if (interview.recommendations?.length) {
      doc.fontSize(13).fillColor('#2563eb').text('Recommendations', { underline: true });
      doc.fontSize(10).fillColor('#333');
      interview.recommendations.forEach(r => doc.text(`• ${r}`));
      doc.moveDown();
    }

    // Questions
    doc.addPage();
    doc.fontSize(16).fillColor('#000').text('Question-by-Question Breakdown', { underline: true });
    doc.moveDown();

    interview.questions.forEach((q, idx) => {
      if (doc.y > 650) doc.addPage();

      doc.fontSize(12).fillColor('#4f46e5').text(`Q${idx + 1}. [${q.type.toUpperCase()}] (${q.difficulty})`);
      doc.fontSize(11).fillColor('#000').text(q.questionText, { width: 500 });
      doc.moveDown(0.3);

      doc.fontSize(10).fillColor('#555').text('Your Answer:', { continued: false, underline: true });
      doc.fontSize(10).fillColor('#333').text(q.userAnswer || 'No answer provided', { width: 500 });
      doc.moveDown(0.3);

      if (q.evaluation) {
        doc.fontSize(10).fillColor('#555').text(
          `Scores - Overall: ${q.evaluation.overallScore ?? 'N/A'}/10 | Technical: ${q.evaluation.technicalAccuracy ?? 'N/A'}/10 | Communication: ${q.evaluation.communicationScore ?? 'N/A'}/10 | Confidence: ${q.evaluation.confidenceScore ?? 'N/A'}/10`
        );
        doc.moveDown(0.2);

        if (q.evaluation.suggestions) {
          doc.fontSize(10).fillColor('#555').text('Suggestions:', { underline: true });
          doc.fontSize(10).fillColor('#333').text(q.evaluation.suggestions, { width: 500 });
          doc.moveDown(0.2);
        }

        if (q.evaluation.sampleAnswer) {
          doc.fontSize(10).fillColor('#555').text('Sample Answer:', { underline: true });
          doc.fontSize(10).fillColor('#333').text(q.evaluation.sampleAnswer, { width: 500 });
        }
      }

      doc.moveDown(1);
      doc.strokeColor('#ddd').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};