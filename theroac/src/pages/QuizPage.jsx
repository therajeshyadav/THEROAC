import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, CheckCircle, XCircle, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import DashboardHeader from '../components/candidate-dashboard/DashboardHeader';
import RecruiterHeader from '../components/recruiter-dashboard/RecruiterHeader';
import AdminHeader from '../components/Admin-dashboards/AdminHeader';
import './QuizPage.css';
import './CandidateDashboard.css';
import './RecruiterDashboard.css';
import './AdminDashboard.css';

const QuizPage = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState('selection'); // 'selection', 'quiz', 'result'
  const [quizTypes, setQuizTypes] = useState([]);
  const [selectedQuizType, setSelectedQuizType] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [correctAnswersMap, setCorrectAnswersMap] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Load quiz types on component mount
  useEffect(() => {
    loadQuizTypes();
    loadUserBadges();
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await apiService.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Handle navigation from header tabs
  const handleTabChange = (tab) => {
    const userRole = authUser?.role?.toLowerCase();
    
    if (userRole === 'candidate') {
      navigate('/candidate-dashboard', { state: { activeTab: tab } });
    } else if (userRole === 'recruiter') {
      navigate('/recruiter-dashboard', { state: { activeTab: tab } });
    } else if (userRole === 'admin') {
      navigate('/admin-dashboard', { state: { activeTab: tab } });
    }
  };

  // Timer effect
  useEffect(() => {
    if (currentStep === 'quiz' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === 'quiz' && timeLeft === 0 && quiz) {
      handleSubmitQuiz();
    }
  }, [timeLeft, currentStep, quiz]);

  const loadQuizTypes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getQuizTypes();
      setQuizTypes(response.quizTypes || response.data || []);
    } catch (error) {
      console.error('Failed to load quiz types:', error);
      // Show user-friendly error message
      alert('Failed to load quiz categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserBadges = async () => {
    try {
      const response = await apiService.getUserBadges();
      setUserBadges(response.badges || response.data || []);
    } catch (error) {
      console.error('Failed to load user badges:', error);
      // Don't show error for badges as it's not critical
    }
  };

  const handleSelectQuizType = async (quizType) => {
    try {
      setLoading(true);
      setSelectedQuizType(quizType);
      
      // Pass the full quizType object to generateQuiz
      const response = await apiService.generateQuiz(quizType);
      const quizData = response.quiz || response.data;
      setQuiz(quizData);
      
      // Store correct answers for scoring
      const correctAnswers = {};
      quizData.questions.forEach(q => {
        correctAnswers[q.id] = q.correctAnswer;
      });
      setCorrectAnswersMap(correctAnswers);
      
      setTimeLeft((quizData.timeLimit || quizType.timeLimit || 30) * 60); // Convert minutes to seconds
      setCurrentStep('quiz');
      setAnswers({});
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      alert('Failed to generate quiz from Gemini AI. Please try again.');
      setSelectedQuizType(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setLoading(true);
      
      // Calculate score locally
      let correctCount = 0;
      const totalQuestions = quiz.questions.length;
      
      quiz.questions.forEach(question => {
        const userAnswer = answers[question.id];
        const correctAnswer = correctAnswersMap[question.id];
        if (userAnswer === correctAnswer) {
          correctCount++;
        }
      });
      
      const score = Math.round((correctCount / totalQuestions) * 100);
      const passed = score >= 70; // 70% passing threshold
      const timeSpent = (selectedQuizType.timeLimit * 60) - timeLeft;
      
      const result = {
        score,
        correctAnswers: correctCount,
        totalQuestions,
        timeSpent,
        passed,
        badge: passed ? {
          id: `badge_${selectedQuizType.id}`,
          name: `${selectedQuizType.name} Expert`,
          icon: selectedQuizType.icon
        } : null
      };
      
      setResult(result);
      setCurrentStep('result');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleBackToSelection = () => {
    setCurrentStep('selection');
    setSelectedQuizType(null);
    setQuiz(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
  };

  const handleRetakeQuiz = () => {
    handleSelectQuizType(selectedQuizType);
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="quiz-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Render appropriate header based on user role
  const renderHeader = () => {
    if (!authUser) return null;

    const userRole = authUser.role?.toLowerCase();

    switch (userRole) {
      case 'candidate':
        return (
          <DashboardHeader
            activeTab="quiz"
            setActiveTab={handleTabChange}
            authUser={authUser}
            logout={logout}
          />
        );
      case 'recruiter':
        return (
          <RecruiterHeader
            activeTab="quiz"
            authUser={authUser}
            notifications={notifications}
            onNotificationClick={() => navigate('/notifications')}
            onLogoClick={() => navigate('/recruiter-dashboard')}
          />
        );
      case 'admin':
        return (
          <AdminHeader
            authUser={authUser}
            onLogoClick={() => navigate('/admin-dashboard')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="quiz-page">
      {/* Role-based Header */}
      {renderHeader()}

      <div className="quiz-container">
        {/* Quiz Title Section */}
        <div className="quiz-title-section">
          <div className="quiz-title-left">
            <h1 className="quiz-main-title">Skill Assessment Quiz</h1>
          </div>
          <div className="quiz-title-right">
            <div className="quiz-badge-count">
              <Award size={18} />
              <span>{userBadges.length} Badge{userBadges.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Quiz Type Selection */}
        {currentStep === 'selection' && (
          <div className="quiz-selection">
            <div className="selection-header">
              <Trophy className="trophy-icon" size={48} />
              <h2>Choose Your Quiz Category</h2>
              <p>Select a category to test your skills and earn badges</p>
            </div>

            <div className="quiz-types-grid">
              {quizTypes.length > 0 ? (
                quizTypes.map((type) => (
                  <div
                    key={type.id}
                    className="quiz-type-card"
                    onClick={() => handleSelectQuizType(type)}
                  >
                    <div className="quiz-type-icon">
                      <span>{type.icon || '🎯'}</span>
                    </div>
                    <h3>{type.name}</h3>
                    <p>{type.description}</p>
                    <div className="quiz-type-meta">
                      <span><Clock size={16} /> {type.timeLimit || 30} min</span>
                      <span>{type.questionCount || 10} questions</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-quiz-types">
                  <p>No quiz categories available at the moment.</p>
                  <p>Please check back later or contact support.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quiz Taking */}
        {currentStep === 'quiz' && quiz && (
          <div className="quiz-taking">
            <div className="quiz-progress">
              <div className="progress-info">
                <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                <div className="timer">
                  <Clock size={16} />
                  <span className={timeLeft < 300 ? 'timer-warning' : ''}>{formatTime(timeLeft)}</span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="question-container">
              <div className="question">
                <h3>{quiz.questions[currentQuestionIndex].question}</h3>
                <div className="options">
                  {quiz.questions[currentQuestionIndex].options.map((option, index) => (
                    <label key={index} className="option">
                      <input
                        type="radio"
                        name={`question-${quiz.questions[currentQuestionIndex].id}`}
                        value={option}
                        checked={answers[quiz.questions[currentQuestionIndex].id] === option}
                        onChange={() => handleAnswerSelect(quiz.questions[currentQuestionIndex].id, option)}
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="question-navigation">
                <button 
                  className="quixnavbtn secondary" 
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </button>
                
                <div className="question-indicators">
                  {quiz.questions.map((_, index) => (
                    <div 
                      key={index}
                      className={`question-indicator ${
                        index === currentQuestionIndex ? 'active' : ''
                      } ${
                        answers[quiz.questions[index].id] ? 'answered' : ''
                      }`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
                
                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <button 
                    className="quixnavbtn primary" 
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(answers).length !== quiz.questions.length}
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button 
                    className="quixnavbtn primary" 
                    onClick={handleNextQuestion}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quiz Result */}
        {currentStep === 'result' && result && (
          <div className="quiz-result">
            <div className="result-header">
              {result.passed ? (
                <CheckCircle className="result-icon success" size={64} />
              ) : (
                <XCircle className="result-icon failure" size={64} />
              )}
              <h2>{result.passed ? 'Congratulations!' : 'Keep Learning!'}</h2>
              <p>
                {result.passed 
                  ? 'You have successfully passed the quiz and earned a badge!'
                  : 'You can retake the quiz to improve your score.'
                }
              </p>
            </div>

            <div className="result-stats">
              <div className="stat">
                <span className="stat-value">{result.score}%</span>
                <span className="stat-label">Score</span>
              </div>
              <div className="stat">
                <span className="stat-value">{result.correctAnswers}</span>
                <span className="stat-label">Correct</span>
              </div>
              <div className="stat">
                <span className="stat-value">{result.totalQuestions}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat">
                <span className="stat-value">{formatTime(result.timeSpent)}</span>
                <span className="stat-label">Time</span>
              </div>
            </div>

            {result.badge && (
              <div className="badge-earned">
                <h3>Badge Earned!</h3>
                <div className="badge">
                  <span className="badge-icon">{result.badge.icon}</span>
                  <span className="badge-name">{result.badge.name}</span>
                </div>
              </div>
            )}

            <div className="result-actions">
              <button className="quixnavbtn secondary" onClick={handleBackToSelection}>
                Take Another Quiz
              </button>
              {!result.passed && (
                <button className="quixnavbtn primary" onClick={handleRetakeQuiz}>
                  Retake Quiz
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;