import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";
import apiService from "../services/api";
import "./ProfileQuiz.css";

const ProfileQuiz = ({ userSkills, onQuizComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]); // Store questions with correct answers
  const [loading, setLoading] = useState(false);
  const [hasAlreadyTaken, setHasAlreadyTaken] = useState(false);
  const [userBadges, setUserBadges] = useState([]);

  // Check if user has already taken the quiz
  useEffect(() => {
    checkQuizStatus();
  }, []);

  const checkQuizStatus = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfileQuizStatus();
      if (response.hasCompleted) {
        setHasAlreadyTaken(true);
        setUserBadges(response.badges || []);
      }
    } catch (error) {
      console.error("Error checking quiz status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate quiz questions based on user skills
  const generateQuiz = async () => {
    if (!userSkills || userSkills.length === 0) {
      toast.error("Please add skills to your profile first");
      return;
    }

    try {
      setLoading(true);
      console.log("Generating quiz for skills:", userSkills);

      // Show progress message
      toast.info(
        "Generating personalized quiz using AI... This may take up to 60 seconds.",
      );

      const response = await apiService.generateProfileQuiz(userSkills);
      console.log("Quiz generated successfully:", response);

      if (!response.questions || response.questions.length === 0) {
        throw new Error("No questions received from server");
      }

      // Store questions for display (without correct answers)
      setQuizQuestions(response.questions);

      // Store original questions with correct answers for submission
      // We'll need to get these from the backend response
      setOriginalQuestions(response.questionsWithAnswers || response.questions);

      setQuizStarted(true);
      toast.success(
        "Quiz generated successfully! You have 30 minutes to complete.",
      );
    } catch (error) {
      console.error("Error generating quiz:", error);

      let errorMessage = "Failed to generate quiz. ";
      if (error.message.includes("timeout")) {
        errorMessage += "The AI service is taking too long. Please try again.";
      } else if (error.message.includes("network")) {
        errorMessage += "Network error. Please check your connection.";
      } else {
        errorMessage += error.message || "Please try again later.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, quizCompleted, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const response = await apiService.submitProfileQuiz({
        answers,
        timeSpent: 1800 - timeLeft,
        completedAt: new Date().toISOString(),
        skills: userSkills,
        questions: originalQuestions, // Send the questions with correct answers
      });

      setResults(response.results);
      setQuizCompleted(true);
      toast.success("Quiz submitted successfully!");

      if (onQuizComplete) {
        onQuizComplete(response.results);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getTotalQuestions = () => {
    return quizQuestions.length;
  };

  const getBadgeIcon = (badgeType) => {
    switch (badgeType) {
      case "gold":
        return <Award className="badge-gold" size={24} />;
      case "silver":
        return <Award className="badge-silver" size={24} />;
      case "bronze":
        return <Award className="badge-bronze" size={24} />;
      default:
        return <Star className="badge-default" size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="profile-quiz-interface">
        <div className="quiz-loading">
          <div className="loading-spinner"></div>
          <p>Generating personalized quiz using AI...</p>
          <p style={{ fontSize: "14px", opacity: 0.7 }}>
            This may take up to 60 seconds. Please wait...
          </p>
          <p style={{ fontSize: "12px", opacity: 0.5, marginTop: "10px" }}>
            Creating questions based on your skills: {userSkills?.join(", ")}
          </p>
        </div>
      </div>
    );
  }

  if (hasAlreadyTaken) {
    return (
      <div className="profile-quiz-interface">
        <div className="quiz-already-taken">
          <div className="already-taken-header">
            <CheckCircle size={48} className="success-icon" />
            <h2>RTE Assessment Already Completed!</h2>
            <p>
              You have already taken the Real-Time Evaluation. Here is your
              earned badge:
            </p>
          </div>

          <div className="user-badges">
            {userBadges.length > 0 ? (
              userBadges.map((badge, index) => (
                <div key={index} className="badge-item">
                  {getBadgeIcon(badge.type)}
                  <div className="badge-info">
                    <h4>{badge.name}</h4>
                    <p>{badge.level} Level</p>
                    <span className="badge-score">{badge.score}%</span>
                    <p className="badge-description">{badge.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No badge earned yet.</p>
            )}
          </div>

          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted && results) {
    return (
      <div className="profile-quiz-interface">
        <div className="quiz-results">
          <div className="results-header">
            <CheckCircle size={48} className="success-icon" />
            <h2>RTE Assessment Completed!</h2>
          </div>

          <div className="results-stats">
            <div className="stat-item">
              <span className="stat-label">Overall Score</span>
              <span className="stat-value">{results.overallScore}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Correct Answers</span>
              <span className="stat-value">
                {results.correctAnswers}/{results.totalQuestions}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Time Taken</span>
              <span className="stat-value">
                {Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s
              </span>
            </div>
          </div>

          <div className="earned-badges">
            <h3>RTE Badge Earned:</h3>
            <div className="badges-grid">
              {results.badges && results.badges.length > 0 ? (
                results.badges.map((badge, index) => (
                  <div key={index} className="badge-earned">
                    {getBadgeIcon(badge.type)}
                    <div className="badge-details">
                      <h4>{badge.name}</h4>
                      <p>{badge.level} Level</p>
                      <span className="badge-score">{badge.score}%</span>
                      <p className="badge-description">{badge.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No badge earned. Keep practicing!</p>
              )}
            </div>
          </div>

          <div className="skill-breakdown">
            <h3>Skill Breakdown:</h3>
            {results.skillScores &&
              results.skillScores.map((skill, index) => (
                <div key={index} className="skill-score-item">
                  <span className="skill-name">{skill.name}</span>
                  <div className="skill-progress">
                    <div
                      className="skill-progress-bar"
                      style={{ width: `${skill.score}%` }}
                    ></div>
                  </div>
                  <span className="skill-percentage">{skill.score}%</span>
                </div>
              ))}
          </div>

          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="profile-quiz-interface">
        <div className="quiz-intro">
          <div className="quiz-intro-header">
            <Award size={48} className="quiz-icon" />
            <h2>RTE - Real-Time Evaluation</h2>
            <p>
              Take this one-time assessment to earn skill badge for your profile
            </p>
          </div>

          <div className="quiz-info">
            <div className="info-itempq">
              <Clock size={20} />
              <span>Time Limit: 30 minutes</span>
            </div>
            <div className="info-itempq">
              <CheckCircle size={20} />
              <span>Based on your skills</span>
            </div>
          </div>

          <div className="quiz-instructions">
            <h3>Instructions:</h3>
            <ul>
              <li>
                Questions will be generated using AI based on your profile
                skills
              </li>
              <li>Difficulty increases progressively for each skill</li>
              <li>Earn badges based on your performance in each skill area</li>
              <li>You can only take this quiz once</li>
              <li>Badges will be displayed on your profile</li>
              <li>Quiz generation may take a few moments</li>
            </ul>
          </div>

          <div className="badge-info">
            <h3>Badge Levels:</h3>
            <div className="badge-levels">
              <div className="badge-level">
                <Award className="badge-gold" size={20} />
                <span>Gold: 90%+ score</span>
              </div>
              <div className="badge-level">
                <Award className="badge-silver" size={20} />
                <span>Silver: 70-89% score</span>
              </div>
              <div className="badge-level">
                <Award className="badge-bronze" size={20} />
                <span>Bronze: 50-69% score</span>
              </div>
            </div>
          </div>

          <div className="quiz-actions">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={generateQuiz}
              disabled={loading}
            >
              {loading ? "Generating Quiz..." : "Start Assessment"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="profile-quiz-interface">
        <div className="quiz-error">
          <AlertCircle size={48} />
          <h3>Unable to Generate Quiz</h3>
          <p>Please add skills to your profile first.</p>
          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quizQuestions[currentQuestion];

  return (
    <div className="profile-quiz-interface">
      <div className="quiz-card">
        <div className="quiz-top-bar">
          <span className="question-count">
            {currentQuestion + 1}/{getTotalQuestions()}
          </span>

          <div className="quiz-timer-mini">
            <Clock size={16} />
            <span className={timeLeft < 300 ? "timer-warning" : ""}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Question Content */}
        <div className="quiz-content">
          <div className="question-meta">
            <span className="skill-tag">{currentQ.skill}</span>
            <span
              className={`difficulty-tag difficulty-${currentQ.difficulty}`}
            >
              {currentQ.difficulty}
            </span>
          </div>

          <h3>Question {currentQuestion + 1}</h3>
          <p className="question-text">{currentQ.question}</p>

          {/* Options */}
          <div className="options-grid">
            {currentQ.options.map((option, optionIndex) => (
              <label key={optionIndex} className="option-label">
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  checked={answers[currentQuestion] === optionIndex}
                  onChange={() =>
                    handleAnswerSelect(currentQuestion, optionIndex)
                  }
                />
                <span className="option-text">
                  <span className="option-letter">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="quiz-navigation">
          <button
            className="btn-secondary"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>

          {currentQuestion < getTotalQuestions() - 1 ? (
            <button
              className="btn-primary"
              onClick={() =>
                setCurrentQuestion((prev) =>
                  Math.min(getTotalQuestions() - 1, prev + 1),
                )
              }
            >
              Next
            </button>
          ) : (
            <button
              className="btn-success"
              onClick={handleSubmitQuiz}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileQuiz;
