import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { GradientText } from '../../../../components/ui/GradientText';
import { 
  ArrowLeft, 
  Cloud, 
  Key, 
  User, 
  ExternalLink, 
  Loader, 
  AlertCircle, 
  Check,
  Clock,
  Play,
  Square,
  FileText,
  Download,
  Send
} from 'lucide-react';

// Mock data for testing UI
const mockExercise = {
  id: 'exercise-3',
  title: 'Set Up a Build Project',
  description: 'Create and configure a build project in AWS CodeBuild',
  type: 'lab',
  order: 1,
  duration: 45,
  status: 'in-progress',
  instructions: `
    <h2>Setting Up a Build Project in AWS CodeBuild</h2>
    <p>In this exercise, you will create and configure a build project in AWS CodeBuild to automatically build your application.</p>
    
    <h3>Prerequisites</h3>
    <ul>
      <li>Your source code is stored in AWS CodeCommit</li>
      <li>You have a buildspec.yml file in your repository</li>
    </ul>
    
    <h3>Steps</h3>
    <ol>
      <li>
        <p><strong>Navigate to the AWS CodeBuild console</strong></p>
        <p>Open the AWS Management Console and navigate to the CodeBuild service.</p>
      </li>
      <li>
        <p><strong>Create a new build project</strong></p>
        <p>Click on "Create build project" and provide a name for your project.</p>
      </li>
      <li>
        <p><strong>Configure source provider</strong></p>
        <p>Select "AWS CodeCommit" as the source provider and choose your repository.</p>
      </li>
      <li>
        <p><strong>Configure environment</strong></p>
        <p>Choose a managed image that matches your application's requirements.</p>
      </li>
      <li>
        <p><strong>Configure buildspec</strong></p>
        <p>Use the buildspec.yml file in your repository.</p>
      </li>
      <li>
        <p><strong>Configure artifacts</strong></p>
        <p>Specify where to store the build output (e.g., S3 bucket).</p>
      </li>
      <li>
        <p><strong>Create the build project</strong></p>
        <p>Review your settings and click "Create build project".</p>
      </li>
      <li>
        <p><strong>Start a build</strong></p>
        <p>Click "Start build" to run your first build.</p>
      </li>
    </ol>
    
    <h3>Verification</h3>
    <p>Your build should complete successfully, and the artifacts should be stored in the specified location.</p>
  `
};

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
  credentials: {
    username: 'lab-user-456',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
  },
  consoleUrl: 'https://console.aws.amazon.com'
};

const mockResources = [
  {
    name: 'buildspec.yml Template',
    url: '#',
    type: 'file'
  },
  {
    name: 'CodeBuild Documentation',
    url: 'https://docs.aws.amazon.com/codebuild/',
    type: 'link'
  },
  {
    name: 'Sample Application Code',
    url: '#',
    type: 'file'
  }
];

