import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  Layers, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Award, 
  ChevronRight, 
  ChevronDown,
  AlertCircle,
  Loader
} from 'lucide-react';
import axios from 'axios';

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  title: string;
  type: 'lab' | 'quiz';
  description: string;
  order: number;
  duration: number;
}

interface LabExercise {
  id: string;
  exerciseId: string;
  instructions: string;
  resources: string[];
  tasks: {
    id: string;
    description: string;
    completed: boolean;
  }[];
}

interface QuizExercise {
  id: string;
  exerciseId: string;
  questions: {
    id: string;
    text: string;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
    }[];
  }[];
}

// Mock data for testing
const mockModules: Module[] = [
  {
    id: 'module-1',
    title: 'Introduction to AWS',
    description: 'Learn the basics of AWS cloud services and infrastructure',
    order: 1,
    duration: 60,
    exercises: [
      {
        id: 'exercise-1',
        title: 'AWS Console Overview',
        type: 'lab',
        description: 'Navigate and understand the AWS Management Console',
        order: 1,
        duration: 30
      },
      {
        id: 'exercise-2',
        title: 'AWS Services Quiz',
        type: 'quiz',
        description: 'Test your knowledge of core AWS services',
        order: 2,
        duration: 15
      }
    ]
  },
  {
    id: 'module-2',
    title: 'EC2 and Virtual Machines',
    description: 'Deep dive into EC2 instances and virtual machine management',
    order: 2,
    duration: 90,
    exercises: [
      {
        id: 'exercise-3',
        title: 'Launch an EC2 Instance',
        type: 'lab',
        description: 'Create and configure your first EC2 instance',
        order: 1,
        duration: 45
      },
      {
        id: 'exercise-4',
        title: 'EC2 Configuration Quiz',
        type: 'quiz',
        description: 'Test your knowledge of EC2 configuration options',
        order: 2,
        duration: 20
      }
    ]
  }
];

const mockLabExercises: Record<string, LabExercise> = {
  'exercise-1': {
    id: 'lab-1',
    exerciseId: 'exercise-1',
    instructions: 'In this lab, you will explore the AWS Management Console and learn how to navigate between different services. Follow the steps below to complete the lab.',
    resources: [
      'https://docs.aws.amazon.com/awsconsolehelpdocs/latest/gsg/getting-started.html',
      'https://aws.amazon.com/console/getting-started/'
    ],
    tasks: [
      {
        id: 'task-1',
        description: 'Log in to the AWS Management Console',
        completed: false
      },
      {
        id: 'task-2',
        description: 'Navigate to the EC2 service dashboard',
        completed: false
      },
      {
        id: 'task-3',
        description: 'Explore the S3 service dashboard',
        completed: false
      }
    ]
  },
  'exercise-3': {
    id: 'lab-2',
    exerciseId: 'exercise-3',
    instructions: 'In this lab, you will launch an EC2 instance and connect to it using SSH. You will also configure security groups and learn about instance types.',
    resources: [
      'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html',
      'https://aws.amazon.com/ec2/getting-started/'
    ],
    tasks: [
      {
        id: 'task-4',
        description: 'Launch a t2.micro EC2 instance with Amazon Linux 2',
        completed: false
      },
      {
        id: 'task-5',
        description: 'Configure security groups to allow SSH access',
        completed: false
      },
      {
        id: 'task-6',
        description: 'Connect to your instance using SSH',
        completed: false
      },
      {
        id: 'task-7',
        description: 'Install a web server and deploy a simple website',
        completed: false
      }
    ]
  }
};

const mockQuizExercises: Record<string, QuizExercise> = {
  'exercise-2': {
    id: 'quiz-1',
    exerciseId: 'exercise-2',
    questions: [
      {
        id: 'question-1',
        text: 'Which AWS service is used for object storage?',
        options: [
          { id: 'option-1', text: 'EC2', isCorrect: false },
          { id: 'option-2', text: 'S3', isCorrect: true },
          { id: 'option-3', text: 'RDS', isCorrect: false },
          { id: 'option-4', text: 'Lambda', isCorrect: false }
        ]
      },
      {
        id: 'question-2',
        text: 'Which AWS service is used for relational databases?',
        options: [
          { id: 'option-5', text: 'DynamoDB', isCorrect: false },
          { id: 'option-6', text: 'S3', isCorrect: false },
          { id: 'option-7', text: 'RDS', isCorrect: true },
          { id: 'option-8', text: 'SQS', isCorrect: false }
        ]
      }
    ]
  },
  'exercise-4': {
    id: 'quiz-2',
    exerciseId: 'exercise-4',
    questions: [
      {
        id: 'question-3',
        text: 'Which EC2 instance type is optimized for memory-intensive applications?',
        options: [
          { id: 'option-9', text: 'C5', isCorrect: false },
          { id: 'option-10', text: 'R5', isCorrect: true },
          { id: 'option-11', text: 'T3', isCorrect: false },
          { id: 'option-12', text: 'M5', isCorrect: false }
        ]
      },
      {
        id: 'question-4',
        text: 'What is the default tenancy model for EC2 instances?',
        options: [
          { id: 'option-13', text: 'Dedicated', isCorrect: false },
          { id: 'option-14', text: 'Reserved', isCorrect: false },
          { id: 'option-15', text: 'Shared', isCorrect: true },
          { id: 'option-16', text: 'Host', isCorrect: false }
        ]
      }
    ]
  }
};

