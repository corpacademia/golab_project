import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  ArrowLeft, 
  Cloud, 
  Plus, 
  Layers, 
  X, 
  Save, 
  Loader, 
  AlertCircle, 
  Check,
  Trash2,
  FileText,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';
import axios from 'axios';
import { LabExerciseEditor } from '../components/cloudslice/LabExerciseEditor';
import { QuizExerciseEditor } from '../components/cloudslice/QuizExerciseEditor';

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
  type: 'lab' | 'quiz';
  order: number;
  services?: any[];
  credentials?: {
    accessKeyId?: string;
    username?: string;
    password?: string;
  };
  questions?: any[];
  duration?: number;
}

export const CloudSliceModulesPage: React.FC = () => {
  const location = useLocation();
  const { sliceId } = useParams();
  const navigate = useNavigate();
  
  const [sliceDetails, setSliceDetails] = useState<any>(location.state?.sliceDetails || null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(!location.state?.sliceDetails);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  
  // Module editing state
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [isSavingModule, setIsSavingModule] = useState(false);
  
  // Exercise editing state
  const [isAddingExercise, setIsAddingExercise] = useState<string | null>(null);
  const [newExerciseType, setNewExerciseType] = useState<'lab' | 'quiz'>('lab');
  const [newExerciseTitle, setNewExerciseTitle] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [isSavingExercise, setIsSavingExercise] = useState(false);

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
          console.error('Error fetching slice details:', err);
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
        setIsLoading(true);
        try {
          const response = await axios.get(`http://localhost:3000/api/v1/cloud_slice_ms/getModules/${sliceId}`);
          if (response.data.success) {
            const fetchedModules = response.data.data || [];
            setModules(fetchedModules);
            
            // Initialize expanded state for all modules
            const expanded: Record<string, boolean> = {};
            fetchedModules.forEach((module: Module) => {
              expanded[module.id] = true; // Default to expanded
            });
            setExpandedModules(expanded);
          } else {
            console.warn('No modules found or API returned unsuccessful status');
            setModules([]);
          }
        } catch (err: any) {
          console.error('Error fetching modules:', err);
          if (err.response?.status === 404) {
            // No modules yet, that's okay
            console.log('No modules found (404 response)');
            setModules([]);
          } else {
            setError('Failed to load modules');
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchModules();
    }
  }, [sliceId]);

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleEditModule = (module: Module) => {
    setEditingModuleId(module.id);
    setModuleTitle(module.title);
    setModuleDescription(module.description);
  };

  const handleSaveModule = async () => {
    if (!moduleTitle.trim()) {
      setError('Module title is required');
      return;
    }

    setIsSavingModule(true);
    setError(null);

    try {
      const response = await axios.put(`http://localhost:3000/api/v1/cloud_slice_ms/updateModule/${editingModuleId}`, {
        title: moduleTitle,
        description: moduleDescription
      });

      if (response.data.success) {
        // Update local state
        setModules(prev => prev.map(module => 
          module.id === editingModuleId
            ? { ...module, title: moduleTitle, description: moduleDescription }
            : module
        ));
        
        setEditingModuleId(null);
      } else {
        throw new Error(response.data.message || 'Failed to update module');
      }
    } catch (err: any) {
      console.error('Error saving module:', err);
      setError(err.message || 'Failed to update module');
    } finally {
      setIsSavingModule(false);
    }
  };

  const handleCancelEditModule = () => {
    setEditingModuleId(null);
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) {
      setError('Module title is required');
      return;
    }

    setIsSavingModule(true);
    setError(null);

    try {
      const response = await axios.post(`http://localhost:3000/api/v1/cloud_slice_ms/createModule`, {
        sliceId,
        title: newModuleTitle,
        description: newModuleDescription,
        order: modules.length + 1
      });

      if (response.data.success) {
        // Add new module to local state
        setModules(prev => [...prev, response.data.data]);
        
        // Expand the new module
        setExpandedModules(prev => ({
          ...prev,
          [response.data.data.id]: true
        }));
        
        // Reset form
        setIsAddingModule(false);
        setNewModuleTitle('');
        setNewModuleDescription('');
      } else {
        throw new Error(response.data.message || 'Failed to create module');
      }
    } catch (err: any) {
      console.error('Error adding module:', err);
      setError(err.message || 'Failed to create module');
    } finally {
      setIsSavingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? This will also delete all exercises within it.')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:3000/api/v1/cloud_slice_ms/deleteModule/${moduleId}`);
      
      if (response.data.success) {
        // Remove module from local state
        setModules(prev => prev.filter(module => module.id !== moduleId));
      } else {
        throw new Error(response.data.message || 'Failed to delete module');
      }
    } catch (err: any) {
      console.error('Error deleting module:', err);
      setError(err.message || 'Failed to delete module');
    }
  };

  const handleAddExercise = async (moduleId: string) => {
    if (!newExerciseTitle.trim()) {
      setError('Exercise title is required');
      return;
    }

    setIsSavingExercise(true);
    setError(null);

    try {
      const moduleIndex = modules.findIndex(m => m.id === moduleId);
      const exerciseCount = modules[moduleIndex].exercises?.length || 0;
      
      const response = await axios.post(`http://localhost:3000/api/v1/cloud_slice_ms/createExercise`, {
        moduleId,
        title: newExerciseTitle,
        description: newExerciseDescription,
        type: newExerciseType,
        order: exerciseCount + 1
      });

      if (response.data.success) {
        // Add new exercise to local state
        setModules(prev => prev.map(module => 
          module.id === moduleId
            ? { 
                ...module, 
                exercises: [...(module.exercises || []), response.data.data] 
              }
            : module
        ));
        
        // Reset form
        setIsAddingExercise(null);
        setNewExerciseTitle('');
        setNewExerciseDescription('');
        setNewExerciseType('lab');
      } else {
        throw new Error(response.data.message || 'Failed to create exercise');
      }
    } catch (err: any) {
      console.error('Error adding exercise:', err);
      setError(err.message || 'Failed to create exercise');
    } finally {
      setIsSavingExercise(false);
    }
  };

  const handleUpdateExercise = async (exerciseId: string, updatedData: any) => {
    try {
      const response = await axios.put(`http://localhost:3000/api/v1/cloud_slice_ms/updateExercise/${exerciseId}`, updatedData);
      
      if (response.data.success) {
        // Update exercise in local state
        setModules(prev => prev.map(module => ({
          ...module,
          exercises: module.exercises?.map(exercise => 
            exercise.id === exerciseId
              ? { ...exercise, ...updatedData }
              : exercise
          )
        })));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update exercise');
      }
    } catch (err: any) {
      console.error('Error updating exercise:', err);
      throw new Error(err.message || 'Failed to update exercise');
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/v1/cloud_slice_ms/deleteExercise/${exerciseId}`);
      
      if (response.data.success) {
        // Remove exercise from local state
        setModules(prev => prev.map(module => ({
          ...module,
          exercises: module.exercises?.filter(exercise => exercise.id !== exerciseId)
        })));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete exercise');
      }
    } catch (err: any) {
      console.error('Error deleting exercise:', err);
      throw new Error(err.message || 'Failed to delete exercise');
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
              <GradientText>{sliceDetails?.title || 'Cloud Slice Modules'}</GradientText>
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
            {sliceDetails?.provider?.toUpperCase() || 'AWS'}
          </span>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        {modules.length > 0 ? (
          modules.map((module) => (
            <div 
              key={module.id}
              className="glass-panel"
            >
              {/* Module Header */}
              <div className="flex justify-between items-start">
                {editingModuleId === module.id ? (
                  <div className="flex-1 mr-4">
                    <input
                      type="text"
                      value={moduleTitle}
                      onChange={(e) => setModuleTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                               text-gray-200 focus:border-primary-500/40 focus:outline-none mb-2"
                      placeholder="Module Title"
                    />
                    <textarea
                      value={moduleDescription}
                      onChange={(e) => setModuleDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                               text-gray-200 focus:border-primary-500/40 focus:outline-none"
                      placeholder="Module Description"
                      rows={2}
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">
                      <GradientText>{module.title}</GradientText>
                    </h2>
                    <p className="text-gray-400 mt-1">{module.description}</p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  {editingModuleId === module.id ? (
                    <>
                      <button
                        onClick={handleCancelEditModule}
                        className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
                        disabled={isSavingModule}
                      >
                        <X className="h-5 w-5 text-gray-400" />
                      </button>
                      <button
                        onClick={handleSaveModule}
                        className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
                        disabled={isSavingModule}
                      >
                        {isSavingModule ? (
                          <Loader className="h-5 w-5 text-primary-400 animate-spin" />
                        ) : (
                          <Save className="h-5 w-5 text-primary-400" />
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditModule(module)}
                        className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
                      >
                        <GradientText>Edit</GradientText>
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <span className="text-red-400">Delete</span>
                      </button>
                      <button
                        onClick={() => toggleModuleExpanded(module.id)}
                        className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
                      >
                        {expandedModules[module.id] ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Module Content */}
              {expandedModules[module.id] && (
                <div className="mt-6 space-y-4">
                  {/* Exercises */}
                  {module.exercises && module.exercises.length > 0 ? (
                    <div className="space-y-4">
                      {module.exercises.map((exercise) => (
                        exercise.type === 'lab' ? (
                          <LabExerciseEditor
                            key={exercise.id}
                            exercise={exercise}
                            moduleId={module.id}
                            sliceId={sliceId!}
                            onUpdate={handleUpdateExercise}
                            onDelete={handleDeleteExercise}
                          />
                        ) : (
                          <QuizExerciseEditor
                            key={exercise.id}
                            exercise={exercise}
                            moduleId={module.id}
                            sliceId={sliceId!}
                            onUpdate={handleUpdateExercise}
                            onDelete={handleDeleteExercise}
                          />
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No exercises in this module yet.</p>
                      <p className="text-sm text-gray-500">Click "Add Exercise" to create one.</p>
                    </div>
                  )}
                  
                  {/* Add Exercise Button or Form */}
                  {isAddingExercise === module.id ? (
                    <div className="glass-panel">
                      <h3 className="text-lg font-semibold mb-4">
                        <GradientText>Add New Exercise</GradientText>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Exercise Type
                          </label>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                checked={newExerciseType === 'lab'}
                                onChange={() => setNewExerciseType('lab')}
                                className="h-4 w-4 text-primary-500 focus:ring-primary-500"
                              />
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 text-primary-400 mr-1" />
                                <span className="text-gray-300">Lab Exercise</span>
                              </div>
                            </label>
                            
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                checked={newExerciseType === 'quiz'}
                                onChange={() => setNewExerciseType('quiz')}
                                className="h-4 w-4 text-primary-500 focus:ring-primary-500"
                              />
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-primary-400 mr-1" />
                                <span className="text-gray-300">Quiz Questions</span>
                              </div>
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={newExerciseTitle}
                            onChange={(e) => setNewExerciseTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                     text-gray-200 focus:border-primary-500/40 focus:outline-none"
                            placeholder="Exercise Title"
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
                                     text-gray-200 focus:border-primary-500/40 focus:outline-none"
                            placeholder="Exercise Description"
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => {
                              setIsAddingExercise(null);
                              setNewExerciseTitle('');
                              setNewExerciseDescription('');
                              setNewExerciseType('lab');
                            }}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAddExercise(module.id)}
                            disabled={isSavingExercise || !newExerciseTitle.trim()}
                            className="btn-primary"
                          >
                            {isSavingExercise ? (
                              <span className="flex items-center">
                                <Loader className="animate-spin h-4 w-4 mr-2" />
                                Creating...
                              </span>
                            ) : (
                              'Create Exercise'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingExercise(module.id)}
                      className="w-full py-3 border border-dashed border-primary-500/30 rounded-lg
                               text-primary-400 hover:text-primary-300 hover:border-primary-500/50
                               transition-colors flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercise
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="glass-panel p-8 text-center">
            <Layers className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">No Modules Yet</h3>
            <p className="text-gray-400 mb-6">
              This cloud slice doesn't have any modules yet. Create your first module to get started.
            </p>
          </div>
        )}
        
        {/* Add Module Button or Form */}
        {isAddingModule ? (
          <div className="glass-panel">
            <h2 className="text-xl font-semibold mb-4">
              <GradientText>Add New Module</GradientText>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Module Title
                </label>
                <input
                  type="text"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-200 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Module Title"
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
                           text-gray-200 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Module Description"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsAddingModule(false);
                    setNewModuleTitle('');
                    setNewModuleDescription('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddModule}
                  disabled={isSavingModule || !newModuleTitle.trim()}
                  className="btn-primary"
                >
                  {isSavingModule ? (
                    <span className="flex items-center">
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Creating...
                    </span>
                  ) : (
                    'Create Module'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingModule(true)}
            className="w-full py-4 border-2 border-dashed border-primary-500/30 rounded-xl
                     text-primary-400 hover:text-primary-300 hover:border-primary-500/50
                     transition-colors flex items-center justify-center"
          >
            <Layers className="h-5 w-5 mr-2" />
            Add New Module
          </button>
        )}
      </div>
    </div>
  );
};