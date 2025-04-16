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
import axios from 'axios';

export const LabExercisePage: React.FC = () => {
  const { exerciseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [exercise, setExercise] = useState<any>(location.state?.exercise || null);
  const [labDetails, setLabDetails] = useState<any>(location.state?.labDetails || null);
  const [moduleId, setModuleId] = useState<string | null>(location.state?.moduleId || null);
  const [isLoading, setIsLoading] = useState(!location.state?.exercise);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [labStarted, setLabStarted] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [notes, setNotes] = useState('');

  // Fetch user and exercise details
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/user_ms/user_profile');
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchUserProfile();

    if (!exercise && exerciseId) {
      const fetchExerciseDetails = async () => {
        setIsLoading(true);
        try {
          const response = await axios.post(`http://localhost:3000/api/v1/cloud_slice_ms/getExerciseDetails/${exerciseId}`);
          if (response.data.success) {
            setExercise(response.data.data.exercise);
            setLabDetails(response.data.data.labDetails);
            setModuleId(response.data.data.moduleId);
            setResources(response.data.data.resources || []);
            
            // Check if lab is already started
            const statusResponse = await axios.post('http://localhost:3000/api/v1/cloud_slice_ms/checkExerciseStatus', {
              exercise_id: exerciseId,
              user_id: user?.id
            });
            
            if (statusResponse.data.success) {
              setLabStarted(statusResponse.data.isRunning);
              if (statusResponse.data.isRunning && statusResponse.data.timeRemaining) {
                setCountdown(statusResponse.data.timeRemaining);
              }
            }
          } else {
            setError('Failed to load exercise details');
          }
        } catch (err) {
          setError('Failed to load exercise details');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchExerciseDetails();
    } else if (exercise) {
      // Initialize countdown if exercise has duration
      if (exercise.duration) {
        setCountdown(exercise.duration * 60); // Convert minutes to seconds
      }
      
      // Fetch resources
      const fetchResources = async () => {
        try {
          const response = await axios.post(`http://localhost:3000/api/v1/cloud_slice_ms/getExerciseResources/${exerciseId}`);
          if (response.data.success) {
            setResources(response.data.data || []);
          }
        } catch (err) {
          console.error('Failed to fetch resources:', err);
        }
      };
      
      fetchResources();
    }
  }, [exerciseId, exercise, user?.id]);

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
    
    try {
      const response = await axios.post('http://localhost:3000/api/v1/cloud_slice_ms/startExercise', {
        exercise_id: exerciseId,
        user_id: user?.id,
        module_id: moduleId,
        lab_id: labDetails?.id
      });
      
      if (response.data.success) {
        setLabStarted(true);
        setNotification({ type: 'success', message: 'Lab started successfully' });
        
        // Open AWS Console
        if (response.data.consoleUrl) {
          window.open(response.data.consoleUrl, '_blank');
        }
        
        // Set countdown timer if duration is provided
        if (exercise.duration) {
          setCountdown(exercise.duration * 60); // Convert minutes to seconds
        }
      } else {
        throw new Error(response.data.message || 'Failed to start lab');
      }
    } catch (err: any) {
      setNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to start lab' 
      });
    } finally {
      setIsStarting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Stop lab
  const handleStopLab = async () => {
    setIsStopping(true);
    setNotification(null);
    
    try {
      const response = await axios.post('http://localhost:3000/api/v1/cloud_slice_ms/stopExercise', {
        exercise_id: exerciseId,
        user_id: user?.id
      });
      
      if (response.data.success) {
        setLabStarted(false);
        setNotification({ type: 'success', message: 'Lab stopped successfully' });
        setCountdown(null);
      } else {
        throw new Error(response.data.message || 'Failed to stop lab');
      }
    } catch (err: any) {
      setNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to stop lab' 
      });
    } finally {
      setIsStopping(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Submit exercise
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setNotification(null);
    
    try {
      const response = await axios.post('http://localhost:3000/api/v1/cloud_slice_ms/submitExercise', {
        exercise_id: exerciseId,
        user_id: user?.id,
        notes: notes
      });
      
      if (response.data.success) {
        setNotification({ type: 'success', message: 'Exercise submitted successfully' });
        setTimeout(() => {
          navigate(`/dashboard/my-labs/${labDetails?.id}/modules`, {
            state: { labDetails }
          });
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to submit exercise');
      }
    } catch (err: any) {
      setNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to submit exercise' 
      });
    } finally {
      setIsSubmitting(false);
    }
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
            
            {resources.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <div className="space-y-2">
                  {resources.map((resource, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-dark-300/50 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-primary-400" />
                        <span className="text-sm text-gray-300">{resource.name}</span>
                      </div>
                      <a
                        href={resource.url}
                        download
                        className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4 text-primary-400" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes or observations here..."
                className="w-full h-32 px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none resize-none"
              />
            </div>
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
              {labDetails?.services && labDetails.services.length > 0 ? (
                labDetails.services.map((service: string, index: number) => (
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