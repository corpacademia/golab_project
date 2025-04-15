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
  ChevronRight,
  ChevronDown,
  Check,
  Loader,
  AlertCircle,
  BookOpen,
  Code,
  FileText,
  Terminal
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
  description: string;
  order: number;
  content: string;
  services: string[];
}

export const CloudSliceModulesPage: React.FC = () => {
  const location = useLocation();
  const { sliceId } = useParams();
  const navigate = useNavigate();
  
  const [sliceDetails, setSliceDetails] = useState<any>(location.state?.sliceDetails || null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(!location.state?.sliceDetails);
  const [error, setError] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

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

  // Fetch modules for this cloud slice
  useEffect(() => {
    if (sliceId) {
      const fetchModules = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/api/v1/cloud_slice_ms/getModules/${sliceId}`);
          if (response.data.success) {
            const sortedModules = response.data.data.sort((a: Module, b: Module) => a.order - b.order);
            
            // Sort exercises within each module
            sortedModules.forEach(module => {
              if (module.exercises) {
                module.exercises.sort((a: Exercise, b: Exercise) => a.order - b.order);
              }
            });
            
            setModules(sortedModules);
            
            // Set first module and exercise as active by default
            if (sortedModules.length > 0) {
              setActiveModuleId(sortedModules[0].id);
              setExpandedModules({ [sortedModules[0].id]: true });
              
              if (sortedModules[0].exercises && sortedModules[0].exercises.length > 0) {
                setActiveExerciseId(sortedModules[0].exercises[0].id);
              }
            }
          } else {
            setError('Failed to load modules');
          }
        } catch (err) {
          setError('Failed to load modules');
        }
      };
      
      fetchModules();
    }
  }, [sliceId]);

  const handleModuleClick = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
    
    setActiveModuleId(moduleId);
    
    // Set first exercise as active when opening a module
    const module = modules.find(m => m.id === moduleId);
    if (module && module.exercises && module.exercises.length > 0 && !expandedModules[moduleId]) {
      setActiveExerciseId(module.exercises[0].id);
    }
  };

  const handleExerciseClick = (exerciseId: string) => {
    setActiveExerciseId(exerciseId);
  };

  const getActiveExercise = () => {
    if (!activeModuleId || !activeExerciseId) return null;
    
    const module = modules.find(m => m.id === activeModuleId);
    if (!module) return null;
    
    return module.exercises.find(e => e.id === activeExerciseId);
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
        <p className="text-gray-400 mb-6">Unable to load the cloud slice modules.</p>
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

  const activeExercise = getActiveExercise();

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
              <GradientText>{sliceDetails?.title || 'Cloud Slice Lab'}</GradientText>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Module Navigation */}
        <div className="lg:col-span-1">
          <div className="glass-panel">
            <h2 className="text-lg font-semibold mb-4">
              <GradientText>Modules</GradientText>
            </h2>
            <div className="space-y-2">
              {modules.map(module => (
                <div key={module.id} className="space-y-1">
                  <button
                    onClick={() => handleModuleClick(module.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left ${
                      activeModuleId === module.id
                        ? 'bg-primary-500/15 text-primary-400'
                        : 'bg-dark-300/50 text-gray-300 hover:bg-dark-300 hover:text-gray-200'
                    } transition-colors`}
                  >
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium">{module.title}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      expandedModules[module.id] ? 'transform rotate-180' : ''
                    }`} />
                  </button>
                  
                  {expandedModules[module.id] && module.exercises && (
                    <div className="ml-6 space-y-1 mt-1">
                      {module.exercises.map(exercise => (
                        <button
                          key={exercise.id}
                          onClick={() => handleExerciseClick(exercise.id)}
                          className={`w-full flex items-center p-2 rounded-lg text-left text-sm ${
                            activeExerciseId === exercise.id
                              ? 'bg-primary-500/10 text-primary-400'
                              : 'text-gray-400 hover:bg-dark-300/70 hover:text-gray-300'
                          } transition-colors`}
                        >
                          <FileText className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                          <span className="truncate">{exercise.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Credentials Panel */}
          <div className="glass-panel mt-6">
            <h2 className="text-lg font-semibold mb-4">
              <GradientText>Access Credentials</GradientText>
            </h2>
            
            <div className="space-y-4">
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
            
            <button
              onClick={handleGoToConsole}
              disabled={!sliceDetails?.consoleUrl}
              className="w-full btn-primary mt-4"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Go to {sliceDetails?.provider?.toUpperCase()} Console
            </button>
          </div>
        </div>

        {/* Main Content - Exercise */}
        <div className="lg:col-span-3">
          {activeExercise ? (
            <div className="glass-panel">
              <h2 className="text-xl font-semibold mb-6">
                <GradientText>{activeExercise.title}</GradientText>
              </h2>
              
              <div className="prose prose-invert prose-primary max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: activeExercise.description }} />
              </div>

              {/* Exercise Content */}
              <div className="p-4 bg-dark-300/50 rounded-lg mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Code className="h-5 w-5 text-primary-400" />
                  <h3 className="text-lg font-medium text-gray-200">Instructions</h3>
                </div>
                <div className="prose prose-invert prose-primary max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: activeExercise.content }} />
                </div>
              </div>

              {/* Services Section */}
              {activeExercise.services && activeExercise.services.length > 0 && (
                <div className="p-4 bg-dark-300/50 rounded-lg mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Cloud className="h-5 w-5 text-primary-400" />
                    <h3 className="text-lg font-medium text-gray-200">Services</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {activeExercise.services.map((service, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-dark-400/50 rounded-lg flex items-center space-x-2"
                      >
                        <Server className="h-4 w-4 text-primary-400 flex-shrink-0" />
                        <span className="text-sm text-gray-300 truncate">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terminal/Console Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleGoToConsole}
                  className="btn-primary"
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  Open Cloud Console
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 text-center">
              <BookOpen className="h-12 w-12 text-primary-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-200 mb-2">
                Select an exercise to begin
              </h2>
              <p className="text-gray-400">
                Choose a module and exercise from the sidebar to start learning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};