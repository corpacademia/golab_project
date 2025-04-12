import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  ArrowLeft, 
  Cloud, 
  Server, 
  Key, 
  User, 
  ExternalLink, 
  Edit, 
  Save, 
  Loader, 
  AlertCircle, 
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  List,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import axios from 'axios';

interface Module {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  title: string;
  type: 'lab' | 'quiz';
  content: string;
  questions?: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const CloudSliceModulesPage: React.FC = () => {
  const location = useLocation();
  const { sliceId } = useParams();
  const navigate = useNavigate();
  
  const [sliceDetails, setSliceDetails] = useState<any>(location.state?.sliceDetails || null);
  const [isLoading, setIsLoading] = useState(!location.state?.sliceDetails);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeExercise, setActiveExercise] = useState<{moduleId: string, exerciseId: string} | null>(null);
  const [isEditingExercise, setIsEditingExercise] = useState(false);
  const [exerciseContent, setExerciseContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isModulesLoading, setIsModulesLoading] = useState(false);
  
  // Quiz editing state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  // Fetch slice details if not provided in location state
  useEffect(() => {
    if (!sliceDetails && sliceId) {
      const fetchSliceDetails = async () => {
        setIsLoading(true);
        try {
          const response = await axios.post(`http://localhost:3000/api/v1/cloud_slice_ms/getCloudSliceDetails/${sliceId}`);
          if (response.data.success) {
            setSliceDetails(response.data.data);
          } else {
            setError('Failed to load cloud slice details');
          }
        } catch (err) {
          setError('Failed to load cloud slice details');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSliceDetails();
    }
  }, [sliceId, sliceDetails]);

  // Fetch modules
  useEffect(() => {
    if (sliceId) {
      const fetchModules = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/api/v1/cloud_slice_ms/getModules/${sliceId}`);
          if (response.data.success) {
            setModules(response.data.data);

            setIsModulesLoading(true);

            // Expand the first module by default
            if (response.data.data.length > 0) {
              setExpandedModules([response.data.data[0].id]);
            }
          }
        } catch (err) {
          console.error('Failed to fetch modules:', err);
        }
        finally {
          setIsModulesLoading(true);
        }
      };
      
      fetchModules();
    }
  }, [sliceId]);

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleExerciseClick = (moduleId: string, exercise: Exercise) => {
    setActiveExercise({ moduleId, exerciseId: exercise.id });
    setIsEditingExercise(false);
    
    if (exercise.type === 'lab') {
      setExerciseContent(exercise.content);
    } else if (exercise.type === 'quiz') {
      setQuizQuestions(exercise.questions || []);
    }
  };

  const handleEditExercise = () => {
    setIsEditingExercise(true);
  };

  const handleSaveExercise = async () => {
    if (!activeExercise) return;
    
    setIsSaving(true);
    setNotification(null);
    
    try {
      const exercise = modules
        .find(m => m.id === activeExercise.moduleId)
        ?.exercises.find(e => e.id === activeExercise.exerciseId);
      
      if (!exercise) throw new Error('Exercise not found');
      
      const updatedExercise = {
        ...exercise,
        content: exercise.type === 'lab' ? exerciseContent : exercise.content,
        questions: exercise.type === 'quiz' ? quizQuestions : exercise.questions
      };
      
      const response = await axios.post(`http://localhost:3000/api/v1/cloud_slice_ms/updateExercise`, {
        sliceId,
        moduleId: activeExercise.moduleId,
        exerciseId: activeExercise.exerciseId,
        exercise: updatedExercise
      });
      
      if (response.data.success) {
        setNotification({ type: 'success', message: 'Exercise updated successfully' });
        
        // Update local state
        setModules(prev => prev.map(module => {
          if (module.id === activeExercise.moduleId) {
            return {
              ...module,
              exercises: module.exercises.map(ex => 
                ex.id === activeExercise.exerciseId ? updatedExercise : ex
              )
            };
          }
          return module;
        }));
        
        setIsEditingExercise(false);
        setTimeout(() => setNotification(null), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to update exercise');
      }
    } catch (err: any) {
      setNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to update exercise' 
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    
    setQuizQuestions(prev => [...prev, newQuestion]);
    setEditingQuestion(newQuestion);
  };

  const handleUpdateQuestion = (updatedQuestion: QuizQuestion) => {
    setQuizQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuizQuestions(prev => prev.filter(q => q.id !== questionId));
    if (editingQuestion?.id === questionId) {
      setEditingQuestion(null);
    }
  };

  const handleGoToConsole = () => {
    if (sliceDetails?.consoleUrl) {
      window.open(sliceDetails.consoleUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 text-primary-400 animate-spin" />
      </div>
    );
  }
  if(!isModulesLoading){
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
        <p className="text-gray-400 mb-6">Unable to load the cloud slice details.</p>
        <button 
          onClick={() => navigate('/dashboard/labs/cloud-slices')}
          className="btn-secondary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cloud Slices
        </button>
      </div>
    );
  }

  const getActiveExercise = () => {
    if (!activeExercise) return null;
    
    return modules
      .find(m => m.id === activeExercise.moduleId)
      ?.exercises.find(e => e.id === activeExercise.exerciseId);
  };

  const currentExercise = getActiveExercise();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard/labs/cloud-slices')}
            className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold">
              <GradientText>{sliceDetails?.title || 'Modular Cloud Slice Lab'}</GradientText>
            </h1>
            <p className="mt-1 text-gray-400">{sliceDetails?.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            sliceDetails?.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
            sliceDetails?.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
            'bg-amber-500/20 text-amber-300'
          }`}>
            {sliceDetails?.status}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
            {sliceDetails?.provider?.toUpperCase()}
          </span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Modules & Exercises */}
        <div className="glass-panel">
          <h2 className="text-xl font-semibold mb-6">
            <GradientText>Modules</GradientText>
          </h2>
          
          <div className="space-y-4">
            {modules.map(module => (
              <div key={module.id} className="border border-primary-500/10 rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-3 bg-dark-300/50 cursor-pointer"
                  onClick={() => toggleModuleExpansion(module.id)}
                >
                  <div className="flex items-center space-x-2">
                    <ChevronDown 
                      className={`h-4 w-4 text-primary-400 transition-transform ${
                        expandedModules.includes(module.id) ? 'transform rotate-180' : ''
                      }`} 
                    />
                    <h3 className="font-medium text-gray-200">{module.title}</h3>
                  </div>
                  <span className="text-xs text-gray-400">
                    {module.exercises.length} exercise{module.exercises.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {expandedModules.includes(module.id) && (
                  <div className="p-3 space-y-2">
                    {module.exercises.map(exercise => (
                      <div 
                        key={exercise.id}
                        onClick={() => handleExerciseClick(module.id, exercise)}
                        className={`flex items-center p-2 rounded-lg cursor-pointer ${
                          activeExercise?.exerciseId === exercise.id
                            ? 'bg-primary-500/20 text-primary-300'
                            : 'hover:bg-dark-300/50 text-gray-300'
                        }`}
                      >
                        <ChevronRight className="h-4 w-4 mr-2" />
                        <div>
                          <p className="text-sm font-medium">{exercise.title}</p>
                          <div className="flex items-center mt-1">
                            {exercise.type === 'lab' ? (
                              <Server className="h-3 w-3 mr-1 text-gray-400" />
                            ) : (
                              <FileText className="h-3 w-3 mr-1 text-gray-400" />
                            )}
                            <span className="text-xs text-gray-400 capitalize">{exercise.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column - Exercise Content */}
        <div className="lg:col-span-2">
          {currentExercise ? (
            <div className="glass-panel">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    <GradientText>{currentExercise.title}</GradientText>
                  </h2>
                  <div className="flex items-center mt-1">
                    {currentExercise.type === 'lab' ? (
                      <Server className="h-4 w-4 mr-1 text-primary-400" />
                    ) : (
                      <FileText className="h-4 w-4 mr-1 text-primary-400" />
                    )}
                    <span className="text-sm text-gray-400 capitalize">{currentExercise.type}</span>
                  </div>
                </div>
                
                {isEditingExercise ? (
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                        setIsEditingExercise(false);
                        // Reset to original content
                        if (currentExercise.type === 'lab') {
                          setExerciseContent(currentExercise.content);
                        } else {
                          setQuizQuestions(currentExercise.questions || []);
                        }
                      }}
                      className="btn-secondary text-sm py-1.5 px-3"
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveExercise}
                      disabled={isSaving}
                      className="btn-primary text-sm py-1.5 px-3"
                    >
                      {isSaving ? (
                        <Loader className="animate-spin h-4 w-4" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1.5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleEditExercise}
                    className="btn-secondary text-sm py-1.5 px-3"
                  >
                    <Edit className="h-4 w-4 mr-1.5" />
                    Edit Exercise
                  </button>
                )}
              </div>

              {currentExercise.type === 'lab' ? (
                <div className="space-y-4">
                  {isEditingExercise ? (
                    <textarea
                      value={exerciseContent}
                      onChange={(e) => setExerciseContent(e.target.value)}
                      className="w-full h-64 px-4 py-3 bg-dark-400/50 border border-primary-500/20 rounded-lg
                               text-gray-300 focus:border-primary-500/40 focus:outline-none
                               font-mono text-sm"
                    />
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <div 
                        className="p-4 bg-dark-300/50 rounded-lg text-gray-300"
                        dangerouslySetInnerHTML={{ __html: currentExercise.content }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {isEditingExercise ? (
                    <div className="space-y-6">
                      {quizQuestions.map((question, index) => (
                        <div 
                          key={question.id}
                          className="p-4 bg-dark-300/50 rounded-lg border border-primary-500/10"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-sm font-medium text-gray-300">Question {index + 1}</h3>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="p-1 hover:bg-red-500/10 rounded-lg text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {editingQuestion?.id === question.id ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Question</label>
                                <input
                                  type="text"
                                  value={editingQuestion.question}
                                  onChange={(e) => setEditingQuestion({
                                    ...editingQuestion,
                                    question: e.target.value
                                  })}
                                  className="w-full px-3 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-xs text-gray-400">Options</label>
                                {editingQuestion.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      checked={editingQuestion.correctAnswer === optIndex}
                                      onChange={() => setEditingQuestion({
                                        ...editingQuestion,
                                        correctAnswer: optIndex
                                      })}
                                      className="form-radio h-4 w-4 text-primary-500"
                                    />
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...editingQuestion.options];
                                        newOptions[optIndex] = e.target.value;
                                        setEditingQuestion({
                                          ...editingQuestion,
                                          options: newOptions
                                        });
                                      }}
                                      className="flex-1 px-3 py-1.5 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                               text-gray-300 focus:border-primary-500/40 focus:outline-none text-sm"
                                      placeholder={`Option ${optIndex + 1}`}
                                    />
                                  </div>
                                ))}
                              </div>
                              
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={() => setEditingQuestion(null)}
                                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleUpdateQuestion(editingQuestion)}
                                  className="px-3 py-1.5 text-xs bg-primary-500/20 text-primary-300 rounded-lg
                                           hover:bg-primary-500/30"
                                >
                                  Save Question
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-gray-300">{question.question}</p>
                              <div className="space-y-2">
                                {question.options.map((option, optIndex) => (
                                  <div 
                                    key={optIndex}
                                    className={`flex items-center space-x-2 p-2 rounded-lg ${
                                      question.correctAnswer === optIndex
                                        ? 'bg-primary-500/10 text-primary-300'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                      question.correctAnswer === optIndex
                                        ? 'bg-primary-500/20 border border-primary-500'
                                        : 'border border-gray-500'
                                    }`}>
                                      {question.correctAnswer === optIndex && (
                                        <div className="w-2 h-2 rounded-full bg-primary-400" />
                                      )}
                                    </div>
                                    <span>{option}</span>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => setEditingQuestion(question)}
                                className="text-xs text-primary-400 hover:text-primary-300"
                              >
                                Edit Question
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <button
                        onClick={handleAddQuestion}
                        className="w-full p-3 border border-dashed border-primary-500/20 rounded-lg
                                 text-primary-400 hover:text-primary-300 hover:border-primary-500/40
                                 flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {(currentExercise.questions || []).map((question, index) => (
                        <div 
                          key={question.id}
                          className="p-4 bg-dark-300/50 rounded-lg"
                        >
                          <h3 className="text-sm font-medium text-gray-300 mb-3">Question {index + 1}</h3>
                          <p className="text-gray-300 mb-3">{question.question}</p>
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div 
                                key={optIndex}
                                className="flex items-center space-x-2 p-2 rounded-lg"
                              >
                                <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center">
                                  {question.correctAnswer === optIndex && (
                                    <div className="w-2 h-2 rounded-full bg-primary-400" />
                                  )}
                                </div>
                                <span className="text-gray-300">{option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel flex flex-col items-center justify-center py-12">
              <List className="h-12 w-12 text-primary-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-200 mb-2">Select an Exercise</h2>
              <p className="text-gray-400 text-center max-w-md">
                Choose an exercise from the modules list to view its content.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Credentials & Console Access */}
      <div className="glass-panel">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Cloud Access</GradientText>
          </h2>
          <button
            onClick={handleGoToConsole}
            disabled={!sliceDetails?.consoleUrl}
            className="btn-primary text-sm py-1.5 px-4"
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Go to {sliceDetails?.provider?.toUpperCase()} Console
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-dark-300/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Username</span>
              <User className="h-4 w-4 text-primary-400" />
            </div>
            <p className="text-sm font-mono bg-dark-400/50 p-2 rounded border border-primary-500/10 text-gray-300">
              {sliceDetails?.credentials?.username || 'Not available'}
            </p>
          </div>
          
          <div className="p-3 bg-dark-300/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Access Key ID</span>
              <Key className="h-4 w-4 text-primary-400" />
            </div>
            <p className="text-sm font-mono bg-dark-400/50 p-2 rounded border border-primary-500/10 text-gray-300">
              {sliceDetails?.credentials?.accessKeyId || 'Not available'}
            </p>
          </div>
          
          <div className="p-3 bg-dark-300/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Secret Access Key</span>
              <Key className="h-4 w-4 text-primary-400" />
            </div>
            <p className="text-sm font-mono bg-dark-400/50 p-2 rounded border border-primary-500/10 text-gray-300">
              {sliceDetails?.credentials?.secretAccessKey || 'Not available'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};