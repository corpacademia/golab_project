import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { GradientText } from '../../../../components/ui/GradientText';
import { 
  ArrowLeft, 
  Clock, 
  AlertCircle, 
  Check,
  Loader,
  HelpCircle,
  Send,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Mock data for testing UI
const mockExercise = {
  id: 'exercise-2',
  title: 'Git Basics Quiz',
  description: 'Test your knowledge of Git fundamentals',
  type: 'quiz',
  order: 2,
  duration: 15,
  status: 'not-started'
};

const mockLabDetails = {
  id: 'lab-456',
  title: 'AWS DevOps Pipeline Lab',
  description: 'Learn to build and deploy a complete CI/CD pipeline using AWS services',
  provider: 'aws'
};

const mockQuestions = [
  {
    id: 'q1',
    text: 'Which command is used to create a new Git repository?',
    options: [
      { id: 'a1', text: 'git create' },
      { id: 'a2', text: 'git init' },
      { id: 'a3', text: 'git new' },
      { id: 'a4', text: 'git start' }
    ],
    correctOptionId: 'a2'
  },
  {
    id: 'q2',
    text: 'Which command adds files to the Git staging area?',
    options: [
      { id: 'b1', text: 'git stage' },
      { id: 'b2', text: 'git commit' },
      { id: 'b3', text: 'git add' },
      { id: 'b4', text: 'git push' }
    ],
    correctOptionId: 'b3'
  },
  {
    id: 'q3',
    text: 'What does the command "git pull" do?',
    options: [
      { id: 'c1', text: 'Uploads local changes to the remote repository' },
      { id: 'c2', text: 'Downloads and integrates changes from the remote repository' },
      { id: 'c3', text: 'Creates a new branch' },
      { id: 'c4', text: 'Shows the commit history' }
    ],
    correctOptionId: 'c2'
  },
  {
    id: 'q4',
    text: 'Which of the following is NOT a Git object type?',
    options: [
      { id: 'd1', text: 'Blob' },
      { id: 'd2', text: 'Tree' },
      { id: 'd3', text: 'Branch' },
      { id: 'd4', text: 'Commit' }
    ],
    correctOptionId: 'd3'
  }
];

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId?: string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  feedback: {
    questionId: string;
    isCorrect: boolean;
    correctOptionId: string;
  }[];
}

