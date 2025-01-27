import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Plus, 
  Check, 
  AlertCircle, 
  X, 
  Cpu, 
  Hash,
  FileCode,
  HardDrive,
  Server,
  Loader,
  Pencil, 
  Trash2
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { ConvertToCatalogueModal } from './ConvertToCatalogueModal';
import axios from 'axios';

interface CloudVM {
  id: string;
  name: string;
  description: string;
  provider: string;
  instance: string;
  instance_id?: string;
  ami_id?: string;
  status: 'running' | 'stopped' | 'pending';
  cpu: number;
  ram: number;
  storage: number;
  os: string;
}

interface CloudVMProps {
  vm: CloudVM;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (storageChange: { increase: number; decrease: number }) => Promise<void>;
  currentStorage: number;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSubmit, currentStorage }) => {
  const [increaseStorage, setIncreaseStorage] = useState(0);
  const [decreaseStorage, setDecreaseStorage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (decreaseStorage > currentStorage) {
      setError('Decrease amount cannot be greater than current storage');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ increase: increaseStorage, decrease: decreaseStorage });
      onClose();
    } catch (error) {
      console.error('Error updating storage:', error);
      setError('Failed to update storage');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Modify Storage</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-dark-300/50 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Current Storage</p>
            <p className="text-2xl font-semibold text-gray-200">{currentStorage} GB</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Increase Storage (GB)
              </label>
              <input
                type="number"
                value={increaseStorage}
                onChange={(e) => setIncreaseStorage(Math.max(0, Number(e.target.value)))}
                min="0"
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Decrease Storage (GB)
              </label>
              <input
                type="number"
                value={decreaseStorage}
                onChange={(e) => setDecreaseStorage(Math.max(0, Number(e.target.value)))}
                min="0"
                max={currentStorage}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (increaseStorage === 0 && decreaseStorage === 0)}
              className="btn-primary"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Updating...
                </span>
              ) : (
                'Update Storage'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Confirm Deletion</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">
              Are you sure you want to delete this VM? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="btn-primary bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Deleting...
                </span>
              ) : (
                'Delete VM'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CloudVMCard: React.FC<CloudVMProps> = ({ vm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConvertEnabled, setIsConvertEnabled] = useState(false);
  const [amiId, setAmiId] = useState<string | undefined>(vm.ami_id);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const checkVmCreated = async () => {
      const data = await axios.post('http://localhost:3000/api/v1/checkvmcreated', {
        lab_id: vm.lab_id
      });
      if (data.data.success) {
        setIsConvertEnabled(true);
      }
    };
    checkVmCreated();
  }, []);

  const handleRun = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/run', {
        lab_id: vm.lab_id,
        admin_id: admin.id
      });
      
      if (response.data.success) {
        setNotification({ type: 'success', message: 'VM started successfully' });
      } else {
        throw new Error(response.data.message || 'Failed to start VM');
      }
    } catch (error) {
      setIsProcessing(false);
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to start VM'
      });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleVMGoldenImage = async () => {
    setIsProcessing(true);
    try {
      const result = await axios.post('http://localhost:3000/api/v1/awsCreateInstanceDetails', {
        lab_id: vm.lab_id
      });
      
      const response = await axios.post('http://localhost:3000/api/v1/createGoldenImage', {
        instance_id: result.data.result.instance_id,
        lab_id: vm.lab_id
      });
     
      if (response.data.success) {
        const ami = await axios.post('http://localhost:3000/api/v1/amiInformation', {
          lab_id: vm.lab_id
        });
        setNotification({ type: 'success', message: 'Golden image created successfully' });
        setAmiId(ami.data.ami_id);
        setIsConvertEnabled(true);
      } else {
        throw new Error(response.data.message || 'Failed to create golden image');
      }
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to create golden image'
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleEdit = async (storageChange: { increase: number; decrease: number }) => {
    try {
      const response = await axios.put(`http://localhost:3000/api/v1/updateVM/${vm.lab_id}`, {
        storageIncrease: storageChange.increase,
        storageDecrease: storageChange.decrease
      });

      if (response.data.success) {
        setNotification({ type: 'success', message: 'Storage updated successfully' });
        window.location.reload();
      } else {
        throw new Error(response.data.message || 'Failed to update storage');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update storage'
      });
      throw error;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.delete(`http://localhost:3000/api/v1/deleteVM/${vm.lab_id}`);
      
      if (response.data.success) {
        setNotification({ type: 'success', message: 'VM deleted successfully' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(response.data.message || 'Failed to delete VM');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete VM'
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                    hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                    transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                    hover:translate-y-[-2px] group relative">
        {notification && (
          <div className={`absolute top-2 right-2 px-4 py-2 rounded-lg flex items-center space-x-2 z-50 ${
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
        
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">
                <GradientText>{vm.title}</GradientText>
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">{vm.description}</p>
            </div>
            <div className="flex items-center space-x-2">
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
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                vm.status === 'running' ? 'bg-emerald-500/20 text-emerald-300' :
                vm.status === 'stopped' ? 'bg-red-500/20 text-red-300' :
                'bg-amber-500/20 text-amber-300'
              }`}>
                {vm.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-400">
              <Cpu className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">{vm.cpu} vCPU</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Tag className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">{vm.ram}GB RAM</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Server className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">Instance: {vm.instance}</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <HardDrive className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">Storage: {vm.storage}GB</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Hash className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">ID: {vm.instance_id || 'N/A'}</span>
            </div>
            {amiId && (
              <div className="flex items-center text-sm text-gray-400">
                <FileCode className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                <span className="truncate">AMI: {amiId}</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-primary-500/10">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between gap-2">
                <button 
                  onClick={handleRun}
                  disabled={isProcessing}
                  className="h-9 px-4 rounded-lg text-sm font-medium flex-1
                           bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30
                           transition-colors flex items-center justify-center
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Running...' : 'Run'}
                </button>
                <button 
                  onClick={handleVMGoldenImage}
                  disabled={isProcessing}
                  className="h-9 px-4 rounded-lg text-sm font-medium flex-1
                           bg-primary-500/20 text-primary-300 hover:bg-primary-500/30
                           transition-colors flex items-center justify-center
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'VM-GoldenImage'}
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                disabled={!isConvertEnabled}
                className="h-9 px-4 rounded-lg text-sm font-medium w-full
                         bg-gradient-to-r from-primary-500 to-secondary-500
                         hover:from-primary-400 hover:to-secondary-400
                         transform hover:scale-105 transition-all duration-300
                         text-white shadow-lg shadow-primary-500/20
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Convert to Catalogue
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConvertToCatalogueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vmId={vm.lab_id}
        amiId={amiId}
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEdit}
        currentStorage={vm.storage}
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