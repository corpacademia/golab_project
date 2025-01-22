import React, { useState } from 'react';
import { 
  Clock, 
  Tag, 
  BookOpen, 
  Play, 
  Settings, 
  Plus,
  Check,
  AlertCircle,
  X,
  Cpu,
  Hash,
  FileCode,
  HardDrive,
  Server
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { SoftwareInstallModal } from './SoftwareInstallModal';
import { ConvertToCatalogueModal } from './ConvertToCatalogueModal';
import axios from 'axios';

interface CloudVMProps {
  vm: {
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
  };
}

export const CloudVMCard: React.FC<CloudVMProps> = ({ vm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatalogueModalOpen, setIsCatalogueModalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConvertEnabled, setIsConvertEnabled] = useState(false);
  const [amiId, setAmiId] = useState<string | undefined>(vm.ami_id);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleRun = async (software: string[]) => {
    setIsRunning(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/runVM', {
        vm_id: vm.id,
        software
      });
      
      if (response.data.success) {
        setNotification({ type: 'success', message: 'Software installation started successfully' });
      } else {
        throw new Error(response.data.message || 'Failed to start installation');
      }
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to start installation'
      });
    } finally {
      setIsRunning(false);
      setIsModalOpen(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleVMGoldenImage = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/createGoldenImage', {
        vm_id: vm.id
      });

      if (response.data.success) {
        setNotification({ type: 'success', message: 'Golden image created successfully' });
        setAmiId(response.data.ami_id);
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

  return (
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
              <GradientText>{vm.name}</GradientText>
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{vm.description}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            vm.status === 'running' ? 'bg-emerald-500/20 text-emerald-300' :
            vm.status === 'stopped' ? 'bg-red-500/20 text-red-300' :
            'bg-amber-500/20 text-amber-300'
          }`}>
            {vm.status}
          </span>
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
                onClick={() => setIsModalOpen(true)}
                disabled={isRunning}
                className="h-9 px-4 rounded-lg text-sm font-medium flex-1
                         bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30
                         transition-colors flex items-center justify-center
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4 mr-2" />
                Run
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
              onClick={() => setIsCatalogueModalOpen(true)}
              disabled={!isConvertEnabled}
              className="h-9 px-4 rounded-lg text-sm font-medium w-full
                       bg-gradient-to-r from-primary-500 to-secondary-500
                       hover:from-primary-400 hover:to-secondary-400
                       transform hover:scale-105 transition-all duration-300
                       text-white shadow-lg shadow-primary-500/20
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Convert to Catalogue
            </button>
          </div>
        </div>
      </div>

      <SoftwareInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRun}
        isLoading={isRunning}
      />

      <ConvertToCatalogueModal
        isOpen={isCatalogueModalOpen}
        onClose={() => setIsCatalogueModalOpen(false)}
        vmId={vm.id}
        amiId={amiId}
      />
    </div>
  );
};