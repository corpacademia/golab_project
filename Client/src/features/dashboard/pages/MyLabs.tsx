import React, { useEffect, useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  Clock, Tag, BookOpen, Play, FolderX, Brain, 
  Search, Filter, Square, Trash2,
  Cpu, Server, HardDrive, X, Loader, AlertCircle, Check,
  Layers, FileText
} from 'lucide-react';
import { CloudSliceCard } from '../../labs/components/user/CloudSliceCard';
import { DeleteLabModal } from '../../labs/components/user/DeleteLabModal';

// Mock data for testing UI
const mockVmLabs = [
  {
    lab_id: 'vm-123',
    title: 'Docker & Kubernetes Lab',
    description: 'Learn container orchestration with Docker and Kubernetes',
    provider: 'aws',
    instance: 't3.large',
    status: 'active',
    cpu: 2,
    ram: 8,
    storage: 100,
    os: 'Linux',
    software: ['Docker', 'Kubernetes', 'Helm']
  },
  {
    lab_id: 'vm-456',
    title: 'Machine Learning Environment',
    description: 'Set up a complete ML development environment with TensorFlow and PyTorch',
    provider: 'aws',
    instance: 'p3.2xlarge',
    status: 'active',
    cpu: 8,
    ram: 64,
    storage: 500,
    os: 'Linux',
    software: ['TensorFlow', 'PyTorch', 'Jupyter', 'CUDA']
  }
];

const mockLabStatus = [
  {
    lab_id: 'vm-123',
    status: 'in_progress',
    completion_date: '2024-05-15'
  },
  {
    lab_id: 'vm-456',
    status: 'pending',
    completion_date: '2024-06-01'
  }
];

