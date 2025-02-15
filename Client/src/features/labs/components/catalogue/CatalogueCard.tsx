import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Tag, 
  BookOpen, 
  Star, 
  Cpu, 
  Settings, 
  Play, 
  AlertCircle, 
  Check,
  Square,
  Loader,
  HardDrive,
  Server,
  Pencil,
  Trash2
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { EditStorageModal } from './EditStorageModal';
import { DeleteModal } from './DeleteModal';
import axios from 'axios';

interface CatalogueCardProps {
  lab: any;
}

export const CatalogueCard: React.FC<CatalogueCardProps> = ({ lab }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [software, setSoftware] = useState<string[]>([]);
  const [labDetails, setLabDetails] = useState<any>(null);

  // Fetch software details
  useEffect(() => {
    const fetchSoftware = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/getSoftwareDetails');
        if (response.data.success) {
          const labSoftware = response.data.data.find((s: any) => s.lab_id === lab.lab_id);
          if (labSoftware) {
            setSoftware(labSoftware.software);
          }
        }
      } catch (error) {
        console.error('Error fetching software details:', error);
      }
    };

    fetchSoftware();
  }, [lab.lab_id]);

  // Fetch lab details
  useEffect(() => {
    const fetchLabDetails = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/v1/getLabOnId",
          {
            labId: lab.lab_id,
          }
        );
        if (response.data.success) {
          setLabDetails(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching lab details:", error);
      }
    };
    fetchLabDetails();
  }, [lab.lab_id]);

  const handleEditSuccess = () => {
    // Refresh lab details after successful edit
    const fetchLabDetails = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/v1/getLabOnId",
          {
            labId: lab.lab_id,
          }
        );
        if (response.data.success) {
          setLabDetails(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching lab details:", error);
      }
    };
    fetchLabDetails();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.delete(`http://localhost:3000/api/v1/deleteLab/${lab.lab_id}`);
      
      if (response.data.success) {
        setNotification({ type: 'success', message: 'Lab deleted successfully' });
        setTimeout(() => window.location.reload(), 1500);
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
      setIsDeleteModalOpen(false);
    }
  };

  if (!labDetails) {
    return <div className="animate-pulse h-[320px] bg-dark-300/50 rounded-lg"></div>;
  }

  return (
    <>
      <div className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                    hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                    transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                    hover:translate-y-[-2px] group relative">
        {notification && (
          <div className={`absolute top-2 right-16 px-4 py-2 rounded-lg flex items-center space-x-2 z-50 ${
            notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {notification.type === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{notification.message}</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
          >
            <Pencil className="h-4 w-4 text-primary-400" />
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </button>
        </div>
        
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">
                <GradientText>{lab.title}</GradientText>
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">{labDetails.description}</p>
            </div>
            <div className="flex items-center text-amber-400">
              <Star className="h-4 w-4 mr-1 fill-current" />
              <span className="text-sm">{lab.rating || 4.5}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-400">
              <Cpu className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">{labDetails.cpu} vCPU</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Tag className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">{labDetails.ram}GB RAM</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Server className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">Instance: {labDetails.instance}</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <HardDrive className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">Storage: {labDetails.storage}GB</span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Software Installed:</h4>
            <div className="flex flex-wrap gap-2">
              {software.map((sw, index) => (
                <span key={index} className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
                  {sw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EditStorageModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentStorage={Number(labDetails.storage)}
        assessmentId={lab.lab_id}
        lab_id={lab.lab_id}
        onSuccess={handleEditSuccess}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export { CatalogueCard }