import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  FileText, 
  Video, 
  BookOpen, 
  CheckSquare,
  Layers,
  Loader,
  Check,
  AlertCircle,
  Clock
} from 'lucide-react';
import axios from 'axios';

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'practice';
  content: string;
  duration?: number; // Duration in minutes
  order: number;
  questions?: Question[];
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export const CreateModulesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [labConfig, setLabConfig] = useState<any>(location.state?.labConfig || null);
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: 'Introduction',
      description: 'Getting started with the lab environment',
      order: 1,
      exercises: []
    }
  ]);
  const [activeModule, setActiveModule] = useState<string>('1');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!labConfig && !location.state?.labConfig) {
      navigate('/dashboard/labs/create');
    } else if (location.state?.labConfig) {
      setLabConfig(location.state.labConfig);
    }
  }, [location, navigate]);

  const handleAddModule = () => {
    const newId = (modules.length + 1).toString();
    const newModule: Module = {
      id: newId,
      title: `Module ${modules.length + 1}`,
      description: '',
      order: modules.length + 1,
      exercises: []
    };
    setModules([...modules, newModule]);
    setActiveModule(newId);
  };

  const handleDeleteModule = (moduleId: string) => {
    if (modules.length <= 1) {
      setError('You must have at least one module');
      return;
    }
    
    const updatedModules = modules.filter(m => m.id !== moduleId);
    // Reorder remaining modules
    const reorderedModules = updatedModules.map((m, idx) => ({
      ...m,
      order: idx + 1
    }));
    
    setModules(reorderedModules);
    
    // If the active module was deleted, set the first module as active
    if (activeModule === moduleId) {
      setActiveModule(reorderedModules[0].id);
    }
  };

  const handleUpdateModule = (moduleId: string, field: keyof Module, value: string) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, [field]: value } : m
    ));
  };

  const handleAddExercise = (moduleId: string, type: Exercise['type']) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    
    const newExerciseId = `${moduleId}-ex-${module.exercises.length + 1}`;
    const newExercise: Exercise = {
      id: newExerciseId,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${module.exercises.length + 1}`,
      type,
      content: '',
      order: module.exercises.length + 1,
      duration: 0, // Default duration
      questions: type === 'quiz' ? [
        {
          id: `${newExerciseId}-q-1`,
          text: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ] : undefined
    };
    
    const updatedModule = {
      ...module,
      exercises: [...module.exercises, newExercise]
    };
    
    setModules(modules.map(m => m.id === moduleId ? updatedModule : m));
    setActiveExercise(newExerciseId);
  };

  const handleUpdateExercise = (
    moduleId: string, 
    exerciseId: string, 
    field: keyof Exercise, 
    value: string | number
  ) => {
    setModules(modules.map(m => {
      if (m.id !== moduleId) return m;
      
      return {
        ...m,
        exercises: m.exercises.map(ex => 
          ex.id === exerciseId ? { ...ex, [field]: value } : ex
        )
      };
    }));
  };

  const handleDeleteExercise = (moduleId: string, exerciseId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    
    const updatedExercises = module.exercises.filter(ex => ex.id !== exerciseId);
    // Reorder remaining exercises
    const reorderedExercises = updatedExercises.map((ex, idx) => ({
      ...ex,
      order: idx + 1
    }));
    
    const updatedModule = {
      ...module,
      exercises: reorderedExercises
    };
    
    setModules(modules.map(m => m.id === moduleId ? updatedModule : m));
    
    // If the active exercise was deleted, clear the active exercise
    if (activeExercise === exerciseId) {
      setActiveExercise(null);
    }
  };

  const handleUpdateQuestion = (
    moduleId: string,
    exerciseId: string,
    questionId: string,
    field: keyof Question | 'option',
    value: string | number,
    optionIndex?: number
  ) => {
    setModules(modules.map(m => {
      if (m.id !== moduleId) return m;
      
      return {
        ...m,
        exercises: m.exercises.map(ex => {
          if (ex.id !== exerciseId || !ex.questions) return ex;
          
          return {
            ...ex,
            questions: ex.questions.map(q => {
              if (q.id !== questionId) return q;
              
              if (field === 'option' && optionIndex !== undefined) {
                const updatedOptions = [...q.options];
                updatedOptions[optionIndex] = value as string;
                return { ...q, options: updatedOptions };
              }
              
              return { ...q, [field]: value };
            })
          };
        })
      };
    }));
  };

  const handleAddQuestion = (moduleId: string, exerciseId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    
    const exercise = module.exercises.find(ex => ex.id === exerciseId);
    if (!exercise || !exercise.questions) return;
    
    const newQuestionId = `${exerciseId}-q-${exercise.questions.length + 1}`;
    const newQuestion: Question = {
      id: newQuestionId,
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    
    const updatedExercise = {
      ...exercise,
      questions: [...exercise.questions, newQuestion]
    };
    
    setModules(modules.map(m => {
      if (m.id !== moduleId) return m;
      
      return {
        ...m,
        exercises: m.exercises.map(ex => 
          ex.id === exerciseId ? updatedExercise : ex
        )
      };
    }));
  };

  const handleDeleteQuestion = (moduleId: string, exerciseId: string, questionId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    
    const exercise = module.exercises.find(ex => ex.id === exerciseId);
    if (!exercise || !exercise.questions) return;
    
    if (exercise.questions.length <= 1) {
      setError('Quiz must have at least one question');
      return;
    }
    
    const updatedQuestions = exercise.questions.filter(q => q.id !== questionId);
    
    const updatedExercise = {
      ...exercise,
      questions: updatedQuestions
    };
    
    setModules(modules.map(m => {
      if (m.id !== moduleId) return m;
      
      return {
        ...m,
        exercises: m.exercises.map(ex => 
          ex.id === exerciseId ? updatedExercise : ex
        )
      };
    }));
  };

  const handleSubmit = async () => {
    // Validate modules
    if (modules.length === 0) {
      setError('You must create at least one module');
      return;
    }
    
    for (const module of modules) {
      if (!module.title.trim()) {
        setError(`Module ${module.order} must have a title`);
        return;
      }
      
      if (module.exercises.length === 0) {
        setError(`Module ${module.order} must have at least one exercise`);
        return;
      }
      
      for (const exercise of module.exercises) {
        if (!exercise.title.trim()) {
          setError(`Exercise in module ${module.order} must have a title`);
          return;
        }
        
        if (exercise.type === 'quiz' && (!exercise.questions || exercise.questions.length === 0)) {
          setError(`Quiz in module ${module.order} must have at least one question`);
          return;
        }
        
        if (exercise.type === 'quiz') {
          for (const question of exercise.questions || []) {
            if (!question.text.trim()) {
              setError(`Question in module ${module.order} must have text`);
              return;
            }
            
            if (question.options.some(opt => !opt.trim())) {
              setError(`All options in question "${question.text}" must be filled`);
              return;
            }
          }
        }
      }
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare data for submission
      const labData = {
        ...labConfig,
        modules: modules.map(m => ({
          title: m.title,
          description: m.description,
          order: m.order,
          exercises: m.exercises.map(ex => ({
            title: ex.title,
            type: ex.type,
            content: ex.content,
            duration: ex.duration || 0,
            order: ex.order,
            questions: ex.questions ? ex.questions.map(q => ({
              text: q.text,
              options: q.options,
              correctAnswer: q.correctAnswer
            })) : undefined
          }))
        }))
      };
      
      // Submit to API
      try {
        const user_profile = await axios.get(`http://localhost:3000/api/v1/user_ms/user_profile`);
        const result = await axios.post('http://localhost:3000/api/v1/cloud_slice_ms/createCloudSliceLab', {
          createdBy: user_profile.data.user.id,
          labData
        });
        
        if (result.data.success) {
          setSuccess('Lab with modules created successfully!');
          setTimeout(() => {
            navigate('/dashboard/labs/cloud-slices');
          }, 2000);
        } else {
          throw new Error('Failed to create lab with modules');
        }
      } catch (error) {
        console.error('API error:', error);
        throw new Error('Failed to create lab with modules');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError((err as Error).message || 'Failed to create lab with modules');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getExerciseIcon = (type: Exercise['type']) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <CheckSquare className="h-4 w-4" />;
      case 'practice':
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const renderExerciseContent = (module: Module, exercise: Exercise) => {
    switch (exercise.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video URL
              </label>
              <input
                type="url"
                value={exercise.content}
                onChange={(e) => handleUpdateExercise(module.id, exercise.id, 'content', e.target.value)}
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary-400" />
                <input
                  type="number"
                  min="1"
                  value={exercise.duration || 0}
                  onChange={(e) => handleUpdateExercise(module.id, exercise.id, 'duration', parseInt(e.target.value))}
                  placeholder="Enter duration in minutes"
                  className="flex-1 px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                />
              </div>
            </div>
          </div>
        );
      
      case 'document':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Document Content
              </label>
              <textarea
                value={exercise.content}
                onChange={(e) => handleUpdateExercise(module.id, exercise.id, 'content', e.target.value)}
                placeholder="Enter document content (supports Markdown)"
                rows={10}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary-400" />
                <input
                  type="number"
                  min="1"
                  value={exercise.duration || 0}
                  onChange={(e) => handleUpdateExercise(module.id, exercise.id, 'duration', parseInt(e.target.value))}
                  placeholder="Enter duration in minutes"
                  className="flex-1 px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                />
              </div>
            </div>
          </div>
        );
      
      case 'quiz':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quiz Instructions
              </label>
              <textarea
                value={exercise.content}
                onChange={(e) => handleUpdateExercise(module.id, exercise.id, 'content', e.target.value)}
                placeholder="Enter quiz instructions"
                rows={3}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary-400" />
                <input
                  type="number"
                  min="1"
                  value={exercise.duration || 0}
                  onChange={(e) => handleUpdateExercise(module.id, exercise.id, 'duration', parseInt(e.target.value))}
                  placeholder="Enter duration in minutes"
                  className="flex-1 px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-200">Questions</h3>
                <button
                  onClick={() => handleAddQuestion(module.id, exercise.id)}
                  className="btn-secondary text-sm py-1.5"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Question
                </button>
              </div>
              
              {exercise.questions?.map((question, qIndex) => (
                <div 
                  key={question.id}
                  className="p-4 bg-dark-300/50 rounded-lg border border-primary-500/10"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium text-gray-300">
                      Question {qIndex + 1}
                    </h4>
                    <button
                      onClick={() => handleDeleteQuestion(module.id, exercise.id, question.id)}
                      className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Question Text
                      </label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => handleUpdateQuestion(module.id, exercise.id, question.id, 'text', e.target.value)}
                        placeholder="Enter question text"
                        className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                 text-gray-300 focus:border-primary-500/40 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={question.correctAnswer === oIndex}
                              onChange={() => handleUpdateQuestion(module.id, exercise.id, question.id, 'correctAnswer', oIndex)}
                              className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-500"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleUpdateQuestion(module.id, exercise.id, question.id, 'option', e.target.value, oIndex)}
                              placeholder={`Option ${oIndex + 1}`}
                              className="flex-1 px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-gray-400">
                        Select the radio button next to the correct answer
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'practice':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Practice Exercise Instructions
              </label>
              <textarea
                value={exercise.content}
                onChange={(e) => handleUpdateExercise(module.id, exercise.id, 'content', e.target.value)}
                placeholder="Enter detailed instructions for the practice exercise"
                rows={10}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary-400" />
                <input
                  type="number"
                  min="1"
                  value={exercise.duration || 0}
                  onChange={(e) => handleUpdateExercise(module.id, exercise.id, 'duration', parseInt(e.target.value))}
                  placeholder="Enter duration in minutes"
                  className="flex-1 px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const activeModuleData = modules.find(m => m.id === activeModule);
  const activeExerciseData = activeModuleData?.exercises.find(ex => ex.id === activeExercise);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard/labs/create')}
            className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold">
              <GradientText>Create Lab Modules</GradientText>
            </h1>
            <p className="mt-2 text-gray-400">
              {labConfig?.title || 'Design your lab learning experience'}
            </p>
          </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Modules Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-200">
                Modules
              </h2>
              <button
                onClick={handleAddModule}
                className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 text-primary-400" />
              </button>
            </div>
            
            <div className="space-y-2">
              {modules.map(module => (
                <div 
                  key={module.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeModule === module.id 
                      ? 'bg-primary-500/15 border border-primary-500/20' 
                      : 'hover:bg-dark-300/50'
                  }`}
                  onClick={() => {
                    setActiveModule(module.id);
                    setActiveExercise(null);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-200">
                      {module.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module.id);
                      }}
                      className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                    {module.description || 'No description'}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Layers className="h-3 w-3 mr-1" />
                    {module.exercises.length} exercises
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeModuleData && (
            <div className="glass-panel">
              <h2 className="text-xl font-semibold mb-6">
                <GradientText>Module Details</GradientText>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Module Title
                  </label>
                  <input
                    type="text"
                    value={activeModuleData.title}
                    onChange={(e) => handleUpdateModule(activeModuleData.id, 'title', e.target.value)}
                    placeholder="Enter module title"
                    className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                             text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Module Description
                  </label>
                  <textarea
                    value={activeModuleData.description}
                    onChange={(e) => handleUpdateModule(activeModuleData.id, 'description', e.target.value)}
                    placeholder="Enter module description"
                    rows={3}
                    className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                             text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-200">
                    Exercises
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddExercise(activeModuleData.id, 'video')}
                      className="btn-secondary text-sm py-1.5"
                    >
                      <Video className="h-4 w-4 mr-1.5" />
                      Video
                    </button>
                    <button
                      onClick={() => handleAddExercise(activeModuleData.id, 'document')}
                      className="btn-secondary text-sm py-1.5"
                    >
                      <FileText className="h-4 w-4 mr-1.5" />
                      Document
                    </button>
                    <button
                      onClick={() => handleAddExercise(activeModuleData.id, 'quiz')}
                      className="btn-secondary text-sm py-1.5"
                    >
                      <CheckSquare className="h-4 w-4 mr-1.5" />
                      Quiz
                    </button>
                    <button
                      onClick={() => handleAddExercise(activeModuleData.id, 'practice')}
                      className="btn-secondary text-sm py-1.5"
                    >
                      <BookOpen className="h-4 w-4 mr-1.5" />
                      Practice
                    </button>
                  </div>
                </div>
                
                {activeModuleData.exercises.length === 0 ? (
                  <div className="p-6 bg-dark-300/50 rounded-lg border border-primary-500/10 text-center">
                    <p className="text-gray-400">
                      No exercises yet. Add your first exercise using the buttons above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeModuleData.exercises.map(exercise => (
                      <div 
                        key={exercise.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          activeExercise === exercise.id 
                            ? 'bg-primary-500/15 border border-primary-500/20' 
                            : 'hover:bg-dark-300/50 border border-primary-500/5'
                        }`}
                        onClick={() => setActiveExercise(exercise.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            {getExerciseIcon(exercise.type)}
                            <h4 className="font-medium text-gray-200">
                              {exercise.title}
                            </h4>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExercise(activeModuleData.id, exercise.id);
                            }}
                            className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className="capitalize">{exercise.type}</span>
                          {exercise.duration ? (
                            <span className="ml-2 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {exercise.duration} min
                            </span>
                          ) : null}
                          {exercise.type === 'quiz' && exercise.questions && (
                            <span className="ml-2">
                              {exercise.questions.length} questions
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeExerciseData && (
            <div className="glass-panel">
              <h2 className="text-xl font-semibold mb-6">
                <GradientText>Exercise Content</GradientText>
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Exercise Title
                  </label>
                  <input
                    type="text"
                    value={activeExerciseData.title}
                    onChange={(e) => handleUpdateExercise(activeModule, activeExerciseData.id, 'title', e.target.value)}
                    placeholder="Enter exercise title"
                    className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                             text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  />
                </div>
                
                {renderExerciseContent(activeModuleData!, activeExerciseData)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => navigate('/dashboard/labs/create')}
          className="btn-secondary"
        >
          Back
        </button>
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