export const CloudSliceModulesPage: React.FC = () => {
  const { sliceId } = useParams<{ sliceId: string }>();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [labExercises, setLabExercises] = useState<Record<string, LabExercise>>({});
  const [quizExercises, setQuizExercises] = useState<Record<string, QuizExercise>>({});
  
  // Loading states for each API call
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [isLoadingLabExercises, setIsLoadingLabExercises] = useState(false);
  const [isLoadingQuizExercises, setIsLoadingQuizExercises] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch modules
  useEffect(() => {
    const fetchModules = async () => {
      setIsLoadingModules(true);
      setError(null);
      try {
        // For development/testing, use mock data
        // In production, uncomment the API call below
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setModules(mockModules);
        if (mockModules.length > 0) {
          setActiveModule(mockModules[0].id);
        }
        
        /* Uncomment for real API call
        const response = await axios.get(`http://localhost:3000/api/v1/cloud_slice_ms/modules/${sliceId}`);
        if (response.data.success) {
          setModules(response.data.data || []);
          if (response.data.data && response.data.data.length > 0) {
            setActiveModule(response.data.data[0].id);
          }
        } else {
          throw new Error(response.data.message || 'Failed to fetch modules');
        }
        */
      } catch (err: any) {
        console.error('Error fetching modules:', err);
        setError(err.response?.data?.message || 'Failed to fetch modules');
        setModules([]);
      } finally {
        setIsLoadingModules(false);
      }
    };

    if (sliceId) {
      fetchModules();
    }
  }, [sliceId]);

  // Fetch lab exercises when a module is selected
  useEffect(() => {
    const fetchLabExercises = async () => {
      if (!activeModule) return;
      
      setIsLoadingLabExercises(true);
      try {
        // For development/testing, use mock data
        // In production, uncomment the API call below
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setLabExercises(mockLabExercises);
        
        /* Uncomment for real API call
        const response = await axios.get(`http://localhost:3000/api/v1/cloud_slice_ms/lab-exercises/${activeModule}`);
        if (response.data.success) {
          const labExercisesData = response.data.data || [];
          const labExercisesMap: Record<string, LabExercise> = {};
          
          labExercisesData.forEach((exercise: LabExercise) => {
            labExercisesMap[exercise.exerciseId] = exercise;
          });
          
          setLabExercises(labExercisesMap);
        }
        */
      } catch (err) {
        console.error('Error fetching lab exercises:', err);
      } finally {
        setIsLoadingLabExercises(false);
      }
    };

    fetchLabExercises();
  }, [activeModule]);

  // Fetch quiz exercises when a module is selected
  useEffect(() => {
    const fetchQuizExercises = async () => {
      if (!activeModule) return;
      
      setIsLoadingQuizExercises(true);
      try {
        // For development/testing, use mock data
        // In production, uncomment the API call below
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setQuizExercises(mockQuizExercises);
        
        /* Uncomment for real API call
        const response = await axios.get(`http://localhost:3000/api/v1/cloud_slice_ms/quiz-exercises/${activeModule}`);
        if (response.data.success) {
          const quizExercisesData = response.data.data || [];
          const quizExercisesMap: Record<string, QuizExercise> = {};
          
          quizExercisesData.forEach((exercise: QuizExercise) => {
            quizExercisesMap[exercise.exerciseId] = exercise;
          });
          
          setQuizExercises(quizExercisesMap);
        }
        */
      } catch (err) {
        console.error('Error fetching quiz exercises:', err);
      } finally {
        setIsLoadingQuizExercises(false);
      }
    };

    fetchQuizExercises();
  }, [activeModule]);

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(activeModule === moduleId ? null : moduleId);
    setActiveExercise(null);
  };

  const handleExerciseClick = (exerciseId: string) => {
    setActiveExercise(activeExercise === exerciseId ? null : exerciseId);
  };

  const getActiveModule = () => {
    if (!activeModule || !modules || modules.length === 0) return null;
    return modules.find(m => m.id === activeModule) || null;
  };

  const getActiveExercise = () => {
    const module = getActiveModule();
    if (!module || !activeExercise || !module.exercises) return null;
    return module.exercises.find(e => e.id === activeExercise) || null;
  };

  const renderExerciseContent = () => {
    const exercise = getActiveExercise();
    if (!exercise) return null;

    if (exercise.type === 'lab') {
      const labExercise = labExercises[exercise.id];
      if (!labExercise) {
        if (isLoadingLabExercises) {
          return (
            <div className="flex justify-center items-center h-64">
              <Loader className="h-8 w-8 text-primary-400 animate-spin" />
            </div>
          );
        }
        return (
          <div className="p-6 bg-dark-300/50 rounded-lg">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertCircle className="h-5 w-5" />
              <p>Lab exercise content not found</p>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="p-6 bg-dark-300/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Instructions</h3>
            <p className="text-gray-300">{labExercise.instructions}</p>
          </div>

          <div className="p-6 bg-dark-300/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {labExercise.resources?.map((resource, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-primary-400" />
                  <a href={resource} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
                    {resource}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-dark-300/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Tasks</h3>
            <div className="space-y-4">
              {labExercise.tasks?.map((task) => (
                <div key={task.id} className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {}}
                      className="h-5 w-5 rounded border-gray-500 text-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <p className="text-gray-300">{task.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (exercise.type === 'quiz') {
      const quizExercise = quizExercises[exercise.id];
      if (!quizExercise) {
        if (isLoadingQuizExercises) {
          return (
            <div className="flex justify-center items-center h-64">
              <Loader className="h-8 w-8 text-primary-400 animate-spin" />
            </div>
          );
        }
        return (
          <div className="p-6 bg-dark-300/50 rounded-lg">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertCircle className="h-5 w-5" />
              <p>Quiz exercise content not found</p>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {quizExercise.questions?.map((question, qIndex) => (
            <div key={question.id} className="p-6 bg-dark-300/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Question {qIndex + 1}</h3>
              <p className="text-gray-300 mb-4">{question.text}</p>
              
              <div className="space-y-3">
                {question.options?.map((option) => (
                  <div key={option.id} className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        className="h-5 w-5 border-gray-500 text-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    <p className="text-gray-300">{option.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button className="btn-primary">
              Submit Answers
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // Main loading state
  if (isLoadingModules) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 text-primary-400 animate-spin mr-3" />
        <span className="text-gray-300 text-lg">Loading modules...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass-panel">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-200 mb-2">
          {error}
        </h2>
        <p className="text-gray-400 text-center max-w-md">
          There was a problem loading the module content. Please try again later or contact support.
        </p>
      </div>
    );
  }

  // Empty state
  if (!modules || modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass-panel">
        <Layers className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-200 mb-2">
          No Modules Available
        </h2>
        <p className="text-gray-400 text-center max-w-md">
          This cloud slice doesn't have any learning modules yet. Check back later or contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold">
          <GradientText>Learning Modules</GradientText>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Modules Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-panel">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText>Module List</GradientText>
            </h2>
            <div className="space-y-2">
              {modules.map((module) => (
                <div key={module.id} className="space-y-2">
                  <button
                    onClick={() => handleModuleClick(module.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      activeModule === module.id
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'bg-dark-300/50 text-gray-300 hover:bg-dark-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Layers className="h-5 w-5" />
                      <span className="font-medium">{module.title}</span>
                    </div>
                    {activeModule === module.id ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>

                  {activeModule === module.id && module.exercises && (
                    <div className="ml-6 space-y-1">
                      {module.exercises.map((exercise) => (
                        <button
                          key={exercise.id}
                          onClick={() => handleExerciseClick(exercise.id)}
                          className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left text-sm transition-colors ${
                            activeExercise === exercise.id
                              ? 'bg-primary-500/10 text-primary-300'
                              : 'text-gray-400 hover:bg-dark-300/70 hover:text-gray-300'
                          }`}
                        >
                          {exercise.type === 'lab' ? (
                            <BookOpen className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <Award className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="truncate">{exercise.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeExercise ? (
            <div className="glass-panel">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  <GradientText>
                    {getActiveExercise()?.title || 'Exercise'}
                  </GradientText>
                </h2>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{getActiveExercise()?.duration || 0} minutes</span>
                </div>
              </div>

              {renderExerciseContent()}
            </div>
          ) : activeModule ? (
            <div className="glass-panel">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  <GradientText>
                    {getActiveModule()?.title || 'Module Overview'}
                  </GradientText>
                </h2>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{getActiveModule()?.duration || 0} minutes</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-dark-300/50 rounded-lg">
                  <p className="text-gray-300">{getActiveModule()?.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Exercises</h3>
                  <div className="space-y-4">
                    {getActiveModule()?.exercises?.map((exercise) => (
                      <div
                        key={exercise.id}
                        onClick={() => handleExerciseClick(exercise.id)}
                        className="p-4 bg-dark-300/50 rounded-lg hover:bg-dark-300 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {exercise.type === 'lab' ? (
                              <BookOpen className="h-5 w-5 text-primary-400" />
                            ) : (
                              <Award className="h-5 w-5 text-primary-400" />
                            )}
                            <div>
                              <h4 className="font-medium text-gray-200">{exercise.title}</h4>
                              <p className="text-sm text-gray-400">{exercise.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1 text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{exercise.duration} min</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel flex flex-col items-center justify-center py-12">
              <Layers className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-200 mb-2">
                Select a Module
              </h2>
              <p className="text-gray-400 text-center max-w-md">
                Choose a module from the sidebar to view its content and exercises.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};