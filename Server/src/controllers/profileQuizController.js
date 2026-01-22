const { User, ProfileQuizSubmission } = require('../models');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// AI-powered quiz generation based on user skills using Gemini API
const generateQuizQuestions = async (skills) => {
  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured in environment");
    }

    // Limit skills to avoid too long prompts
    const limitedSkills = skills.slice(0, 5); // Max 5 skills to avoid timeout

    // Create simpler, more direct prompt for Gemini AI
    const prompt = `Create 8 quiz questions for these skills: ${limitedSkills.join(', ')}

Make 1-2 questions per skill with mix of easy/medium/hard difficulty.

Return only this JSON format:
[
  {
    "skill": "React.js",
    "difficulty": "easy", 
    "question": "What is JSX?",
    "options": ["JavaScript XML", "Java Syntax", "JSON XML", "JavaScript Extension"],
    "correctAnswer": "JavaScript XML",
    "explanation": "JSX stands for JavaScript XML"
  }
]

Important: Return ONLY the JSON array, no other text.`;

    console.log('Sending optimized prompt to Gemini API...');
    
    // Generate content using Gemini AI with timeout
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API timeout after 45 seconds')), 45000)
      )
    ]);
    
    const response = await result.response;
    const text = response.text();

    console.log('Received response from Gemini API, length:', text.length);
    console.log('Response preview:', text.substring(0, 200) + '...');

    // Check if response is empty
    if (!text || text.trim().length === 0) {
      throw new Error('Gemini API returned empty response');
    }

    // Clean and parse the JSON response
    let cleanJson = text.replace(/```json|```/g, "").trim();
    
    // Remove any markdown formatting
    cleanJson = cleanJson.replace(/^```[\s\S]*?\n/, '').replace(/\n```$/, '');
    
    // Check if cleaned JSON is empty
    if (!cleanJson || cleanJson.trim().length === 0) {
      throw new Error('Gemini API response is empty after cleaning');
    }
    
    console.log('Cleaned JSON preview:', cleanJson.substring(0, 300) + '...');
    
    const quizData = JSON.parse(cleanJson);

    // Validate the response structure
    if (!Array.isArray(quizData) || quizData.length === 0 || quizData.length > 10) {
      throw new Error("Invalid quiz format received from AI");
    }

    // Validate each question has required fields
    for (const question of quizData) {
      if (!question.skill || !question.difficulty || !question.question || !question.options || !question.correctAnswer || !question.explanation) {
        throw new Error("Missing required fields in quiz question");
      }
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        throw new Error("Each question must have exactly 4 options");
      }
      if (!question.options.includes(question.correctAnswer)) {
        throw new Error("Correct answer must be one of the options");
      }
    }

    // Convert correctAnswer to index for internal processing
    const questionsWithIndex = quizData.map(q => ({
      ...q,
      correct: q.options.indexOf(q.correctAnswer)
    }));

    console.log(`Generated ${questionsWithIndex.length} questions successfully`);
    return questionsWithIndex;

  } catch (error) {
    console.error('Error generating quiz with Gemini API:', error);
    console.error('Error details:', error.message);
    
    // No fallback - let the error propagate
    throw error;
  }
};

// Calculate single badge based on overall performance
const calculateRTEBadge = (overallScore) => {
  let badgeType = null;
  let level = null;
  
  if (overallScore >= 90) {
    badgeType = 'gold';
    level = 'Expert';
  } else if (overallScore >= 70) {
    badgeType = 'silver';
    level = 'Proficient';
  } else if (overallScore >= 50) {
    badgeType = 'bronze';
    level = 'Intermediate';
  }
  
  if (badgeType) {
    return {
      name: 'RTE',
      type: badgeType,
      level: level,
      score: overallScore,
      earnedAt: new Date().toISOString(),
      description: 'Real-Time Evaluation - Comprehensive skill assessment'
    };
  }
  
  return null;
};

