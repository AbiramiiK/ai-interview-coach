const { groq } = require("../config/groq");

const extractJSON = (text) => {
  let cleaned = text.trim();

  cleaned = cleaned
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "");

  const start = cleaned.search(/[\[{]/);
  const end = Math.max(
    cleaned.lastIndexOf("]"),
    cleaned.lastIndexOf("}")
  );

  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return JSON.parse(cleaned);
};

// ---------------- GROQ HELPER ----------------

async function askGroq(prompt, temperature = 0.7) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature,
    messages: [
      { role: "user", content: prompt },
    ],
  });

  return completion.choices[0]?.message?.content || "";
}

// ---------------- FALLBACK CONTENT (used if Groq API is unavailable) ----------------

const fallbackQuestionBank = {
  technical: [
    "What are the key responsibilities and core skills required for a {role} role?",
    "Explain a technical concept or tool commonly used by {role}s that you find important.",
    "How would you approach debugging a complex issue in a project relevant to {role} work?",
    "What is your process for ensuring code quality and best practices as a {role}?",
    "Describe a technology stack you'd recommend for a typical {role} project and why.",
    "How do you stay updated with the latest trends and tools relevant to {role}?",
    "Walk through how you would design a scalable solution for a common {role} problem.",
    "What testing strategies do you use to ensure reliability in your work as a {role}?",
  ],
  behavioral: [
    "Tell me about a time you faced a difficult challenge at work and how you handled it.",
    "Describe a situation where you had to work closely with a difficult team member.",
    "Give an example of a time you took initiative on a project without being asked.",
    "How do you handle tight deadlines and pressure?",
    "Tell me about a time you made a mistake at work. How did you handle it?",
    "Describe a time when you had to learn a new skill quickly for a project.",
  ],
  situational: [
    "If you were assigned a project with unclear requirements, how would you proceed?",
    "How would you handle a situation where a teammate disagrees with your technical approach?",
    "If you discovered a critical bug right before a deadline, what would you do?",
    "How would you prioritize tasks if given multiple urgent assignments at once?",
    "If a stakeholder requested a feature that conflicts with best practices, how would you respond?",
    "How would you handle being asked to work on a technology you have no experience with?",
  ],
};

const generateFallbackQuestions = ({ role, difficulty, numberOfQuestions }) => {
  const techCount = Math.ceil(numberOfQuestions * 0.5);
  const behavioralCount = Math.ceil(numberOfQuestions * 0.3);
  const situationalCount = numberOfQuestions - techCount - behavioralCount;

  const pickQuestions = (type, count) => {
    const pool = fallbackQuestionBank[type];
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push({ questionText: pool[i % pool.length].replace(/{role}/g, role), type });
    }
    return result;
  };

  const all = [
    ...pickQuestions('technical', techCount),
    ...pickQuestions('behavioral', behavioralCount),
    ...pickQuestions('situational', situationalCount),
  ];

  return all.map((q, idx) => ({
    questionId: `q${idx + 1}`,
    questionText: q.questionText,
    type: q.type,
    difficulty,
  }));
};

const generateFallbackEvaluation = (userAnswer) => {
  const length = (userAnswer || '').trim().length;
  let base = 5;
  if (length === 0) base = 0;
  else if (length < 50) base = 4;
  else if (length < 150) base = 6;
  else base = 7;

  return {
    technicalAccuracy: base,
    communicationScore: Math.min(base + 1, 10),
    confidenceScore: base,
    overallScore: base,
    suggestions: length === 0
      ? "No answer was provided. Try to attempt every question, even partially, to demonstrate your thought process."
      : "Try to structure your answer with a clear introduction, supporting examples, and a concise conclusion. Adding specific examples from your own experience can strengthen your response.",
    sampleAnswer: "A strong answer would clearly address the question, provide relevant real-world examples, explain your reasoning step by step, and connect your response back to the role's requirements.",
    strengths: length > 0 ? ["Attempted the question", "Provided a relevant response"] : [],
    weaknesses: length === 0 ? ["No answer provided"] : ["Could include more specific examples", "Could elaborate further on technical details"],
  };
};

const generateFallbackFollowUp = () =>
  "Can you elaborate further on your answer with a specific example from your past experience?";

const generateFallbackAnalysis = ({ role }) => ({
  strengthAnalysis: [
    "Consistent effort to attempt and respond to all questions",
    "Clear communication style across responses",
    `Good foundational understanding relevant to ${role} responsibilities`,
  ],
  weaknessAnalysis: [
    "Responses could include more specific, real-world examples",
    "Technical depth could be improved in some areas",
    "Consider structuring answers using a clear framework (e.g., Situation-Task-Action-Result)",
  ],
  recommendations: [
    `Practice more ${role}-specific technical questions to build confidence`,
    "Use the STAR method (Situation, Task, Action, Result) for behavioral questions",
    "Review sample answers for each question to identify gaps in your responses",
  ],
});

// ---------------- MAIN EXPORTED FUNCTIONS (try Groq, fallback on error) ----------------

