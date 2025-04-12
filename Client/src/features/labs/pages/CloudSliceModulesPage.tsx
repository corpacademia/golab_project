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
  X,
  PenTool,
  Eye
} from 'lucide-react';
import axios from 'axios';

interface Module {
  id: string;
  title: string;
  description: string;
  exerciseCount?: number;
}

interface Exercise {
  id: string;
  moduleId: string;
  title: string;
  type: 'lab' | 'quiz';
  content?: string;
}

interface LabExercise {
  id: string;
  content: string;
  services?: string[];
}

interface QuizQuestion {
  id: string;
  exerciseId: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const CloudSliceModulesPage: React.FC = () => {
  const location = useLocation();
  const { sliceId } = useParams();
  const navigate = useNavigate();
  
  // Basic state
  const [sliceDetails, setSliceDetails] = useState<any>(location.state?.sliceDetails || null);
  const [isLoading, setIsLoading] = useState(!location.state?.sliceDetails);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Data state - each entity has its own state
  const [modules, setModules] = useState<Module[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [labContent, setLabContent] = useState<LabExercise | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'modules' | 'exercises' | 'lab' | 'quiz'>('modules');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [isEditingExercise, setIsEditingExercise] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  
  // Loading states for each data type
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isLoadingLabContent, setIsLoadingLabContent] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  
  // Data loaded flags to prevent errors
  const [modulesLoaded, setModulesLoaded] = useState(false);
  const [exercisesLoaded, setExercisesLoaded] = useState(false);
  const [labContentLoaded, setLabContentLoaded] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);

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

  // Fetch modules - separate API call
  useEffect(() => {
    if (sliceId) {
      const fetchModules = async () => {
        setIsLoadingModules(true);
        try {
          // For development, using mock data until API is ready
          // In production, this would be a real API call
          // const response = await axios.get(`http://localhost:3000/api/v1/cloud_slice_ms/getModules/${sliceId}`);
          
          // Mock data for development
          const mockModules: Module[] = [
            {
              id: '1',
              title: 'Introduction to AWS',
              description: 'Learn the basics of AWS cloud services',
              exerciseCount: 3
            },
            {
              id: '2',
              title: 'EC2 and Networking',
              description: 'Working with EC2 instances and VPC',
              exerciseCount: 2
            },
            {
              id: '3',
              title: 'Storage Solutions',
              description: 'S3, EBS, and other storage options',
              exerciseCount: 2
            }
          ];
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setModules(mockModules);
          setModulesLoaded(true);
        } catch (err) {
          console.error('Failed to fetch modules:', err);
          // Set empty array to prevent errors
          setModules([]);
          setModulesLoaded(true);
        } finally {
          setIsLoadingModules(false);
        }
      };
      
      fetchModules();
    }
  }, [sliceId]);

  // Fetch exercises when a module is selected - separate API call
  useEffect(() => {
    if (selectedModuleId && modulesLoaded) {
      const fetchExercises = async () => {
        setIsLoadingExercises(true);
        setExercisesLoaded(false);
        try {
          // For development, using mock data until API is ready
          // const response = await axios.get(`http://localhost:3000/api/v1/cloud_slice_ms/getExercises/${selectedModuleId}`);
          
          // Mock data for development
          const mockExercises: Exercise[] = [
            {
              id: '101',
              moduleId: selectedModuleId,
              title: 'Setting up EC2 Instances',
              type: 'lab'
            },
            {
              id: '102',
              moduleId: selectedModuleId,
              title: 'Understanding VPC Configuration',
              type: 'quiz'
            }
          ];
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          setExercises(mockExercises);
          setExercisesLoaded(true);
        } catch (err) {
          console.error('Failed to fetch exercises:', err);
          // Set empty array to prevent errors
          setExercises([]);
          setExercisesLoaded(true);
        } finally {
          setIsLoadingExercises(false);
        }
      };
      
      fetchExercises();
    } else {
      setExercises([]);
      setExercisesLoaded(true);
    }
  }, [selectedModuleId, modulesLoaded]);

