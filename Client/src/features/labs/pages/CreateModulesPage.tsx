import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  FileText, 
  BookOpen, 
  Code, 
  Loader,
  AlertCircle,
  Clock
} from 'lucide-react';
import axios from 'axios';

interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  duration: number; // Added duration field
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  questions: Question[];
}

export const CreateModulesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [labConfig, setLabConfig] = useState<any>(location.state?.labConfig || null);
  const [modules, setModules] = useState<Module[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [newModuleContent, setNewModuleContent] = useState('');
  const [newExerciseTitle, setNewExerciseTitle] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [newExerciseInstructions, setNewExerciseInstructions] = useState('');
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    duration: 60 // Default duration of 60 seconds
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!labConfig) {
      navigate('/dashboard/labs/create');
    }
  }, [labConfig, navigate]);

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) {
      setError('Module title is required');
      return;
    }

    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: newModuleTitle,
      description: newModuleDescription,
      content: newModuleContent,
      order: modules.length
    };

    setModules([...modules, newModule]);
    setNewModuleTitle('');
    setNewModuleDescription('');
    setNewModuleContent('');
    setIsCreatingModule(false);
    setError(null);
  };

  const handleAddExercise = () => {
    if (!newExerciseTitle.trim()) {
      setError('Exercise title is required');
      return;
    }

    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      title: newExerciseTitle,
      description: newExerciseDescription,
      instructions: newExerciseInstructions,
      questions: []
    };

    setExercises([...exercises, newExercise]);
    setNewExerciseTitle('');
    setNewExerciseDescription('');
    setNewExerciseInstructions('');
    setIsCreatingExercise(false);
    setError(null);
  };

  const handleAddQuestion = () => {
    if (!currentExercise) return;
    if (!newQuestion.text.trim()) {
      setError('Question text is required');
      return;
    }

    if (newQuestion.options.some(option => !option.trim())) {
      setError('All options must be filled');
      return;
    }

    if (newQuestion.duration <= 0) {
      setError('Duration must be greater than 0 seconds');
      return;
    }

    const updatedExercise = {
      ...currentExercise,
      questions: [
        ...currentExercise.questions,
        {
          id: `question-${Date.now()}`,
          ...newQuestion
        }
      ]
    };

    setExercises(exercises.map(ex => 
      ex.id === currentExercise.id ? updatedExercise : ex
    ));
    
    setCurrentExercise(updatedExercise);
    setNewQuestion({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      duration: 60
    });
    setIsAddingQuestion(false);
    setError(null);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleDeleteModule = (moduleId: string) => {
    setModules(modules.filter(module => module.id !== moduleId));
    if (currentModule?.id === moduleId) {
      setCurrentModule(null);
    }
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== exerciseId));
    if (currentExercise?.id === exerciseId) {
      setCurrentExercise(null);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!currentExercise) return;
    
    const updatedExercise = {
      ...currentExercise,
      questions: currentExercise.questions.filter(q => q.id !== questionId)
    };

    setExercises(exercises.map(ex => 
      ex.id === currentExercise.id ? updatedExercise : ex
    ));
    
    setCurrentExercise(updatedExercise);
  };

  const handleSubmit = async () => {
    if (modules.length === 0) {
      setError('Please add at least one module');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const user_profile = await axios.get(`http://localhost:3000/api/v1/user_ms/user_profile`);
      
      const result = await axios.post('http://localhost:3000/api/v1/cloud_slice_ms/createCloudSliceLab', {
        createdBy: user_profile.data.user.id,
        labData: {
          ...labConfig,
          modules,
          exercises
        }
      });
      
      if (result.data.success) {
        setSuccess('Lab with modules created successfully!');
        setTimeout(() => {
          navigate('/dashboard/labs/cloud-slices');
        }, 3000);
      } else {
        throw new Error('Failed to create lab with modules');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to create lab with modules');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/dashboard/labs/create')}
          className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </button>
        <h1 className="text-3xl font-display font-bold">
          <GradientText>Create Lab Modules</GradientText>
        </h1>
      </div>

      {labConfig && (
        <div className="glass-panel">
          <h2 className="text-xl font-semibold mb-4">
            <GradientText>Lab Configuration</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Title</p>
              <p className="text-gray-200">{labConfig.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Cloud Provider</p>
              <p className="text-gray-200">{labConfig.cloudProvider.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Region</p>
              <p className="text-gray-200">{labConfig.region}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Duration</p>
              <p className="text-gray-200">
                {new Date(labConfig.startDate).toLocaleDateString()} to {new Date(labConfig.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Module List */}
        <div className="glass-panel">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              <GradientText>Modules</GradientText>
            </h2>
            <button 
              onClick={() => setIsCreatingModule(true)}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Module
            </button>
          </div>

          {isCreatingModule ? (
            <div className="space-y-4 p-4 bg-dark-300/50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Module Title
                </label>
                <input
                  type="text"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter module title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter module description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newModuleContent}
                  onChange={(e) => setNewModuleContent(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter module content (supports Markdown)"
                  rows={5}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCreatingModule(false);
                    setNewModuleTitle('');
                    setNewModuleDescription('');
                    setNewModuleContent('');
                    setError(null);
                  }}
                  className="btn-secondary text-sm py-1.5 px-3"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </button>
                <button
                  onClick={handleAddModule}
                  className="btn-primary text-sm py-1.5 px-3"
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  Add Module
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {modules.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                  <p>No modules added yet</p>
                  <p className="text-sm">Click "Add Module" to create your first module</p>
                </div>
              ) : (
                modules.map((module, index) => (
                  <div 
                    key={module.id}
                    className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                      currentModule?.id === module.id 
                        ? 'bg-primary-500/20 border border-primary-500/30' 
                        : 'bg-dark-300/50 hover:bg-dark-300 border border-transparent'
                    } transition-colors`}
                    onClick={() => setCurrentModule(module)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-200">{module.title}</h3>
                        <p className="text-xs text-gray-400 line-clamp-1">{module.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module.id);
                      }}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Middle Column - Exercises */}
        <div className="glass-panel">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              <GradientText>Practice Exercises</GradientText>
            </h2>
            <button 
              onClick={() => setIsCreatingExercise(true)}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Exercise
            </button>
          </div>

          {isCreatingExercise ? (
            <div className="space-y-4 p-4 bg-dark-300/50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Exercise Title
                </label>
                <input
                  type="text"
                  value={newExerciseTitle}
                  onChange={(e) => setNewExerciseTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter exercise title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newExerciseDescription}
                  onChange={(e) => setNewExerciseDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter exercise description"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instructions
                </label>
                <textarea
                  value={newExerciseInstructions}
                  onChange={(e) => setNewExerciseInstructions(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter exercise instructions"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCreatingExercise(false);
                    setNewExerciseTitle('');
                    setNewExerciseDescription('');
                    setNewExerciseInstructions('');
                    setError(null);
                  }}
                  className="btn-secondary text-sm py-1.5 px-3"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </button>
                <button
                  onClick={handleAddExercise}
                  className="btn-primary text-sm py-1.5 px-3"
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  Add Exercise
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {exercises.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                  <p>No exercises added yet</p>
                  <p className="text-sm">Click "Add Exercise" to create your first exercise</p>
                </div>
              ) : (
                exercises.map((exercise) => (
                  <div 
                    key={exercise.id}
                    className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                      currentExercise?.id === exercise.id 
                        ? 'bg-primary-500/20 border border-primary-500/30' 
                        : 'bg-dark-300/50 hover:bg-dark-300 border border-transparent'
                    } transition-colors`}
                    onClick={() => setCurrentExercise(exercise)}
                  >
                    <div>
                      <h3 className="font-medium text-gray-200">{exercise.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-1">{exercise.description}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Code className="h-3 w-3 mr-1" />
                        {exercise.questions.length} question{exercise.questions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteExercise(exercise.id);
                      }}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Column - Questions */}
        <div className="glass-panel">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              <GradientText>
                {currentExercise ? 'Practice Questions' : 'Select an Exercise'}
              </GradientText>
            </h2>
            {currentExercise && (
              <button 
                onClick={() => setIsAddingQuestion(true)}
                className="btn-secondary text-sm py-1.5 px-3"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Question
              </button>
            )}
          </div>

          {!currentExercise ? (
            <div className="text-center py-8 text-gray-400">
              <Code className="h-12 w-12 mx-auto mb-3 text-gray-500" />
              <p>No exercise selected</p>
              <p className="text-sm">Select an exercise to add questions</p>
            </div>
          ) : isAddingQuestion ? (
            <div className="space-y-4 p-4 bg-dark-300/50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question
                </label>
                <textarea
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter question text"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (seconds)
                </label>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary-400 mr-2" />
                  <input
                    type="number"
                    value={newQuestion.duration}
                    onChange={(e) => setNewQuestion({ ...newQuestion, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                             text-gray-300 focus:border-primary-500/40 focus:outline-none"
                    placeholder="Duration in seconds"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={newQuestion.correctAnswer === index}
                        onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: index })}
                        className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-500"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                 text-gray-300 focus:border-primary-500/40 focus:outline-none"
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Select the radio button next to the correct answer
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsAddingQuestion(false);
                    setNewQuestion({
                      text: '',
                      options: ['', '', '', ''],
                      correctAnswer: 0,
                      duration: 60
                    });
                    setError(null);
                  }}
                  className="btn-secondary text-sm py-1.5 px-3"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </button>
                <button
                  onClick={handleAddQuestion}
                  className="btn-primary text-sm py-1.5 px-3"
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  Add Question
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {currentExercise.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Code className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                  <p>No questions added yet</p>
                  <p className="text-sm">Click "Add Question" to create your first question</p>
                </div>
              ) : (
                currentExercise.questions.map((question, qIndex) => (
                  <div 
                    key={question.id}
                    className="p-3 rounded-lg bg-dark-300/50 hover:bg-dark-300 border border-transparent transition-colors"
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-sm mr-2">
                            {qIndex + 1}
                          </span>
                          <h3 className="font-medium text-gray-200">{question.text}</h3>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{question.duration} seconds</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                    <div className="mt-2 space-y-1 pl-8">
                      {question.options.map((option, oIndex) => (
                        <div 
                          key={oIndex}
                          className={`text-sm p-1.5 rounded ${
                            oIndex === question.correctAnswer 
                              ? 'bg-emerald-500/10 text-emerald-300' 
                              : 'text-gray-400'
                          }`}
                        >
                          {oIndex === question.correctAnswer && (
                            <Check className="h-3.5 w-3.5 inline-block mr-1.5" />
                          )}
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-emerald-400" />
            <span className="text-emerald-200">{success}</span>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader className="animate-spin h-4 w-4 mr-2" />
              Creating Lab...
            </span>
          ) : (
            'Create Lab with Modules'
          )}
        </button>
      </div>
    </div>
  );
};