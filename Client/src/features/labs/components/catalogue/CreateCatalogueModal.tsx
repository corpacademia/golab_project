import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Check, Loader, Cpu, MemoryStick as Memory, HardDrive, Server } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import axios from 'axios';

interface CreateCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCatalogue: {
    cpu: number;
    ram: number;
    storage: number;
    instance: string;
  };
  onSuccess?: () => void;
}

export const CreateCatalogueModal: React.FC<CreateCatalogueModalProps> = ({
  isOpen,
  onClose,
  existingCatalogue,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    cpu: existingCatalogue.cpu,
    ram: existingCatalogue.ram,
    storage: existingCatalogue.storage,
    instance: existingCatalogue.instance
  });

  const [availableInstances, setAvailableInstances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInstances, setIsFetchingInstances] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [admin, setAdmin] = useState({});

  useEffect(() => {
    const getUserDetails = async () => {
      const response = await axios.get('http://localhost:3000/api/v1/user_profile');
      setAdmin(response.data.user);
    };
    getUserDetails();
  }, []);

  useEffect(() => {
    fetchInstances();
  }, [formData.cpu, formData.ram]);

  const fetchInstances = async () => {
    if (!formData.cpu || !formData.ram) return;

    setIsFetchingInstances(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/getInstances', {
        cloud: 'aws',
        cpu: formData.cpu,
        ram: formData.ram,
        storage: formData.storage
      });

      if (response.data.success) {
        setAvailableInstances(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching instances:', error);
      setError('Failed to fetch available instances');
    } finally {
      setIsFetchingInstances(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Catalogue name is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/createCatalogue', {
        name: formData.name,
        cpu: formData.cpu,
        ram: formData.ram,
        storage: formData.storage,
        instance: formData.instance,
        admin_id: admin.id
      });

      if (response.data.success) {
        setSuccess('Catalogue created successfully');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to create catalogue');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create catalogue');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Create New Catalogue</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Catalogue Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
              placeholder="Enter catalogue name"
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <Cpu className="h-4 w-4 mr-2" />
                CPU Cores: {formData.cpu}
              </label>
              <input
                type="range"
                min="1"
                max="16"
                value={formData.cpu}
                onChange={(e) => setFormData(prev => ({ ...prev, cpu: parseInt(e.target.value) }))}
                className="w-full h-2 bg-dark-400 rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-primary-500
                         [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:transition-all
                         [&::-webkit-slider-thumb]:duration-150
                         [&::-webkit-slider-thumb]:ease-in-out
                         [&::-webkit-slider-thumb]:hover:scale-110"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 Core</span>
                <span>16 Cores</span>
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <Memory className="h-4 w-4 mr-2" />
                Memory (RAM): {formData.ram} GB
              </label>
              <input
                type="range"
                min="2"
                max="64"
                step="2"
                value={formData.ram}
                onChange={(e) => setFormData(prev => ({ ...prev, ram: parseInt(e.target.value) }))}
                className="w-full h-2 bg-dark-400 rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-primary-500
                         [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:transition-all
                         [&::-webkit-slider-thumb]:duration-150
                         [&::-webkit-slider-thumb]:ease-in-out
                         [&::-webkit-slider-thumb]:hover:scale-110"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2 GB</span>
                <span>64 GB</span>
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <HardDrive className="h-4 w-4 mr-2" />
                Storage: {formData.storage} GB
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={formData.storage}
                onChange={(e) => setFormData(prev => ({ ...prev, storage: parseInt(e.target.value) }))}
                className="w-full h-2 bg-dark-400 rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-primary-500
                         [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:transition-all
                         [&::-webkit-slider-thumb]:duration-150
                         [&::-webkit-slider-thumb]:ease-in-out
                         [&::-webkit-slider-thumb]:hover:scale-110"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50 GB</span>
                <span>1000 GB</span>
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <Server className="h-4 w-4 mr-2" />
                Instance Type
              </label>
              <select
                value={formData.instance}
                onChange={(e) => setFormData(prev => ({ ...prev, instance: e.target.value }))}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
                disabled={isFetchingInstances}
              >
                <option value="">Select Instance</option>
                {availableInstances.map((instance, index) => (
                  <option key={index} value={instance.instancename}>
                    {instance.instancename} ({instance.vcpu} vCPU, {instance.memory} RAM)
                  </option>
                ))}
              </select>
              {isFetchingInstances && (
                <p className="mt-1 text-xs text-gray-500 flex items-center">
                  <Loader className="animate-spin h-3 w-3 mr-1" />
                  Fetching available instances...
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-200">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-emerald-400" />
                <span className="text-emerald-200">{success}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !formData.name || !formData.instance}
              className="btn-primary"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </span>
              ) : (
                'Create Catalogue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};