const generateQuestions = async ({ role, experienceLevel, difficulty, numberOfQuestions }) => {
  try {
    const techCount = Math.ceil(numberOfQuestions * 0.5);
    const behavioralCount = Math.ceil(numberOfQuestions * 0.3);
    const situationalCount = numberOfQuestions - techCount - behavioralCount;

    const prompt = `You are an expert technical interviewer. Generate exactly ${numberOfQuestions} interview questions for a "${role}" position, for a candidate with "${experienceLevel}" experience, at "${difficulty}" difficulty.

Distribution required:
- ${techCount} technical questions (specific to ${role} skills, tools, frameworks, concepts)
- ${behavioralCount} behavioral questions (teamwork, leadership, conflict resolution, etc.)
- ${situationalCount} situational questions (hypothetical work scenarios relevant to ${role})

Return ONLY a valid JSON array, no markdown, no explanation, in this exact format:
[
  { "questionId": "q1", "questionText": "the question text", "type": "technical" | "behavioral" | "situational", "difficulty": "${difficulty}" }
]

Ensure questions are realistic, professional, and appropriate for ${experienceLevel} candidates.`;

    const text = await askGroq(prompt);
    const questions = extractJSON(text);

    return questions.map((q, idx) => ({
      questionId: q.questionId || `q${idx + 1}`,
      questionText: q.questionText,
      type: q.type,
      difficulty: q.difficulty || difficulty,
      userAnswer: '', timeTaken: 0, isBookmarked: false,
      followUpQuestion: '', followUpAnswer: '',
      evaluation: { technicalAccuracy: null, communicationScore: null, confidenceScore: null, overallScore: null, suggestions: '', sampleAnswer: '', strengths: [], weaknesses: [] },
    }));
  } catch (error) {
    console.warn('Groq generateQuestions failed, using fallback:', error.message);
    return generateFallbackQuestions({ role, difficulty, numberOfQuestions }).map((q) => ({
      ...q,
      userAnswer: '', timeTaken: 0, isBookmarked: false,
      followUpQuestion: '', followUpAnswer: '',
      evaluation: { technicalAccuracy: null, communicationScore: null, confidenceScore: null, overallScore: null, suggestions: '', sampleAnswer: '', strengths: [], weaknesses: [] },
    }));
  }
};

const evaluateAnswer = async ({ questionText, userAnswer, role, experienceLevel, type }) => {
  if (!userAnswer || userAnswer.trim().length === 0) {
    return generateFallbackEvaluation(userAnswer);
  }

  try {
    const prompt = `You are an expert interview evaluator for a "${role}" position (${experienceLevel} level).

Question (${type}): "${questionText}"
Candidate's Answer: "${userAnswer}"

Evaluate this answer and return ONLY valid JSON (no markdown) in this exact format:
{
  "technicalAccuracy": <number 0-10>,
  "communicationScore": <number 0-10>,
  "confidenceScore": <number 0-10>,
  "overallScore": <number 0-10>,
  "suggestions": "<specific, actionable improvement suggestions, 2-3 sentences>",
  "sampleAnswer": "<a strong example answer to this question, 3-5 sentences>",
  "strengths": ["<strength1>", "<strength2>"],
  "weaknesses": ["<weakness1>", "<weakness2>"]
}

Be constructive, fair, and specific. Score based on correctness, clarity, depth, and structure.`;

    const text = await askGroq(prompt);
    return extractJSON(text);
  } catch (error) {
    console.warn('Groq evaluateAnswer failed, using fallback:', error.message);
    return generateFallbackEvaluation(userAnswer);
  }
};

const generateFollowUp = async ({ questionText, userAnswer, role }) => {
  try {
    const prompt = `Based on this interview question and the candidate's answer for a "${role}" position, generate ONE relevant follow-up question that digs deeper into their response.

Question: "${questionText}"
Answer: "${userAnswer}"

Return ONLY the follow-up question text, no quotes, no markdown, no explanation. Keep it concise (one sentence).`;

    const text = await askGroq(prompt);
    return text.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.warn('Groq generateFollowUp failed, using fallback:', error.message);
    return generateFallbackFollowUp();
  }
};

const generateOverallAnalysis = async ({ role, questions }) => {
  try {
    const summary = questions.map((q, i) =>
      `Q${i + 1} (${q.type}, ${q.difficulty}): Score ${q.evaluation?.overallScore ?? 'N/A'}/10. Weaknesses: ${(q.evaluation?.weaknesses || []).join(', ') || 'None'}`
    ).join('\n');

    const prompt = `Based on this interview performance summary for a "${role}" candidate:

${summary}

Return ONLY valid JSON (no markdown) in this format:
{
  "strengthAnalysis": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknessAnalysis": ["<weakness1>", "<weakness2>", "<weakness3>"],
  "recommendations": ["<personalized learning recommendation1>", "<recommendation2>", "<recommendation3>"]
}

Provide actionable, personalized insights based on the actual performance data above.`;

    const text = await askGroq(prompt);
    return extractJSON(text);
  } catch (error) {
    console.warn('Groq generateOverallAnalysis failed, using fallback:', error.message);
    return generateFallbackAnalysis({ role });
  }
};

module.exports = {
  generateQuestions,
  evaluateAnswer,
  generateFollowUp,
  generateOverallAnalysis,
};