  // Fetch lab content when a lab exercise is selected - separate API call
  useEffect(() => {
    if (selectedExerciseId && exercisesLoaded) {
      const selectedExercise = exercises.find(ex => ex.id === selectedExerciseId);
      
      if (selectedExercise?.type === 'lab') {
        const fetchLabContent = async () => {
          setIsLoadingLabContent(true);
          setLabContentLoaded(false);
          try {
            // For development, using mock data until API is ready
            // const response = await axios.get(`http://localhost:3000/api/v1/cloud_slice_ms/getLabContent/${selectedExerciseId}`);
            
            // Mock data for development
            const mockLabContent: LabExercise = {
              id: selectedExerciseId,
              content: '<h2>EC2 Lab Instructions</h2><p>In this lab, you will learn how to launch and configure an EC2 instance.</p><ol><li>Navigate to the EC2 dashboard</li><li>Click "Launch Instance"</li><li>Select an Amazon Machine Image (AMI)</li><li>Choose an instance type</li><li>Configure instance details</li><li>Add storage</li><li>Configure security group</li><li>Review and launch</li></ol>',
              services: ['EC2', 'VPC', 'Security Groups', 'EBS']
            };
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 600));
            
            setLabContent(mockLabContent);
            setLabContentLoaded(true);
          } catch (err) {
            console.error('Failed to fetch lab content:', err);
            // Set null to prevent errors
            setLabContent(null);
            setLabContentLoaded(true);
          } finally {
            setIsLoadingLabContent(false);
          }
        };
        
        fetchLabContent();
      } else if (selectedExercise?.type === 'quiz') {
        const fetchQuizQuestions = async () => {
          setIsLoadingQuestions(true);
          setQuestionsLoaded(false);
          try {
            // For development, using mock data until API is ready
            // const response = await axios.get(`http://localhost:3000/api/v1/cloud_slice_ms/getQuizQuestions/${selectedExerciseId}`);
            
            // Mock data for development
            const mockQuizQuestions: QuizQuestion[] = [
              {
                id: 'q1',
                exerciseId: selectedExerciseId,
                question: 'What is the primary purpose of Amazon VPC?',
                options: [
                  'To store objects in the cloud',
                  'To provide isolated network environments',
                  'To run serverless functions',
                  'To manage DNS records'
                ],
                correctAnswer: 1
              },
              {
                id: 'q2',
                exerciseId: selectedExerciseId,
                question: 'Which of the following is NOT a component of a VPC?',
                options: [
                  'Subnets',
                  'Route Tables',
                  'Lambda Functions',
                  'Security Groups'
                ],
                correctAnswer: 2
              }
            ];
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 700));
            
            setQuizQuestions(mockQuizQuestions);
            setQuestionsLoaded(true);
          } catch (err) {
            console.error('Failed to fetch quiz questions:', err);
            // Set empty array to prevent errors
            setQuizQuestions([]);
            setQuestionsLoaded(true);
          } finally {
            setIsLoadingQuestions(false);
          }
        };
        
