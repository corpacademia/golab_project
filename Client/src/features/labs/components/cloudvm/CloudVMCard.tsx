import React, { useEffect, useState } from 'react';
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
  Square,
  Moon // Added Moon icon for hibernate
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { ConvertToCatalogueModal } from './ConvertToCatalogueModal';
import { EditModal } from './EditModal';
import { DeleteModal } from './DeleteModal';
import axios from 'axios';

interface CloudVM {
  id: string;
  name: string;
  description: string;
  provider: string;
  instance: string;
  instance_id?: string;
  ami_id?: string;
  status: 'running' | 'stopped' | 'pending' | 'hibernated';
  cpu: number;
  ram: number;
  storage: number;
  os: string;
  lab_id: string;
  title: string;
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
  password: string;
}

interface LabDetails {
  cpu: string;
  ram: string;
  storage: string;
  instance: string;
  description: string;
}

export const CloudVMCard: React.FC<CloudVMProps> = ({ vm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLaunchProcessing, setIsLaunchProcessing] = useState(false);
  const [isHibernating, setIsHibernating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConvertEnabled, setIsConvertEnabled] = useState(false);
  const [amiId, setAmiId] = useState<string | undefined>(vm.ami_id);
  const [instanceDetails, setInstance] = useState<Instance | undefined>(undefined);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isInstance, setIsInstance] = useState(false);
  const [isAmi, setIsAmi] = useState(false);
  const [labDetails, setLabDetails] = useState<LabDetails | null>(null);
  const [buttonLabel, setButtonLabel] = useState<'Launch Software' | 'Stop'>('Launch Software');

  const admin = JSON.parse(localStorage.getItem('auth') ?? '{}').result || {};

  useEffect(() => {
    const checkVmCreated = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/v1/checkvmcreated', {
          lab_id: vm.lab_id,
        });
        if (response.data.success) {
          setAmiId(response.data.data.ami_id);
          setIsConvertEnabled(true);
        }
      } catch (error) {
        console.error('Error checking VM status:', error);
      } 
    };

    checkVmCreated();
  }, []);

  const checkLabLaunched = async () => {
    try {
      const check = await axios.post('http://localhost:3000/api/v1/checkIsLabInstanceLaunched', {
        lab_id: vm.lab_id
      });
      if (check.data.success) {
        if (check.data.data.isrunning) {
          setButtonLabel('Stop');
        } else {
          setButtonLabel('Launch Software');
        }
      }
    } catch (error) {
      console.error('Error checking lab status:', error);
    }
  };

  useEffect(() => {
    const fetchInstanceDetails = async () => {
      try {
        const instance = await axios.post('http://localhost:3000/api/v1/awsCreateInstanceDetails', {
          lab_id: vm.lab_id,
        });

        if (instance.data.success) {
          checkLabLaunched();
          setInstance(instance.data.result);
          setIsInstance(true);
        }
      } catch (error) {
        console.error('Failed to fetch instance details:', error);
      }
    };

    fetchInstanceDetails();
  }, [vm.lab_id]);

  useEffect(() => {
    const fetchLabDetails = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/v1/getLabOnId",
          {
            labId: vm.lab_id,
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
  }, [vm.lab_id]);

  const handleEditSuccess = () => {
    const fetchLabDetails = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/v1/getLabOnId",
          {
            labId: vm.lab_id,
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

  const handleHibernate = async () => {
    if (!instanceDetails?.instance_id) {
      setNotification({
        type: 'error',
        message: 'No instance ID available'
      });
      return;
    }

    setIsHibernating(true);
    setNotification(null);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/hibernateInstance', {
        instance_id: instanceDetails.instance_id,
        lab_id: vm.lab_id
      });

      if (response.data.success) {
        setNotification({
          type: 'success',
          message: 'Instance hibernated successfully'
        });
        await checkLabLaunched();
      } else {
        throw new Error(response.data.message || 'Failed to hibernate instance');
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to hibernate instance'
      });
    } finally {
      setIsHibernating(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleLaunchSoftware = async () => {
    setIsLaunchProcessing(true);
  
    try {
      if (buttonLabel === 'Stop') {
        const stopResponse = await axios.post('http://localhost:3000/api/v1/stopInstance', {
          instance_id: instanceDetails?.instance_id,
        });
  
        if (stopResponse.data.success) {
          await axios.post('http://localhost:3000/api/v1/updateawsInstance', {
            lab_id: vm.lab_id,
            state: false,
          });
  
          setButtonLabel('Launch Software');
          setNotification({
            type: 'success',
            message: 'Software stopped successfully',
          });
  
          setIsLaunchProcessing(false);
          return;
        } else {
          throw new Error(stopResponse.data.message || 'Failed to stop Instance');
        }
      }
      
      const checkInstanceAlreadyStarted = await axios.post('http://localhost:3000/api/v1/checkisstarted', {
        type: 'lab',
        id: instanceDetails?.instance_id,
      });

      if (checkInstanceAlreadyStarted.data.isstarted === false) {
        const launchResponse = await axios.post('http://localhost:3000/api/v1/runSoftwareOrStop', {
          os_name: vm.os,
          instance_id: instanceDetails?.instance_id,
          hostname: instanceDetails?.public_ip,
          password: instanceDetails?.password,
          buttonState: buttonLabel,
        });
  
        if (launchResponse.data.success) {
          await axios.post('http://localhost:3000/api/v1/updateawsInstance', {
            lab_id: vm.lab_id,
            state: true,
          });
  
          setButtonLabel('Stop');
          setNotification({
            type: 'success',
            message: 'Software launched successfully',
          });
  
          if (launchResponse.data.jwtToken) {
            const guacUrl = `http://192.168.1.210:8080/guacamole/#/?token=${launchResponse.data.jwtToken}`;
            window.open(guacUrl, '_blank');
          }
        } else {
          throw new Error(launchResponse.data.message || 'Failed to launch software');
        }
      } else {
        const restart = await axios.post('http://localhost:3000/api/v1/restart_instance', {
          instance_id: instanceDetails?.instance_id,
          user_type: 'lab'
        });

        const instance = await axios.post('http://localhost:3000/api/v1/awsCreateInstanceDetails', {
          lab_id: vm.lab_id,
        });

        if (instance.data.success) {
          const launchResponse = await axios.post('http://localhost:3000/api/v1/runSoftwareOrStop', {
            os_name: vm.os,
            instance_id: instanceDetails?.instance_id,
            hostname: instance?.data.result.public_ip,
            password: instanceDetails?.password,
            buttonState: buttonLabel,
          });
  
          if (launchResponse.data.success) {
            await axios.post('http://localhost:3000/api/v1/updateawsInstance', {
              lab_id: vm.lab_id,
              state: true,
            });
  
            setButtonLabel('Stop');
            setNotification({
              type: 'success',
              message: 'Software launched successfully',
            });
  
            if (launchResponse.data.jwtToken) {
              const guacUrl = `http://192.168.1.210:8080/guacamole/#/?token=${launchResponse.data.jwtToken}`;
              window.open(guacUrl, '_blank');
            }
          }
        }
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Operation failed',
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/deletesupervm', {
        id: vm.lab_id,
        instance_id: instanceDetails?.instance_id,
        ami_id: amiId,
      });
      
      if (response.data.success) {
        setNotification({ type: 'success', message: 'VM deleted successfully' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(response.data.message || 'Failed to delete VM');
      }
    } catch (error) {
      console.log(error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete VM'
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (!isInstance) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader className="animate-spin h-8 w-8 text-primary-400" />
        <span className="ml-2 text-gray-300">
          Loading instance details...
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
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            vm.status === 'running' ? 'bg-emerald-500/20 text-emerald-300' :
            vm.status === 'stopped' ? 'bg-red-500/20 text-red-300' :
            vm.status === 'hibernated' ? 'bg-purple-500/20 text-purple-300' :
            'bg-amber-500/20 text-amber-300'
          }`}>
            {vm.status}
          </span>
          <button
            onClick={handleHibernate}
            disabled={isHibernating || vm.status === 'hibernated'}
            className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Hibernate VM"
          >
            {isHibernating ? (
              <Loader className="h-4 w-4 animate-spin text-purple-400" />
            ) : (
              <Moon className="h-4 w-4 text-purple-400" />
            )}
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </button>
        </div>
        
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">
                <GradientText>{vm.title}</GradientText>
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">{vm.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-400">
              <Cpu className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">{labDetails?.cpu} vCPU</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Tag className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">{labDetails?.ram}GB RAM</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Server className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">Instance: {labDetails?.instance}</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <HardDrive className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">Storage: {labDetails?.storage}GB</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Hash className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">ID: {instanceDetails?.instance_id || 'N/A'}</span>
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
                      Launch VM
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
        currentStorage={Number(labDetails?.storage) || 0}
        assessmentId={instanceDetails?.instance_id}
        lab_id={vm.lab_id}
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