export const QuizExercisePage: React.FC = () => {
  const { exerciseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [exercise, setExercise] = useState<any>(location.state?.exercise || mockExercise);
  const [labDetails, setLabDetails] = useState<any>(location.state?.labDetails || mockLabDetails);
  const [moduleId, setModuleId] = useState<string | null>(location.state?.moduleId || 'module-1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(exercise.duration * 60); // Convert minutes to seconds
  const [user, setUser] = useState<any>({ id: 'user-123', name: 'Test User' });
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // Submit quiz
  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      setNotification({ 
        type: 'error', 
        message: `Please answer all questions before submitting (${unansweredQuestions.length} remaining)` 
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    setIsSubmitting(true);
    setNotification(null);
    
    // Simulate API call
    setTimeout(() => {
      // Calculate results
      const correctAnswers = questions.filter(q => answers[q.id] === q.correctOptionId).length;
      const incorrectAnswers = questions.length - correctAnswers;
      const score = Math.round((correctAnswers / questions.length) * 100);
      
      const feedback = questions.map(q => ({
        questionId: q.id,
        isCorrect: answers[q.id] === q.correctOptionId,
        correctOptionId: q.correctOptionId
      }));
      
      const result: QuizResult = {
        score,
        totalQuestions: questions.length,
        correctAnswers,
        incorrectAnswers,
        feedback
      };
      
      setQuizResult(result);
      setNotification({ type: 'success', message: 'Quiz submitted successfully' });
      setIsSubmitting(false);
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }, 1500);
  };

  // Countdown timer
  useEffect(() => {
    if (countdown === null || quizResult) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          if (!quizResult && Object.keys(answers).length > 0) {
            handleSubmit();
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown, quizResult, answers]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-200 mb-2">{error}</h2>
        <p className="text-gray-400 mb-6">Unable to load the quiz details.</p>
        <button 
          onClick={() => navigate(-1)}
          className="btn-secondary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold">
              <GradientText>{exercise?.title || 'Quiz Exercise'}</GradientText>
            </h1>
            <p className="mt-1 text-gray-400">{exercise?.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {countdown !== null && !quizResult && (
            <div className="px-4 py-2 bg-dark-300/50 rounded-lg flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary-400" />
              <span className="text-sm font-mono text-gray-300">{formatTimeRemaining(countdown)}</span>
            </div>
          )}
          
          {!quizResult && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(answers).length === 0}
              className="btn-primary"
            >
              {isSubmitting ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit Answers
            </button>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-500/20 border border-emerald-500/20' 
            : 'bg-red-500/20 border border-red-500/20'
        }`}>
          {notification.type === 'success' ? (
            <Check className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
          <span className={`text-sm ${
            notification.type === 'success' ? 'text-emerald-300' : 'text-red-300'
          }`}>
            {notification.message}
          </span>
        </div>
      )}

      <div className={`grid grid-cols-1 ${quizResult ? 'lg:grid-cols-2' : ''} gap-6`}>
        {/* Questions */}
        <div className="glass-panel">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              <GradientText>Questions</GradientText>
            </h2>
            <HelpCircle className="h-5 w-5 text-primary-400" />
          </div>

          <div className="space-y-8">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="space-y-4">
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-dark-400/80 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium">{qIndex + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-200">{question.text}</h3>
                    
                    <div className="mt-4 space-y-2">
                      {question.options.map(option => (
                        <label 
                          key={option.id}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                            quizResult ? (
                              option.id === question.correctOptionId
                                ? 'bg-emerald-500/20 border border-emerald-500/20'
                                : answers[question.id] === option.id && option.id !== question.correctOptionId
                                  ? 'bg-red-500/20 border border-red-500/20'
                                  : 'bg-dark-300/50 hover:bg-dark-300'
                            ) : (
                              answers[question.id] === option.id
                                ? 'bg-primary-500/20 border border-primary-500/20'
                                : 'bg-dark-300/50 hover:bg-dark-300'
                            )
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={answers[question.id] === option.id}
                            onChange={() => !quizResult && handleAnswerSelect(question.id, option.id)}
                            className="form-radio h-4 w-4 text-primary-500 border-gray-500/20 focus:ring-primary-500"
                            disabled={quizResult !== null}
                          />
                          <span className="ml-3 text-gray-300">{option.text}</span>
                          
                          {quizResult && (
                            <div className="ml-auto">
                              {option.id === question.correctOptionId ? (
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                              ) : (
                                answers[question.id] === option.id && (
                                  <XCircle className="h-5 w-5 text-red-400" />
                                )
                              )}
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results (only shown after submission) */}
        {quizResult && (
          <div className="glass-panel">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                <GradientText>Quiz Results</GradientText>
              </h2>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary-400" />
                <span className="text-gray-300">Completed</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="h-32 w-32 rounded-full bg-dark-300/80 border-4 border-primary-500/30 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-primary-400">{quizResult.score}%</span>
                    <p className="text-xs text-gray-400 mt-1">Score</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-dark-300/50 rounded-lg">
                  <div className="text-2xl font-semibold text-emerald-400">
                    {quizResult.correctAnswers}
                  </div>
                  <p className="text-sm text-gray-400">Correct</p>
                </div>
                
                <div className="p-4 bg-dark-300/50 rounded-lg">
                  <div className="text-2xl font-semibold text-red-400">
                    {quizResult.incorrectAnswers}
                  </div>
                  <p className="text-sm text-gray-400">Incorrect</p>
                </div>
              </div>

              <div className="p-4 bg-dark-300/50 rounded-lg">
                <h3 className="font-medium text-gray-200 mb-2">Summary</h3>
                <p className="text-sm text-gray-400">
                  You answered {quizResult.correctAnswers} out of {quizResult.totalQuestions} questions correctly.
                </p>
                {quizResult.score >= 70 ? (
                  <div className="mt-2 flex items-center text-emerald-400">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">You passed this quiz!</span>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center text-red-400">
                    <XCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">You did not pass this quiz. Required score: 70%</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate(-1)}
                className="btn-primary w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Module
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};