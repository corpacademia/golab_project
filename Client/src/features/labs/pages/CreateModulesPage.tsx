import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Loader, 
  AlertCircle,
  FileText,
  Clock,
  HelpCircle
} from 'lucide-react';
import axios from 'axios';

interface Module {
  title: string;
  description: string;
  content: string;
  duration: number;
  order: number;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    duration: number; // Added duration for each question
  }[];
}

export const CreateModulesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [labConfig, setLabConfig] = useState<any>(location.state?.labConfig || null);
  const [modules, setModules] = useState<Module[]>([
    {
      title: '',
      description: '',
      content: '',
      duration: 30,
      order: 1,
      questions: []
    }
  ]);
  const [activeModule, setActiveModule] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    duration: 60 // Default duration for questions (in seconds)
  });
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  useEffect(() => {
    if (!labConfig && !location.state?.labConfig) {
      navigate('/dashboard/labs/create');
    } else if (location.state?.labConfig) {
      setLabConfig(location.state.labConfig);
    }
  }, [location, navigate]);

  const handleModuleChange = (index: number, field: keyof Module, value: string | number) => {
    const updatedModules = [...modules];
    updatedModules[index] = {
      ...updatedModules[index],
      [field]: value
    };
    setModules(updatedModules);
  };

  const addModule = () => {
    setModules([
      ...modules,
      {
        title: '',
        description: '',
        content: '',
        duration: 30,
        order: modules.length + 1,
        questions: []
      }
    ]);
    setActiveModule(modules.length);
  };

  const removeModule = (index: number) => {
    if (modules.length === 1) {
      return; // Don't remove the last module
    }
    
    const updatedModules = [...modules];
    updatedModules.splice(index, 1);
    
    // Update order for remaining modules
    updatedModules.forEach((module, idx) => {
      module.order = idx + 1;
    });
    
    setModules(updatedModules);
    
    // Adjust active module if necessary
    if (activeModule >= updatedModules.length) {
      setActiveModule(updatedModules.length - 1);
    }
  };

  const handleQuestionChange = (field: string, value: string | number, optionIndex?: number) => {
    if (field === 'options' && optionIndex !== undefined) {
      const newOptions = [...currentQuestion.options];
      newOptions[optionIndex] = value as string;
      setCurrentQuestion({
        ...currentQuestion,
        options: newOptions
      });
    } else {
      setCurrentQuestion({
        ...currentQuestion,
        [field]: value
      });
    }
  };

  const addQuestion = () => {
    // Validate question
    if (!currentQuestion.question.trim()) {
      setError('Question text is required');
      return;
    }
    
    // Validate options
    const validOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      setError('At least two options are required');
      return;
    }
    
    // Validate correct answer
    if (currentQuestion.correctAnswer < 0 || currentQuestion.correctAnswer >= validOptions.length) {
      setError('Please select a valid correct answer');
      return;
    }

    // Validate duration
    if (currentQuestion.duration <= 0) {
      setError('Duration must be greater than 0 seconds');
      return;
    }
    
    const updatedModules = [...modules];
    updatedModules[activeModule].questions.push({
      ...currentQuestion,
      options: currentQuestion.options.filter(opt => opt.trim() !== '')
    });
    
    setModules(updatedModules);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      duration: 60
    });
    setShowQuestionForm(false);
    setError(null);
  };

  const removeQuestion = (questionIndex: number) => {
    const updatedModules = [...modules];
    updatedModules[activeModule].questions.splice(questionIndex, 1);
    setModules(updatedModules);
  };

  const handleSubmit = async () => {
    // Validate modules
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      if (!module.title.trim()) {
        setError(`Module ${i + 1}: Title is required`);
        setActiveModule(i);
        return;
      }
      if (!module.content.trim()) {
        setError(`Module ${i + 1}: Content is required`);
        setActiveModule(i);
        return;
      }
      if (module.duration <= 0) {
        setError(`Module ${i + 1}: Duration must be greater than 0`);
        setActiveModule(i);
        return;
      }
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Get user profile for user ID
      const userResponse = await axios.get('http://localhost:3000/api/v1/user_ms/user_profile');
      const userId = userResponse.data.user.id;
      
      // Create the lab with modules
      const response = await axios.post('http://localhost:3000/api/v1/cloud_slice_ms/createCloudSliceLabWithModules', {
        createdBy: userId,
        labData: labConfig,
        modules: modules
      });
      
      if (response.data.success) {
        setSuccess('Lab with modules created successfully!');
        setTimeout(() => {
          navigate('/dashboard/labs/cloud-slices');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to create lab with modules');
      }
    } catch (err: any) {
      console.error('Error creating lab with modules:', err);
      setError(err.response?.data?.message || 'Failed to create lab with modules');
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
              <p className="text-sm text-gray-400">Services</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {labConfig.services.map((service: string, index: number) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-4 overflow-x-auto pb-2">
        {modules.map((module, index) => (
          <button
            key={index}
            onClick={() => setActiveModule(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              activeModule === index
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                : 'bg-dark-300/50 text-gray-400 hover:bg-dark-300 hover:text-gray-300'
            }`}
          >
            {module.title || `Module ${index + 1}`}
          </button>
        ))}
        <button
          onClick={addModule}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-dark-300/50 text-gray-400 
                   hover:bg-dark-300 hover:text-gray-300 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Module
        </button>
      </div>

      <div className="glass-panel">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>
              {modules[activeModule].title || `Module ${activeModule + 1}`}
            </GradientText>
          </h2>
          {modules.length > 1 && (
            <button
              onClick={() => removeModule(activeModule)}
              className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Module Title
            </label>
            <input
              type="text"
              value={modules[activeModule].title}
              onChange={(e) => handleModuleChange(activeModule, 'title', e.target.value)}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
              placeholder="Enter module title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={modules[activeModule].description}
              onChange={(e) => handleModuleChange(activeModule, 'description', e.target.value)}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
              placeholder="Enter module description"
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
                value={modules[activeModule].duration}
                onChange={(e) => handleModuleChange(activeModule, 'duration', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
                placeholder="Enter duration in minutes"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Module Content
            </label>
            <textarea
              value={modules[activeModule].content}
              onChange={(e) => handleModuleChange(activeModule, 'content', e.target.value)}
              rows={10}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
              placeholder="Enter module content (supports markdown)"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-300">
                Practice Questions
              </label>
              <button
                onClick={() => setShowQuestionForm(true)}
                className="btn-secondary text-sm py-1.5 px-3"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Question
              </button>
            </div>

            {modules[activeModule].questions.length > 0 ? (
              <div className="space-y-4">
                {modules[activeModule].questions.map((q, qIndex) => (
                  <div 
                    key={qIndex}
                    className="p-4 bg-dark-300/50 rounded-lg border border-primary-500/10"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <HelpCircle className="h-4 w-4 text-primary-400 flex-shrink-0" />
                          <p className="font-medium text-gray-200">{q.question}</p>
                        </div>
                        <div className="mt-2 ml-6 space-y-1">
                          {q.options.map((option, oIndex) => (
                            <div 
                              key={oIndex}
                              className="flex items-center space-x-2"
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                oIndex === q.correctAnswer 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                  : 'bg-dark-400/50 text-gray-400 border border-gray-500/30'
                              }`}>
                                {String.fromCharCode(65 + oIndex)}
                              </span>
                              <span className={`text-sm ${
                                oIndex === q.correctAnswer ? 'text-emerald-300' : 'text-gray-400'
                              }`}>
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 ml-6 text-sm text-gray-400 flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-primary-400" />
                          <span>{q.duration} seconds</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-dark-300/50 rounded-lg border border-primary-500/10 text-center">
                <FileText className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">No questions added yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Add practice questions to test knowledge after this module
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-200 rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                <GradientText>Add Practice Question</GradientText>
              </h2>
              <button 
                onClick={() => {
                  setShowQuestionForm(false);
                  setError(null);
                }}
                className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question
                </label>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) => handleQuestionChange('question', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter your question"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (seconds)
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary-400" />
                  <input
                    type="number"
                    min="10"
                    value={currentQuestion.duration}
                    onChange={(e) => handleQuestionChange('duration', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                             text-gray-300 focus:border-primary-500/40 focus:outline-none"
                    placeholder="Time allowed for this question (in seconds)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Options
                </label>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <span className="w-6 h-6 rounded-full bg-dark-400/50 flex items-center justify-center text-sm text-gray-400 border border-gray-500/30">
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleQuestionChange('options', e.target.value, index)}
                        className="flex-1 px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                 text-gray-300 focus:border-primary-500/40 focus:outline-none"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                      <div className="flex-shrink-0">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => handleQuestionChange('correctAnswer', index)}
                          className="w-4 h-4 text-primary-500 bg-dark-400/50 border-gray-500/30 focus:ring-primary-500/40"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Select the radio button next to the correct answer
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <span className="text-red-200">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowQuestionForm(false);
                    setError(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={addQuestion}
                  className="btn-primary"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      <div className="flex justify-between">
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