export const LabExercisePage: React.FC = () => {
  const { exerciseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<any>({
    ...(location.state?.exercise || mockExercise),
    ...(location.state?.labExercise || {})
  });
  
  const [labDetails, setLabDetails] = useState<any>(location.state?.labDetails );
  const [moduleId, setModuleId] = useState<string | null>(location.state?.moduleId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [labStarted, setLabStarted] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [user, setUser] = useState<any>();
  const [resources, setResources] = useState<any[]>(mockResources);
  const [notes, setNotes] = useState('');

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start lab
  const handleStartLab = async () => {
    setIsStarting(true);
    setNotification(null);
    
    // Simulate API call
    setTimeout(() => {
      setLabStarted(true);
      setNotification({ type: 'success', message: 'Lab started successfully' });
      setCountdown(exercise.duration * 60); // Convert minutes to seconds
      setIsStarting(false);
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }, 1500);
  };

  // Stop lab
  const handleStopLab = async () => {
    setIsStopping(true);
    setNotification(null);
    
    // Simulate API call
    setTimeout(() => {
      setLabStarted(false);
      setNotification({ type: 'success', message: 'Lab stopped successfully' });
      setCountdown(null);
      setIsStopping(false);
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }, 1500);
  };

  // Submit exercise
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setNotification(null);
    
    // Simulate API call
    setTimeout(() => {
      setNotification({ type: 'success', message: 'Exercise submitted successfully' });
      
      // Navigate back after submission
      setTimeout(() => {
        navigate(`/dashboard/my-labs/${labDetails?.id}/modules`, {
          state: { labDetails }
        });
      }, 1500);
      
      setIsSubmitting(false);
    }, 1500);
  };

  // Countdown timer
  useEffect(() => {
    if (countdown === null || !labStarted) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown, labStarted]);

//function to extract the exact filename from the url
function extractFile_Name(filePath: string) {
  const match = filePath.match(/[^\\\/]+$/);
  return match ? match[0] : null;
}

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
        <p className="text-gray-400 mb-6">Unable to load the exercise details.</p>
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
              <GradientText>{exercise?.title || 'Lab Exercise'}</GradientText>
            </h1>
            <p className="mt-1 text-gray-400">{exercise?.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {countdown !== null && labStarted && (
            <div className="px-4 py-2 bg-dark-300/50 rounded-lg flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary-400" />
              <span className="text-sm font-mono text-gray-300">{formatTimeRemaining(countdown)}</span>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={labStarted ? handleStopLab : handleStartLab}
              disabled={isStarting || isStopping}
              className={`btn-primary ${
                labStarted ? 'bg-red-500 hover:bg-red-600' : ''
              }`}
            >
              {isStarting || isStopping ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : labStarted ? (
                <Square className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isStarting ? 'Starting...' : 
               isStopping ? 'Stopping...' : 
               labStarted ? 'Stop' : 'Start'}
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !labStarted}
              className="btn-secondary"
            >
              {isSubmitting ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit
            </button>
          </div>
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
        {/* Left Column - Instructions */}
        <div className="lg:col-span-2">
          <div className="glass-panel">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                <GradientText>Instructions</GradientText>
              </h2>
              <FileText className="h-5 w-5 text-primary-400" />
            </div>

            <div className="prose prose-invert prose-primary max-w-none">
              <div dangerouslySetInnerHTML={{ __html: exercise?.instructions || '<p>No instructions provided for this exercise.</p>' }} />
            </div>
            
            {exercise.files.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <div className="space-y-2">
                  {exercise.files.map((resource, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-dark-300/50 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-primary-400" />
                        <span className="text-sm text-gray-300">{extractFile_Name(resource)}</span>
                      </div>
                      <a
                        href={`http://localhost:3006/uploads/${extractFile_Name(resource)}`}
                        download
                        target= '_blank' 
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4 text-primary-400" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes or observations here..."
                className="w-full h-32 px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none resize-none"
              />
            </div> */}
          </div>
        </div>

        {/* Right Column - Credentials & Actions */}
        <div className="space-y-6">
          <div className="glass-panel">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText>Access Credentials</GradientText>
            </h2>
            
            <div className="space-y-4">
              <div className="p-3 bg-dark-300/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Username</span>
                  <User className="h-4 w-4 text-primary-400" />
                </div>
                <p className="text-sm font-mono bg-dark-400/50 p-2 rounded border border-primary-500/10 text-gray-300">
                  {labDetails?.credentials?.username || 'Not available'}
                </p>
              </div>
              
              <div className="p-3 bg-dark-300/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Access Key ID</span>
                  <Key className="h-4 w-4 text-primary-400" />
                </div>
                <p className="text-sm font-mono bg-dark-400/50 p-2 rounded border border-primary-500/10 text-gray-300">
                  {labDetails?.credentials?.accessKeyId || 'Not available'}
                </p>
              </div>
              
              <div className="p-3 bg-dark-300/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Secret Access Key</span>
                  <Key className="h-4 w-4 text-primary-400" />
                </div>
                <p className="text-sm font-mono bg-dark-400/50 p-2 rounded border border-primary-500/10 text-gray-300">
                  {labDetails?.credentials?.secretAccessKey || 'Not available'}
                </p>
              </div>
            </div>
          </div>
          
          {labStarted && labDetails?.consoleUrl && (
            <button
              onClick={() => window.open(labDetails.consoleUrl, '_blank')}
              className="btn-secondary w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open AWS Console
            </button>
          )}
          
          <div className="glass-panel">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText>Services</GradientText>
            </h2>
            
            <div className="space-y-2">
              {exercise?.services && exercise.services.length > 0 ? (
                exercise.services.map((service: string, index: number) => (
                  <div 
                    key={index}
                    className="p-3 bg-dark-300/50 rounded-lg flex items-center space-x-2"
                  >
                    <Cloud className="h-4 w-4 text-primary-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300 truncate">{service}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-2">
                  No services specified
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};