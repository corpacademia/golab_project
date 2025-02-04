import React, { useEffect, useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  Clock, Tag, BookOpen, Play, FolderX, Brain, 
  Search, Filter, Sparkles, Target, TrendingUp,
  Loader, AlertCircle, Check, Square, Trash2,
  Cpu, Server, HardDrive, X
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

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  labId: string;
  labTitle: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, labId, labTitle }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setNotification(null);

    try {
      const response = await axios.delete(`http://localhost:3000/api/v1/deleteLab/${labId}`);
      
      if (response.data.success) {
        setNotification({ type: 'success', message: 'Lab deleted successfully' });
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh to show updated list
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to delete lab');
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete lab'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Delete Lab</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete <span className="font-semibold">{labTitle}</span>? This action cannot be undone.
          </p>

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

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-primary bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Deleting...
                </span>
              ) : (
                'Delete Lab'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    labId: string;
    labTitle: string;
  }>({
    isOpen: false,
    labId: '',
    labTitle: ''
  });

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

  // ... (keep all existing functions)

  return (
    <div className="space-y-6">
      {/* Keep existing header and filters sections */}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-[320px] bg-dark-300/50 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
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
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setDeleteModal({
                              isOpen: true,
                              labId: lab.lab_id,
                              labTitle: lab.title
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

                      {/* Keep existing card content */}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, labId: '', labTitle: '' })}
        labId={deleteModal.labId}
        labTitle={deleteModal.labTitle}
      />
    </div>
  );
};