// Generate profile quiz
exports.generateProfileQuiz = async (req, res) => {
  try {
    console.log('Generate profile quiz request received');
    const userId = req.user.id;
    const { skills } = req.body;

    console.log('User ID:', userId);
    console.log('Skills received:', skills);

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      console.log('Invalid skills array');
      return res.status(400).json({ error: 'Skills array is required' });
    }

    // Check if user has already completed the quiz
    const user = await User.findByPk(userId);
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('Profile quiz completed:', user?.profileQuizCompleted);
    
    if (user.profileQuizCompleted) {
      console.log('User has already completed quiz');
      return res.status(400).json({ error: 'Profile quiz can only be taken once' });
    }

    // Generate questions based on skills using Gemini API
    console.log('Generating questions using Gemini API for skills:', skills);
    const questions = await generateQuizQuestions(skills);
    console.log('Generated questions count:', questions.length);

    if (questions.length === 0) {
      console.log('No questions generated');
      return res.status(400).json({ error: 'Unable to generate questions for the provided skills' });
    }

    // Return questions without correct answers for frontend display
    const questionsForFrontend = questions.map(q => ({
      skill: q.skill,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options
    }));

    console.log('Sending response with questions');
    res.json({
      questions: questionsForFrontend,
      questionsWithAnswers: questions, // Include full questions for answer checking
      totalQuestions: questions.length,
      timeLimit: 30 // 30 minutes
    });

  } catch (error) {
    console.error('Error generating profile quiz:', error);
    
    if (error.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({ 
        error: 'AI service not configured properly' 
      });
    }
    
    if (error.message.includes('JSON')) {
      return res.status(500).json({
        error: 'Failed to parse AI response',
        details: 'The AI returned invalid format'
      });
    }

    res.status(500).json({ 
      error: 'Failed to generate quiz',
      details: error.message 
    });
  }
};

// Submit profile quiz
exports.submitProfileQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { answers, timeSpent, completedAt, skills, questions: submittedQuestions } = req.body;

    // Check if user has already completed the quiz
    const user = await User.findByPk(userId);
    if (user.profileQuizCompleted) {
      return res.status(400).json({ error: 'Profile quiz can only be taken once' });
    }

    let questions;
    
    // If questions are provided in the request, use them (preferred)
    if (submittedQuestions && Array.isArray(submittedQuestions)) {
      questions = submittedQuestions;
    } else {
      // Fallback: regenerate questions (not ideal but works)
      console.log('Regenerating questions for answer checking...');
      questions = await generateQuizQuestions(skills);
    }

    // Calculate scores
    let totalCorrect = 0;
    const skillScores = {};

    // Initialize skill scores
    skills.forEach(skill => {
      skillScores[skill] = { correct: 0, total: 0 };
    });

    // Check answers
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;
      
      // Handle both formats: with 'correct' index or 'correctAnswer' string
      if (typeof question.correct === 'number') {
        isCorrect = userAnswer === question.correct;
      } else if (question.correctAnswer && question.options) {
        const correctIndex = question.options.indexOf(question.correctAnswer);
        isCorrect = userAnswer === correctIndex;
      }
      
      if (isCorrect) {
        totalCorrect++;
        if (skillScores[question.skill]) {
          skillScores[question.skill].correct++;
        }
      }
      
      if (skillScores[question.skill]) {
        skillScores[question.skill].total++;
      }
    });

    // Calculate percentages for each skill
    const skillScoreArray = Object.keys(skillScores).map(skill => ({
      name: skill,
      score: skillScores[skill].total > 0 
        ? Math.round((skillScores[skill].correct / skillScores[skill].total) * 100)
        : 0
    }));

    const overallScore = Math.round((totalCorrect / questions.length) * 100);

    // Calculate single RTE badge based on overall score
    const rteBadge = calculateRTEBadge(overallScore);
    const badges = rteBadge ? [rteBadge] : [];

    // Save submission
    const submission = await ProfileQuizSubmission.create({
      userId,
      skills,
      questions,
      answers,
      skillScores: skillScoreArray,
      overallScore,
      badges,
      timeSpent,
      completedAt
    });

    // Update user profile with single RTE badge
    await user.update({
      profileQuizCompleted: true,
      profileQuizCompletedAt: new Date(),
      badges: badges
    });

    res.status(201).json({
      message: 'Profile quiz submitted successfully',
      results: {
        overallScore,
        correctAnswers: totalCorrect,
        totalQuestions: questions.length,
        timeSpent,
        skillScores: skillScoreArray,
        badges
      }
    });

  } catch (error) {
    console.error('Error submitting profile quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

// Get profile quiz status
exports.getProfileQuizStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    
    if (!user.profileQuizCompleted) {
      return res.json({
        hasCompleted: false,
        badges: []
      });
    }

    const submission = await ProfileQuizSubmission.findOne({
      where: { userId }
    });

    res.json({
      hasCompleted: true,
      completedAt: user.profileQuizCompletedAt,
      badges: user.badges || [],
      overallScore: submission ? submission.overallScore : null,
      skillScores: submission ? submission.skillScores : []
    });

  } catch (error) {
    console.error('Error getting profile quiz status:', error);
    res.status(500).json({ error: 'Failed to get quiz status' });
  }
};

// Get user badges (for profile display)
exports.getUserBadges = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['badges', 'profileQuizCompleted', 'profileQuizCompletedAt']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      badges: user.badges || [],
      hasCompletedQuiz: user.profileQuizCompleted,
      completedAt: user.profileQuizCompletedAt
    });

  } catch (error) {
    console.error('Error getting user badges:', error);
    res.status(500).json({ error: 'Failed to get user badges' });
  }
};