import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { GradientText } from '../../../../components/ui/GradientText';
import { 
  ArrowLeft, 
  Cloud, 
  Clock, 
  Layers, 
  ChevronRight,
  AlertCircle,
  Check,
  Loader,
  BookOpen,
  HelpCircle
} from 'lucide-react';

// Mock data for testing UI
const mockLabDetails = {
  id: 'lab-456',
  title: 'AWS DevOps Pipeline Lab',
  description: 'Learn to build and deploy a complete CI/CD pipeline using AWS services',
  provider: 'aws',
  region: 'us-west-2',
  services: [
    'CodeCommit', 
    'CodeBuild', 
    'CodeDeploy', 
    'CodePipeline', 
    'EC2', 
    'S3', 
    'CloudFormation'
  ],
  status: 'active',
  startDate: '2024-04-01T00:00:00Z',
  endDate: '2024-05-01T00:00:00Z',
  credentials: {
    username: 'lab-user-456',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
  },
  consoleUrl: 'https://console.aws.amazon.com'
};

const mockModules = [
  {
    id: 'module-1',
    title: 'Source Control with CodeCommit',
    description: 'Set up a Git repository in AWS CodeCommit and manage your code',
    order: 1,
    exercises: [
      {
        id: 'exercise-1',
        title: 'Create a CodeCommit Repository',
        description: 'Learn to create and configure a Git repository in AWS CodeCommit',
        type: 'lab',
        order: 1,
        duration: 30,
        status: 'completed'
      },
      {
        id: 'exercise-2',
        title: 'Git Basics Quiz',
        description: 'Test your knowledge of Git fundamentals',
        type: 'quiz',
        order: 2,
        duration: 15,
        status: 'completed'
      }
    ]
  },
  {
    id: 'module-2',
    title: 'Build Automation with CodeBuild',
    description: 'Configure automated builds for your application',
    order: 2,
    exercises: [
      {
        id: 'exercise-3',
        title: 'Set Up a Build Project',
        description: 'Create and configure a build project in AWS CodeBuild',
        type: 'lab',
        order: 1,
        duration: 45,
        status: 'in-progress'
      },
      {
        id: 'exercise-4',
        title: 'Create a buildspec.yml File',
        description: 'Define your build process using a buildspec.yml file',
        type: 'lab',
        order: 2,
        duration: 30,
        status: 'not-started'
      }
    ]
  },
  {
    id: 'module-3',
    title: 'Deployment with CodeDeploy',
    description: 'Learn to deploy applications to EC2 instances',
    order: 3,
    exercises: [
      {
        id: 'exercise-5',
        title: 'Configure CodeDeploy',
        description: 'Set up CodeDeploy to deploy your application',
        type: 'lab',
        order: 1,
        duration: 60,
        status: 'not-started'
      },
      {
        id: 'exercise-6',
        title: 'Deployment Strategies Quiz',
        description: 'Test your knowledge of different deployment strategies',
        type: 'quiz',
        order: 2,
        duration: 20,
        status: 'not-started'
      }
    ]
  }
];

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
  description: string;
  type: 'lab' | 'questions';
  order: number;
  duration: number;
  status?: 'not-started' | 'in-progress' | 'completed';
}

export const ModularLabPage: React.FC = () => {
  const { labId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [labDetails, setLabDetails] = useState<any>(location.state?.labDetails || mockLabDetails);
  const [modules, setModules] = useState<Module[]>(mockModules);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [user, setUser] = useState<any>({ id: 'user-123', name: 'Test User' });
  const [activeModuleId, setActiveModuleId] = useState<string | null>('module-1');

  // Calculate total duration
  const totalDuration = modules.reduce((total, module) => {
    return total + module.exercises.reduce((moduleTotal, exercise) => {
      return moduleTotal + exercise.duration;
    }, 0);
  }, 0);

  // Format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleExerciseClick = (moduleId: string, exercise: Exercise) => {
    if (exercise.type === 'lab') {
      navigate(`/dashboard/my-labs/${labId}/exercise/${exercise.id}`, {
        state: { 
          exercise,
          labDetails,
          moduleId
        }
      });
    } else if (exercise.type === 'questions') {
      navigate(`/dashboard/my-labs/${labId}/quiz/${exercise.id}`, {
        state: { 
          exercise,
          labDetails,
          moduleId
        }
      });
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
        <p className="text-gray-400 mb-6">Unable to load the lab details.</p>
        <button 
          onClick={() => navigate('/dashboard/my-labs')}
          className="btn-secondary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Labs
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
            onClick={() => navigate('/dashboard/my-labs')}
            className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold">
              <GradientText>{labDetails?.title || 'Modular Lab'}</GradientText>
            </h1>
            <p className="mt-1 text-gray-400">{labDetails?.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-dark-300/50 rounded-lg flex items-center space-x-2">
            <Clock className="h-4 w-4 text-primary-400" />
            <span className="text-sm text-gray-300">Total: {formatDuration(totalDuration)}</span>
          </div>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
            {labDetails?.provider?.toUpperCase()}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Module List */}
        <div className="glass-panel">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              <GradientText>Modules</GradientText>
            </h2>
            <Layers className="h-5 w-5 text-primary-400" />
          </div>

          <div className="space-y-4">
            {modules.map((module, index) => (
              <div key={module.id} className="space-y-2">
                <button
                  onClick={() => setActiveModuleId(module.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeModuleId === module.id 
                      ? 'bg-primary-500/20 text-primary-300' 
                      : 'bg-dark-300/50 text-gray-300 hover:bg-dark-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-dark-400/80 flex items-center justify-center mr-3">
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                    <span className="font-medium">{module.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Module Exercises */}
        <div className="lg:col-span-3 glass-panel">
          {activeModuleId ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">
                  <GradientText>
                    {modules.find(m => m.id === activeModuleId)?.title || 'Module Exercises'}
                  </GradientText>
                </h2>
                <p className="mt-2 text-gray-400">
                  {modules.find(m => m.id === activeModuleId)?.description}
                </p>
              </div>

              <div className="space-y-4">
                {modules.find(m => m.id === activeModuleId)?.exercises.map((exercise, index) => (
                  <div 
                    key={index}
                    onClick={() => handleExerciseClick(activeModuleId, exercise)}
                    className="p-4 bg-dark-300/50 rounded-lg hover:bg-dark-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {exercise.type === 'lab' ? (
                          <BookOpen className="h-5 w-5 text-primary-400" />
                        ) : (
                          <HelpCircle className="h-5 w-5 text-accent-400" />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-200">{exercise.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">{exercise.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center text-sm text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(exercise.duration)}
                        </div>
                        {exercise.status && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            exercise.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                            exercise.status === 'in-progress' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-primary-500/20 text-primary-300'
                          }`}>
                            {exercise.status === 'not-started' ? 'Not Started' : 
                             exercise.status === 'in-progress' ? 'In Progress' : 
                             'Completed'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <Layers className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-400">Select a module to view its exercises</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};