const mockCloudSlices = [
  {
    id: 'cs-123',
    title: 'AWS Cloud Architecture',
    description: 'Design and implement scalable cloud architectures',
    provider: 'aws',
    region: 'us-east-1',
    services: ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFormation'],
    status: 'active',
    startDate: '2024-04-01T00:00:00Z',
    endDate: '2024-05-01T00:00:00Z',
    labType: 'without-modules'
  },
  {
    id: 'cs-456',
    title: 'AWS DevOps Pipeline',
    description: 'Build and deploy a complete CI/CD pipeline',
    provider: 'aws',
    region: 'us-west-2',
    services: ['CodeCommit', 'CodeBuild', 'CodeDeploy', 'CodePipeline', 'EC2'],
    status: 'active',
    startDate: '2024-04-01T00:00:00Z',
    endDate: '2024-05-01T00:00:00Z',
    labType: 'with-modules'
  },
  {
    id: 'cs-789',
    title: 'Azure Cloud Fundamentals',
    description: 'Learn the basics of Microsoft Azure cloud services',
    provider: 'azure',
    region: 'eastus',
    services: ['Virtual Machines', 'App Service', 'Storage', 'Functions', 'SQL Database'],
    status: 'pending',
    startDate: '2024-04-15T00:00:00Z',
    endDate: '2024-05-15T00:00:00Z',
    labType: 'with-modules'
  }
];

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
  const [labs, setLabs] = useState(mockVmLabs);
  const [filteredLabs, setFilteredLabs] = useState(mockVmLabs);
  const [labStatus, setLabStatus] = useState(mockLabStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [cloudInstanceDetails, setCloudInstanceDetails] = useState<any | undefined>(undefined);
  const [labControls, setLabControls] = useState<Record<string, LabControl>>({
    'vm-123': {
      isLaunched: true,
      isLaunching: false,
      isProcessing: false,
      buttonLabel: 'Stop Lab',
      notification: null
    },
    'vm-456': {
      isLaunched: false,
      isLaunching: false,
      isProcessing: false,
      buttonLabel: 'Start Lab',
      notification: null
    }
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    labId: string;
    labTitle: string;
    userId: string;
  }>({
    isOpen: false,
    labId: '',
    labTitle: '',
    userId: '',
  });

  const [filters, setFilters] = useState({
    search: '',
    provider: '',
    status: ''
  });

  // Cloud Slice Labs
  const [cloudSlices, setCloudSlices] = useState(mockCloudSlices);
  const [filteredCloudSlices, setFilteredCloudSlices] = useState(mockCloudSlices);

  const [user, setUser] = useState({ id: 'user-123', name: 'Test User' });

  // Apply filters effect
  useEffect(() => {
    // Filter VM labs
    let result = [...labs];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(lab => 
        lab.title.toLowerCase().includes(searchTerm) ||
        lab.description.toLowerCase().includes(searchTerm)
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

    // Filter cloud slice labs
    let sliceResult = [...cloudSlices];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      sliceResult = sliceResult.filter(slice => 
        slice.title.toLowerCase().includes(searchTerm) ||
        slice.description.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.provider) {
      sliceResult = sliceResult.filter(slice => slice.provider.toLowerCase() === filters.provider.toLowerCase());
    }

    if (filters.status) {
      sliceResult = sliceResult.filter(slice => slice.status === filters.status);
    }

    setFilteredCloudSlices(sliceResult);
  }, [filters, labs, labStatus, cloudSlices]);

  const handleLaunchLab = async (lab) => {
    setLabControls(prev => ({
      ...prev,
      [lab.lab_id]: {
        ...prev[lab.lab_id],
        isLaunching: true, // Loading starts
        notification: null
      }
    }));
  
    // Simulate API call
    setTimeout(() => {
      setLabControls(prev => ({
        ...prev,
        [lab.lab_id]: {
          ...prev[lab.lab_id],
          isLaunched: true,
          isLaunching: false,
          notification: {
            type: 'success',
            message: 'Lab launched successfully'
          }
        }
      }));
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        setLabControls(prev => ({
          ...prev,
          [lab.lab_id]: {
            ...prev[lab.lab_id],
            notification: null
          }
        }));
      }, 3000);
    }, 1500);
  };
  
  const handleStartStopLab = async (lab) => {
    const isStop = labControls[lab.lab_id]?.buttonLabel === 'Stop Lab';

    setLabControls(prev => ({
      ...prev,
      [lab.lab_id]: {
        ...prev[lab.lab_id],
        isProcessing: true,
        notification: null
      }
    }));

    // Simulate API call
    setTimeout(() => {
      setLabControls(prev => ({
        ...prev,
        [lab.lab_id]: {
          ...prev[lab.lab_id],
          isProcessing: false,
          buttonLabel: isStop ? 'Start Lab' : 'Stop Lab',
          notification: {
            type: 'success',
            message: isStop ? 'Lab stopped successfully' : 'Lab started successfully'
          }
        }
      }));
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        setLabControls(prev => ({
          ...prev,
          [lab.lab_id]: {
            ...prev[lab.lab_id],
            notification: null
          }
        }));
      }, 3000);
    }, 1500);
  };

  function formatDate(inputDate: Date) {
    const date = new Date(inputDate);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  const handleDeleteCloudSlice = async (sliceId: string) => {
    // Simulate API call
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        setCloudSlices(prev => prev.filter(slice => slice.id !== sliceId));
        setFilteredCloudSlices(prev => prev.filter(slice => slice.id !== sliceId));
        resolve(true);
      }, 1000);
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 text-primary-400 animate-spin" />
        <span className="ml-2 text-gray-400">Loading labs...</span>
      </div>
    );
  }

  const hasVmLabs = filteredLabs.length > 0;
  const hasCloudSlices = filteredCloudSlices.length > 0;
  const hasNoLabs = !hasVmLabs && !hasCloudSlices;

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
                         text-gray-300 placeholder-gray-500 focus:border-primary-500/40 focus:outline-none"
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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

      {/* Empty State */}
      {hasNoLabs && (
        <div className="flex flex-col items-center justify-center min-h-[400px] glass-panel">
          <FolderX className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            <GradientText>No Labs Found</GradientText>
          </h2>
          <p className="text-gray-400 text-center max-w-md mb-6">
            {labs.length === 0 && cloudSlices.length === 0
              ? "You haven't been assigned any labs yet. Check out our lab catalogue to get started."
              : "No labs match your current filters. Try adjusting your search criteria."}
          </p>
          {labs.length === 0 && cloudSlices.length === 0 && (
            <a 
              href="/dashboard/labs/catalogue"
              className="btn-primary"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Lab Catalogue
            </a>
          )}
        </div>
      )}

      {/* VM Labs Section */}
      {hasVmLabs && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            <GradientText>Virtual Machine Labs</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLabs.map((lab, index) => (
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setDeleteModal({
                          isOpen: true,
                          labId: lab.lab_id,
                          labTitle: lab.title,
                          userId: user.id
                        })}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        labStatus[index]?.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                        labStatus[index]?.status === 'in_progress' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-primary-500/20 text-primary-300'
                      }`}>
                        {labStatus[index]?.status || 'Not Started'}
                      </span>
                    </div>
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

                  <div className="mt-auto pt-3 border-t border-primary-500/10 flex justify-end space-x-3">
                    {!labControls[lab.lab_id]?.isLaunched ? (
                      <button
                        onClick={() => handleLaunchLab(lab)}
                        disabled={labControls[lab.lab_id]?.isLaunching}
                        className="w-12 h-12 rounded-full flex items-center justify-center
                                 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30
                                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {labControls[lab.lab_id]?.isLaunching ? (
                          <Loader className="animate-spin h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartStopLab(lab)}
                        disabled={labControls[lab.lab_id]?.isProcessing}
                        className={`w-12 h-12 rounded-full flex items-center justify-center
                                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                 ${labControls[lab.lab_id]?.buttonLabel === 'Stop Lab'
                                   ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                   : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                 }`}
                      >
                        {labControls[lab.lab_id]?.isProcessing ? (
                          <Loader className="animate-spin h-5 w-5" />
                        ) : labControls[lab.lab_id]?.buttonLabel === 'Stop Lab' ? (
                          <Square className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cloud Slice Labs Section */}
      {hasCloudSlices && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            <GradientText>Cloud Slice Labs</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCloudSlices.map((slice) => (
              <CloudSliceCard 
                key={slice.id} 
                lab={slice} 
                onDelete={handleDeleteCloudSlice}
              />
            ))}
          </div>
        </div>
      )}

      <DeleteLabModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, labId: '', labTitle: '', userId: '' })}
        labId={deleteModal.labId}
        labTitle={deleteModal.labTitle}
        onSuccess={() => {
          setLabs(prev => prev.filter(lab => lab.lab_id !== deleteModal.labId));
          setFilteredLabs(prev => prev.filter(lab => lab.lab_id !== deleteModal.labId));
        }}
      />
    </div>
  );
};