const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// Generate Quiz Endpoint
router.post("/generate", async (req, res) => {
  try {
    const { topic, difficulty } = req.body;

    // Validate input
    if (!topic || !difficulty) {
      return res.status(400).json({ 
        error: "Both topic and difficulty are required" 
      });
    }

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY not configured in environment" 
      });
    }

    // Create prompt for Gemini AI
    const prompt = `Create 5 ${difficulty} level multiple choice questions for a placement test on ${topic}.

Return ONLY a valid JSON array with no additional text or formatting.
Each question object must contain exactly these fields:
- question: string (the question text)
- options: array of exactly 4 strings (the answer choices)
- correctAnswer: string (must match one of the options exactly)
- explanation: string (brief explanation of why the answer is correct)

Make sure the questions are relevant for job placement assessment and cover different aspects of ${topic}.`;

    // Generate content using Gemini AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse the JSON response
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const quizData = JSON.parse(cleanJson);

    // Validate the response structure
    if (!Array.isArray(quizData) || quizData.length !== 5) {
      throw new Error("Invalid quiz format received from AI");
    }

    // Validate each question has required fields
    for (const question of quizData) {
      if (!question.question || !question.options || !question.correctAnswer || !question.explanation) {
        throw new Error("Missing required fields in quiz question");
      }
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        throw new Error("Each question must have exactly 4 options");
      }
      if (!question.options.includes(question.correctAnswer)) {
        throw new Error("Correct answer must be one of the options");
      }
    }

    res.json(quizData);

  } catch (error) {
    console.error("Quiz generation error:", error);
    
    if (error.message.includes("JSON")) {
      return res.status(500).json({
        error: "Failed to parse AI response",
        details: "The AI returned invalid JSON format"
      });
    }

    res.status(500).json({
      error: "Quiz generation failed",
      details: error.message
    });
  }
});

// Get available quiz topics
router.get("/topics", (req, res) => {
  const topics = [
    {
      id: "javascript",
      name: "JavaScript",
      topic: "JavaScript programming language",
      difficulty: "medium",
      description: "Core JavaScript concepts, ES6+, and best practices"
    },
    {
      id: "react",
      name: "React.js",
      topic: "React.js framework",
      difficulty: "medium",
      description: "React components, hooks, state management, and lifecycle"
    },
    {
      id: "nodejs",
      name: "Node.js",
      topic: "Node.js backend development",
      difficulty: "medium",
      description: "Server-side JavaScript, APIs, and backend concepts"
    },
    {
      id: "python",
      name: "Python",
      topic: "Python programming language",
      difficulty: "medium",
      description: "Python syntax, data structures, and programming concepts"
    },
    {
      id: "java",
      name: "Java",
      topic: "Java programming language",
      difficulty: "medium",
      description: "Object-oriented programming with Java"
    },
    {
      id: "database",
      name: "Database & SQL",
      topic: "SQL and Database Management",
      difficulty: "medium",
      description: "Database design, SQL queries, and data management"
    }
  ];

  res.json(topics);
});

module.exports = router;