        fetchQuizQuestions();
      }
    } else {
      setLabContent(null);
      setLabContentLoaded(true);
      setQuizQuestions([]);
      setQuestionsLoaded(true);
    }
  }, [selectedExerciseId, exercises, exercisesLoaded]);

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedExerciseId(null);
    setActiveTab('exercises');
  };

  const handleExerciseSelect = (exerciseId: string) => {
    if (!exercisesLoaded) return;
    
    const selectedExercise = exercises.find(ex => ex.id === exerciseId);
    if (!selectedExercise) return;
    
    setSelectedExerciseId(exerciseId);
    
    if (selectedExercise.type === 'lab') {
      setActiveTab('lab');
    } else if (selectedExercise.type === 'quiz') {
      setActiveTab('quiz');
    }
  };

  const handleEditExercise = () => {
    setIsEditingExercise(true);
  };

  const handleSaveLabContent = async () => {
    if (!selectedExerciseId || !labContent) return;
    
    setIsSaving(true);
    setNotification(null);
    
    try {
      // For development, simulate API call
      // const response = await axios.post(`http://localhost:3000/api/v1/cloud_slice_ms/updateLabContent/${selectedExerciseId}`, {
      //   content: labContent.content,
      //   services: labContent.services
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotification({ type: 'success', message: 'Lab content updated successfully' });
      setIsEditingExercise(false);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to update lab content' 
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveQuizQuestions = async () => {
    if (!selectedExerciseId) return;
    
    setIsSaving(true);
    setNotification(null);
    
    try {
      // For development, simulate API call
      // const response = await axios.post(`http://localhost:3000/api/v1/cloud_slice_ms/updateQuizQuestions/${selectedExerciseId}`, {
      //   questions: quizQuestions
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotification({ type: 'success', message: 'Quiz questions updated successfully' });
      setIsEditingExercise(false);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to update quiz questions' 
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuestion = () => {
    if (!selectedExerciseId) return;
    
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      exerciseId: selectedExerciseId,
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

  // Get the selected module and exercise objects
  // Only access these if the data is loaded to prevent errors
  const selectedModule = modulesLoaded ? modules.find(m => m.id === selectedModuleId) : undefined;
  const selectedExercise = exercisesLoaded ? exercises.find(e => e.id === selectedExerciseId) : undefined;

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

      {/* Navigation Tabs */}
      <div className="border-b border-primary-500/10">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm
              ${activeTab === 'modules'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-primary-500/50'
              }`}
          >
            <List className="h-4 w-4 mr-2" />
            Modules
          </button>
          {selectedModuleId && (
            <button
              onClick={() => setActiveTab('exercises')}
              className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm
                ${activeTab === 'exercises'
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-primary-500/50'
                }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Exercises
            </button>
          )}
          {selectedExerciseId && selectedExercise?.type === 'lab' && (
            <button
              onClick={() => setActiveTab('lab')}
              className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm
                ${activeTab === 'lab'
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-primary-500/50'
                }`}
            >
              <Server className="h-4 w-4 mr-2" />
              Lab Content
            </button>
          )}
          {selectedExerciseId && selectedExercise?.type === 'quiz' && (
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm
                ${activeTab === 'quiz'
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-primary-500/50'
                }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Quiz Questions
            </button>
          )}
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="glass-panel">
        {/* MODULES TABLE */}
        {activeTab === 'modules' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                <GradientText>Modules</GradientText>
              </h2>
              <button className="btn-secondary text-sm py-1.5 px-3">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Module
              </button>
            </div>
            
            {isLoadingModules ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="h-6 w-6 text-primary-400 animate-spin" />
                <span className="ml-3 text-gray-400">Loading modules...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-400 border-b border-primary-500/10">
                      <th className="pb-4 pl-4">Module Title</th>
                      <th className="pb-4">Description</th>
                      <th className="pb-4">Exercises</th>
                      <th className="pb-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400">
                          No modules found for this cloud slice.
                        </td>
                      </tr>
                    ) : (
                      modules.map((module) => (
                        <tr 
                          key={module.id}
                          className="border-b border-primary-500/10 hover:bg-dark-300/50 transition-colors cursor-pointer"
                          onClick={() => handleModuleSelect(module.id)}
                        >
                          <td className="py-4 pl-4">
                            <div className="flex items-center space-x-2">
                              <List className="h-4 w-4 text-primary-400" />
                              <span className="font-medium text-gray-200">{module.title}</span>
                            </div>
                          </td>
                          <td className="py-4 text-gray-400 max-w-xs truncate">{module.description}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
                              {module.exerciseCount || 0} exercise{(module.exerciseCount || 0) !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleModuleSelect(module.id);
                                }}
                                className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4 text-primary-400" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Edit module logic
                                }}
                                className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                              >
                                <Edit className="h-4 w-4 text-primary-400" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Delete module logic
                                }}
                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* EXERCISES TABLE */}
        {activeTab === 'exercises' && selectedModuleId && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  <GradientText>Exercises for {selectedModule?.title}</GradientText>
                </h2>
                <p className="text-sm text-gray-400 mt-1">{selectedModule?.description}</p>
              </div>
              <button className="btn-secondary text-sm py-1.5 px-3">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Exercise
              </button>
            </div>
            
            {isLoadingExercises ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="h-6 w-6 text-primary-400 animate-spin" />
                <span className="ml-3 text-gray-400">Loading exercises...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-400 border-b border-primary-500/10">
                      <th className="pb-4 pl-4">Exercise Title</th>
                      <th className="pb-4">Type</th>
                      <th className="pb-4">Content</th>
                      <th className="pb-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercises.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400">
                          No exercises found for this module.
                        </td>
                      </tr>
                    ) : (
                      exercises.map((exercise) => (
                        <tr 
                          key={exercise.id}
                          className="border-b border-primary-500/10 hover:bg-dark-300/50 transition-colors cursor-pointer"
                          onClick={() => handleExerciseSelect(exercise.id)}
                        >
                          <td className="py-4 pl-4">
                            <div className="flex items-center space-x-2">
                              {exercise.type === 'lab' ? (
                                <Server className="h-4 w-4 text-primary-400" />
                              ) : (
                                <FileText className="h-4 w-4 text-primary-400" />
                              )}
                              <span className="font-medium text-gray-200">{exercise.title}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              exercise.type === 'lab' 
                                ? 'bg-primary-500/20 text-primary-300'
                                : 'bg-secondary-500/20 text-secondary-300'
                            }`}>
                              {exercise.type === 'lab' ? 'Lab Exercise' : 'Quiz'}
                            </span>
                          </td>
                          <td className="py-4 text-gray-400">
                            {exercise.type === 'lab' 
                              ? 'Hands-on lab practice'
                              : 'Multiple choice questions'
                            }
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExerciseSelect(exercise.id);
                                }}
                                className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4 text-primary-400" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExerciseSelect(exercise.id);
                                  setIsEditingExercise(true);
                                }}
                                className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                              >
                                <Edit className="h-4 w-4 text-primary-400" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Delete exercise logic
                                }}
                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* LAB CONTENT TABLE */}
        {activeTab === 'lab' && selectedExerciseId && selectedExercise?.type === 'lab' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  <GradientText>Lab: {selectedExercise.title}</GradientText>
                </h2>
                <div className="flex items-center mt-1">
                  <Server className="h-4 w-4 mr-1 text-primary-400" />
                  <span className="text-sm text-gray-400">Lab Exercise</span>
                </div>
              </div>
              
              {isEditingExercise ? (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      setIsEditingExercise(false);
                    }}
                    className="btn-secondary text-sm py-1.5 px-3"
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveLabContent}
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
                  Edit Lab Content
                </button>
              )}
            </div>

            {isLoadingLabContent ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="h-6 w-6 text-primary-400 animate-spin" />
                <span className="ml-3 text-gray-400">Loading lab content...</span>
              </div>
            ) : (
              <>
                {isEditingExercise ? (
                  <textarea
                    value={labContent?.content || ''}
                    onChange={(e) => setLabContent(prev => ({ ...prev!, content: e.target.value }))}
                    className="w-full h-64 px-4 py-3 bg-dark-400/50 border border-primary-500/20 rounded-lg
                             text-gray-300 focus:border-primary-500/40 focus:outline-none
                             font-mono text-sm"
                  />
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <div 
                      className="p-4 bg-dark-300/50 rounded-lg text-gray-300"
                      dangerouslySetInnerHTML={{ __html: labContent?.content || 'No content available' }}
                    />
                  </div>
                )}

                {/* Services used in this lab */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    <GradientText>Services Used</GradientText>
                  </h3>
                  
                  {labContent?.services && labContent.services.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {labContent.services.map((service, index) => (
                        <div 
                          key={index}
                          className="p-3 bg-dark-300/50 rounded-lg flex items-center space-x-2"
                        >
                          <Cloud className="h-4 w-4 text-primary-400 flex-shrink-0" />
                          <span className="text-sm text-gray-300 truncate">{service}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">
                      No specific services defined for this lab.
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* QUIZ QUESTIONS TABLE */}
        {activeTab === 'quiz' && selectedExerciseId && selectedExercise?.type === 'quiz' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  <GradientText>Quiz: {selectedExercise.title}</GradientText>
                </h2>
                <div className="flex items-center mt-1">
                  <FileText className="h-4 w-4 mr-1 text-primary-400" />
                  <span className="text-sm text-gray-400">Quiz Exercise</span>
                </div>
              </div>
              
              {isEditingExercise ? (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      setIsEditingExercise(false);
                    }}
                    className="btn-secondary text-sm py-1.5 px-3"
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveQuizQuestions}
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
                <div className="flex space-x-3">
                  <button 
                    onClick={handleEditExercise}
                    className="btn-secondary text-sm py-1.5 px-3"
                  >
                    <Edit className="h-4 w-4 mr-1.5" />
                    Edit Questions
                  </button>
                </div>
              )}
            </div>

            {isLoadingQuestions ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="h-6 w-6 text-primary-400 animate-spin" />
                <span className="ml-3 text-gray-400">Loading quiz questions...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-400 border-b border-primary-500/10">
                        <th className="pb-4 pl-4">Question</th>
                        <th className="pb-4">Options</th>
                        <th className="pb-4">Correct Answer</th>
                        <th className="pb-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizQuestions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-400">
                            No questions found for this quiz.
                          </td>
                        </tr>
                      ) : (
                        quizQuestions.map((question, index) => (
                          <tr 
                            key={question.id}
                            className="border-b border-primary-500/10 hover:bg-dark-300/50 transition-colors"
                          >
                            <td className="py-4 pl-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium bg-dark-400/50 px-2 py-1 rounded-full text-gray-400">
                                  Q{index + 1}
                                </span>
                                <span className="text-gray-300">{question.question}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex flex-wrap gap-2">
                                {question.options.map((option, optIndex) => (
                                  <span 
                                    key={optIndex} 
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      question.correctAnswer === optIndex
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-dark-400/50 text-gray-400'
                                    }`}
                                  >
                                    {option}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 text-emerald-300">
                              {question.options[question.correctAnswer]}
                            </td>
                            <td className="py-4">
                              {isEditingExercise && (
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => setEditingQuestion(question)}
                                    className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                                  >
                                    <PenTool className="h-4 w-4 text-primary-400" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {isEditingExercise && (
                  <div className="mt-6">
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
                )}
              </>
            )}

            {/* Question Editor Modal */}
            {editingQuestion && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-dark-200 rounded-lg w-full max-w-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">
                      <GradientText>Edit Question</GradientText>
                    </h3>
                    <button 
                      onClick={() => setEditingQuestion(null)}
                      className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Question
                      </label>
                      <input
                        type="text"
                        value={editingQuestion.question}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          question: e.target.value
                        })}
                        className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                 text-gray-300 focus:border-primary-500/40 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Options
                      </label>
                      <div className="space-y-3">
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
                              className="flex-1 px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
                              placeholder={`Option ${optIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setEditingQuestion(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateQuestion(editingQuestion)}
                      className="btn-primary"
                    >
                      Save Question
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
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