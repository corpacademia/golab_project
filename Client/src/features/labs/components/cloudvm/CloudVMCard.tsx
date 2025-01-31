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
  UserPlus,
  Loader,
  Pencil, 
  Trash2,
  Tag,
  Play,
  Square
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { ConvertToCatalogueModal } from './ConvertToCatalogueModal';
import { EditModal } from './EditModal';
import { DeleteModal } from './DeleteModal';
import axios from 'axios';
import { hostname } from 'os';

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

interface Instance {
  id: string;
  lab_id: string;
  instance_id: string;
  instance_name: string;
  public_ip: string;
  password:string;
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

interface Ami {
  lab_id: string;
  ami_id: string;
  created_at: string;
}

export const CloudVMCard: React.FC<CloudVMProps> = ({ vm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLaunchProcessing , setIsLaunchProcessing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConvertEnabled, setIsConvertEnabled] = useState(false);
  const [amiId, setAmiId] = useState<string | undefined>(vm.ami_id);
  const [instanceDetails, setInstance] = useState<Instance | undefined>(undefined);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isInstance, setIsInstance] = useState(false);
  const [isAmi, setIsAmi] = useState(false);
  const [amiData, setAmiData] = useState<Ami | undefined>(undefined);
  const [buttonLabel, setButtonLabel] = useState<'Launch Software' | 'Stop'>('Launch Software');

  const admin = JSON.parse(localStorage.getItem('auth')).result || {};
  useEffect(() => {
    const checkVmCreated = async () => {
      const data = await axios.post('http://localhost:3000/api/v1/checkvmcreated', {
        lab_id: vm.lab_id
      });
      if (data.data.success) {
        setAmiData(data.data.data);
        setIsConvertEnabled(true);
        // setIsAmi(true); 
      }
    };
    checkVmCreated();
  }, []);

  
  useEffect(() => {
    const fetchInstanceDetails = async () => {
      try {
        const instance = await axios.post('http://localhost:3000/api/v1/awsCreateInstanceDetails', {
          lab_id: vm.lab_id,
        });

        if (instance.data.success) {
          setInstance(instance.data.result);
          setIsInstance(true);
        }
      } catch (error) {
        console.error('Failed to fetch instance details:', error);
      }
    };

    fetchInstanceDetails();
  }, []);

  const handleLaunchSoftware = async () => {
    setIsLaunchProcessing(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/runSoftwareOrStop', {
        os_name:vm.os,
        instance_id: instanceDetails?.instance_id,
        hostname: instanceDetails?.public_ip,
        password:instanceDetails?.password,
        buttonState: buttonLabel
      });
  
  
      if (response.data.success) {
        const newState = buttonLabel === 'Launch Software' ? 'Stop' : 'Launch Software';
        setButtonLabel(newState);
        setNotification({ 
          type: 'success', 
          message: newState === 'Stop' ? 'Software launched successfully' : 'Software stopped successfully' 
        });
  
        // Open the guacamole console if launching was successful
        if (newState === 'Stop' && response.data.jwtToken) {
          const guacUrl = `http://192.168.1.210:8080/guacamole/#/?token=${response.data.jwtToken}`;
          window.open(guacUrl, '_blank');
        }
      } else {
        throw new Error(response.data.message || 'Failed to launch software');
      }
    } catch (error) {
      setIsLaunchProcessing(false);
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to launch software'
      });
    } finally {
      setIsLaunchProcessing(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };
  

  const handleVMGoldenImage = async () => {
    setIsProcessing(true);
    try {
      const result = await axios.post('http://localhost:3000/api/v1/awsCreateInstanceDetails', {
        lab_id: vm.lab_id
      });
      
      // const checkResponse = await axios.post('http://localhost:3000/api/v1/checkvmcreated', {
      //   lab_id: vm.lab_id
      // });
      // if (checkResponse.data.success) {
      //   setNotification({ type: 'error', message: 'VM is already created to this lab' });
      //   setTimeout(() => setNotification(null), 3000);
      //   setIsProcessing(false);
      //   return;
      // }
      // if(!checkResponse.data.success){
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
      // }
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
      const response = await axios.post('http://localhost:3000/api/v1/deletevm', {
        id: vm.lab_id,
        ami_id: amiData.ami_id,
      });
      
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

  if (!isInstance ) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader className="animate-spin h-8 w-8 text-primary-400" />
        <span className="ml-2 text-gray-300">
          Loading {isInstance ? 'AMI' : isAmi ? 'instance' : 'both'} details...
        </span>
      </div>
    );
  }

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
              <span className="truncate">ID: {instanceDetails?.instance_id || 'N/A'}</span>
            </div>
            {amiData && (
              <div className="flex items-center text-sm text-gray-400">
                <FileCode className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                <span className="truncate">AMI: {amiData?.ami_id}</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-primary-500/10">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between gap-2">
                <button 
                  onClick={handleLaunchSoftware}
                  disabled={isProcessing}
                  className={`h-9 px-4 rounded-lg text-sm font-medium flex-1
                           ${buttonLabel === 'Stop' 
                             ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                             : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                           }
                           transition-colors flex items-center justify-center
                           disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLaunchProcessing ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : buttonLabel === 'Stop' ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Launch Software
                    </>
                  )}
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