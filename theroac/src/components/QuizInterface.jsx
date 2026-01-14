import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import './QuizInterface.css';

const QuizInterface = ({ eventId, stageIndex, stage, onQuizComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(stage.quiz.timeLimit * 60); // Convert to seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
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
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    toast.info(`Quiz started! You have ${stage.quiz.timeLimit} minutes to complete.`);
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const response = await apiService.submitStageQuiz(eventId, stageIndex, {
        answers,
        timeSpent: (stage.quiz.timeLimit * 60) - timeLeft,
        completedAt: new Date().toISOString()
      });

      setResults(response.results);
      setQuizCompleted(true);
      toast.success('Quiz submitted successfully!');
      
      if (onQuizComplete) {
        onQuizComplete(response.results);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getTotalQuestions = () => {
    return stage.quiz.questions.length;
  };

  if (!stage.quiz || !stage.quiz.questions || stage.quiz.questions.length === 0) {
    return (
      <div className="quiz-interface">
        <div className="quiz-error">
          <AlertCircle size={48} />
          <h3>Quiz Not Available</h3>
          <p>This stage doesn't have a quiz configured.</p>
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (quizCompleted && results) {
    return (
      <div className="quiz-interface">
        <div className="quiz-results">
          <div className="results-header">
            <CheckCircle size={48} className="success-icon" />
            <h2>Quiz Completed!</h2>
          </div>
          
          <div className="results-stats">
            <div className="stat-item">
              <span className="stat-label">Score</span>
              <span className="stat-value">{results.score}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Correct Answers</span>
              <span className="stat-value">{results.correctAnswers}/{results.totalQuestions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Time Taken</span>
              <span className="stat-value">{Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s</span>
            </div>
          </div>

          <div className="results-message">
            {results.score >= 70 ? (
              <div className="success-message">
                <CheckCircle size={24} />
                <span>Great job! You passed the quiz.</span>
              </div>
            ) : (
              <div className="warning-message">
                <AlertCircle size={24} />
                <span>You need 70% or higher to pass. Keep learning!</span>
              </div>
            )}
          </div>

          <button className="btn-primary" onClick={onClose}>
            Continue to Next Stage
          </button>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="quiz-interface">
        <div className="quiz-intro">
          <h2>{stage.quiz.title}</h2>
          <p>{stage.quiz.description}</p>
          
          <div className="quiz-info">
            <div className="info-item">
              <Clock size={20} />
              <span>Time Limit: {stage.quiz.timeLimit} minutes</span>
            </div>
            <div className="info-item">
              <CheckCircle size={20} />
              <span>Questions: {getTotalQuestions()}</span>
            </div>
            <div className="info-item">
              <AlertCircle size={20} />
              <span>Passing Score: 70%</span>
            </div>
          </div>

          <div className="quiz-instructions">
            <h3>Instructions:</h3>
            <ul>
              <li>Read each question carefully</li>
              <li>Select the best answer from the options provided</li>
              <li>You can navigate between questions</li>
              <li>Submit before time runs out</li>
              <li>Once submitted, you cannot retake the quiz</li>
            </ul>
          </div>

          <div className="quiz-actions">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleStartQuiz}>Start Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = stage.quiz.questions[currentQuestion];

  return (
    <div className="quiz-interface">
      <div className="quiz-header">
        <div className="quiz-progress">
          <span>Question {currentQuestion + 1} of {getTotalQuestions()}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / getTotalQuestions()) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="quiz-timer">
          <Clock size={20} />
          <span className={timeLeft < 300 ? 'timer-warning' : ''}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-section">
          <h3>Question {currentQuestion + 1}</h3>
          <p className="question-text">{currentQ.question}</p>
        </div>

        <div className="options-section">
          {currentQ.options.map((option, optionIndex) => (
            <label key={optionIndex} className="option-label">
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value={optionIndex}
                checked={answers[currentQuestion] === optionIndex}
                onChange={() => handleAnswerSelect(currentQuestion, optionIndex)}
              />
              <span className="option-text">
                <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        <div className="nav-buttons">
          <button 
            className="btn-secondary"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>
          
          {currentQuestion < getTotalQuestions() - 1 ? (
            <button 
              className="btn-primary"
              onClick={() => setCurrentQuestion(prev => Math.min(getTotalQuestions() - 1, prev + 1))}
            >
              Next
            </button>
          ) : (
            <button 
              className="btn-success"
              onClick={handleSubmitQuiz}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>

        <div className="quiz-status">
          <span>Answered: {getAnsweredCount()}/{getTotalQuestions()}</span>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;