import React, { useEffect, useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  Clock, Tag, BookOpen, Play, FolderX, Brain, 
  Search, Filter, Sparkles, Target, TrendingUp,
  Loader, AlertCircle, Check, Square,
  Cpu, Server, HardDrive
} from 'lucide-react';
import axios from 'axios';

interface Filters {
  search: string;
  provider: string;
  status: string;
}

interface LabControl {
  isLaunched: boolean;
  isLaunching: boolean;
  isProcessing: boolean;
  buttonLabel: 'Start Lab' | 'Stop Lab';
  notification: {
    type: 'success' | 'error';
    message: string;
  } | null;
}

export const MyLabs: React.FC = () => {
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [labStatus, setLabStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    provider: '',
    status: ''
  });
  const [labControls, setLabControls] = useState<Record<string, LabControl>>({});

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('auth') || '{}').result;
        const catalogues = await axios.get('http://localhost:3000/api/v1/getCatalogues');
        const labs = await axios.post('http://localhost:3000/api/v1/getAssignedLabs', {
          userId: user.id
        });
        const cats = catalogues.data.data;
        const labss = labs.data.data;
        
        const filteredCatalogues = cats.filter((cat) => {
          return labss.some((lab) => lab.lab_id === cat.lab_id);
        });
        
        setLabs(filteredCatalogues);
        setFilteredLabs(filteredCatalogues);
        setLabStatus(labss);

        // Initialize lab controls
        const controls: Record<string, LabControl> = {};
        filteredCatalogues.forEach((lab) => {
          controls[lab.lab_id] = {
            isLaunched: false,
            isLaunching: false,
            isProcessing: false,
            buttonLabel: 'Start Lab',
            notification: null
          };
        });
        setLabControls(controls);

        // Check initial lab states
        filteredCatalogues.forEach((lab) => {
          checkLabStatus(lab.lab_id);
        });
      } catch (error) {
        console.error('Error fetching labs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabs();
  }, []);

  useEffect(() => {
    let result = [...labs];

    if (filters.search) {
      result = result.filter(lab => 
        lab.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        lab.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.provider) {
      result = result.filter(lab => lab.provider.toLowerCase() === filters.provider.toLowerCase());
    }

    if (filters.status) {
      result = result.filter((lab, index) => 
        labStatus[index]?.status === filters.status
      );
    }

    setFilteredLabs(result);
  }, [filters, labs, labStatus]);

  const checkLabStatus = async (labId: string) => {
    try {
      const response = await axios.post('http://localhost:3000/api/v1/checkLabStatus', {
        lab_id: labId
      });

      if (response.data.success) {
        setLabControls(prev => ({
          ...prev,
          [labId]: {
            ...prev[labId],
            isLaunched: response.data.isLaunched,
            buttonLabel: response.data.isRunning ? 'Stop Lab' : 'Start Lab'
          }
        }));
      }
    } catch (error) {
      console.error('Error checking lab status:', error);
    }
  };

  const handleLaunchLab = async (labId: string) => {
    setLabControls(prev => ({
      ...prev,
      [labId]: {
        ...prev[labId],
        isLaunching: true,
        notification: null
      }
    }));

    try {
      const response = await axios.post('http://localhost:3000/api/v1/launchLab', {
        lab_id: labId
      });

      if (response.data.success) {
        setLabControls(prev => ({
          ...prev,
          [labId]: {
            ...prev[labId],
            isLaunched: true,
            isLaunching: false,
            notification: {
              type: 'success',
              message: 'Lab launched successfully'
            }
          }
        }));
      } else {
        throw new Error(response.data.message || 'Failed to launch lab');
      }
    } catch (error: any) {
      setLabControls(prev => ({
        ...prev,
        [labId]: {
          ...prev[labId],
          isLaunching: false,
          notification: {
            type: 'error',
            message: error.response?.data?.message || 'Failed to launch lab'
          }
        }
      }));
    }
  };

  const handleStartStopLab = async (labId: string) => {
    const isStop = labControls[labId]?.buttonLabel === 'Stop Lab';
    
    setLabControls(prev => ({
      ...prev,
      [labId]: {
        ...prev[labId],
        isProcessing: true,
        notification: null
      }
    }));

    try {
      const response = await axios.post(`http://localhost:3000/api/v1/${isStop ? 'stopLab' : 'startLab'}`, {
        lab_id: labId
      });

      if (response.data.success) {
        setLabControls(prev => ({
          ...prev,
          [labId]: {
            ...prev[labId],
            isProcessing: false,
            buttonLabel: isStop ? 'Start Lab' : 'Stop Lab',
            notification: {
              type: 'success',
              message: `Lab ${isStop ? 'stopped' : 'started'} successfully`
            }
          }
        }));
      } else {
        throw new Error(response.data.message || `Failed to ${isStop ? 'stop' : 'start'} lab`);
      }
    } catch (error: any) {
      setLabControls(prev => ({
        ...prev,
        [labId]: {
          ...prev[labId],
          isProcessing: false,
          notification: {
            type: 'error',
            message: error.response?.data?.message || `Failed to ${isStop ? 'stop' : 'start'} lab`
          }
        }
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="glass-panel p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold mb-2">
              <GradientText>My Labs</GradientText>
            </h1>
            <p className="text-gray-400">Track your progress and continue your learning journey</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search labs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 placeholder-gray-500 focus:border-primary-500/40 focus:outline-none
                         focus:ring-2 focus:ring-primary-500/20 transition-colors"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            </div>

            <select
              value={filters.provider}
              onChange={(e) => setFilters(prev => ({ ...prev, provider: e.target.value }))}
              className="px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
            >
              <option value="">All Providers</option>
              <option value="aws">AWS</option>
              <option value="azure">Azure</option>
              <option value="gcp">GCP</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>

            <button 
              onClick={() => setFilters({ search: '', provider: '', status: '' })}
              className="btn-secondary whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Lab Cards */}
      {filteredLabs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] glass-panel">
          <FolderX className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            <GradientText>No Labs Found</GradientText>
          </h2>
          <p className="text-gray-400 text-center max-w-md mb-6">
            {labs.length === 0 
              ? "You haven't been assigned any labs yet. Check out our lab catalogue to get started."
              : "No labs match your current filters. Try adjusting your search criteria."}
          </p>
          {labs.length === 0 && (
            <a 
              href="/dashboard/labs/catalogue"
              className="btn-primary"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Lab Catalogue
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLabs.map((lab, index) => {
            // Clear notification after 3 seconds
            if (labControls[lab.lab_id]?.notification) {
              setTimeout(() => {
                setLabControls(prev => ({
                  ...prev,
                  [lab.lab_id]: {
                    ...prev[lab.lab_id],
                    notification: null
                  }
                }));
              }, 3000);
            }

            return (
              <div key={lab.lab_id} 
                  className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                            hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                            transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                            hover:translate-y-[-2px] group relative">
                {labControls[lab.lab_id]?.notification && (
                  <div className={`absolute top-2 right-2 px-4 py-2 rounded-lg flex items-center space-x-2 z-50 ${
                    labControls[lab.lab_id].notification.type === 'success' 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {labControls[lab.lab_id].notification.type === 'success' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm">{labControls[lab.lab_id].notification.message}</span>
                  </div>
                )}
                
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">
                        <GradientText>{lab.title}</GradientText>
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{lab.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      labStatus[index]?.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                      labStatus[index]?.status === 'in_progress' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-primary-500/20 text-primary-300'
                    }`}>
                      {labStatus[index]?.status || 'Not Started'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <Cpu className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                      <span className="truncate">{lab.cpu} vCPU</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Tag className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                      <span className="truncate">{lab.ram}GB RAM</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Server className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                      <span className="truncate">Instance: {lab.instance}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <HardDrive className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                      <span className="truncate">Storage: {lab.storage}GB</span>
                    </div>
                  </div>

                  {/* Software Installed Section */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Software Installed:</h4>
                    <div className="flex flex-wrap gap-2">
                      {lab.software?.map((software, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
                          {software}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-primary-500/10 space-y-2">
                    {!labControls[lab.lab_id]?.isLaunched && (
                      <button
                        onClick={() => handleLaunchLab(lab.lab_id)}
                        disabled={labControls[lab.lab_id]?.isLaunching}
                        className="w-full px-4 py-2 rounded-lg text-sm font-medium
                                  bg-gradient-to-r from-primary-500 to-secondary-500
                                  hover:from-primary-400 hover:to-secondary-400
                                  transform hover:scale-105 transition-all duration-300
                                  text-white shadow-lg shadow-primary-500/20 
                                  disabled:opacity-50 disabled:cursor-not-allowed
                                  flex items-center justify-center"
                      >
                        {labControls[lab.lab_id]?.isLaunching ? (
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {labControls[lab.lab_id]?.isLaunching ? 'Launching...' : 'Launch Lab'}
                      </button>
                    )}

                    {labControls[lab.lab_id]?.isLaunched && (
                      <button
                        onClick={() => handleStartStopLab(lab.lab_id)}
                        disabled={labControls[lab.lab_id]?.isProcessing}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium
                                  flex items-center justify-center
                                  ${labControls[lab.lab_id]?.buttonLabel === 'Stop Lab'
                                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                  }
                                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {labControls[lab.lab_id]?.isProcessing ? (
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                        ) : labControls[lab.lab_id]?.buttonLabel === 'Stop Lab' ? (
                          <Square className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {labControls[lab.lab_id]?.isProcessing 
                          ? `${labControls[lab.lab_id]?.buttonLabel === 'Stop Lab' ? 'Stopping' : 'Starting'}...` 
                          : labControls[lab.lab_id]?.buttonLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};