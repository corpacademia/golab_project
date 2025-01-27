import React, { useState, useEffect } from 'react';
import { Clock, Tag, BookOpen, Star, Cpu, Settings, Play, AlertCircle, Check } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { Lab } from '../../types';
import { ConfigurationModal } from './ConfigurationModal';
import axios from 'axios';

interface CatalogueCardProps {
  lab: Lab;
}

export const CatalogueCard: React.FC<CatalogueCardProps> = ({ lab }) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showPreviewDetails, setShowPreviewDetails] = useState(false);
  const [instanceDetails, setInstanceDetails] = useState();
  const [instanceCost, setInstanceCost] = useState();
  const [isRunning, setIsRunning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const user = JSON.parse(localStorage.getItem('auth') || '{}');
  // const [awsInstanceDetails,setAwsInstanceDetails] = useState();

  useEffect(() => {
    const fetchInstanceDetails = async () => {
      try {
        const data = await axios.post('http://localhost:3000/api/v1/getInstanceDetails', {
          provider: lab.provider,
          instance: lab.instance,
          cpu: lab.cpu,
          ram: lab.ram,
        });
        
        if (data.data.success) {
          setInstanceDetails(data.data.data);
          const price = getPriceByOS(data.data.data, lab.os);
          setInstanceCost(price);
        }
      } catch (error) {
        console.error("Error fetching instance details:", error);
      }

     
      
    };

    fetchInstanceDetails();
  }, [lab]);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/run', {
        lab_id: lab.lab_id,
        admin_id: user.result.id
      });
      
      if (response.data.success) {
        setNotification({ type: 'success', message: 'Lab started successfully' });
      } else {
        throw new Error(response.data.message || 'Failed to start lab');
      }
    } catch (error) {
      setIsRunning(false);
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to start lab'
      });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };
 
  // const filteredAwsInstance = (awsInstanceDetails && awsInstanceDetails.length > 0)
  // ? awsInstanceDetails.filter((instance) => instance.lab_id === lab.lab_id)
  // : [];


  const handleVMGoldenImage = async () => {
    
    setIsProcessing(true);
    try {
      const result = await axios.post('http://localhost:3000/api/v1/awsCreateInstanceDetails',{lab_id:lab.lab_id})
      console.log(result)    
      
      const response = await axios.post('http://localhost:3000/api/v1/createGoldenImage', {
        instance_id: result.data.result.instance_id,
        lab_id:lab.lab_id
      });

      if (response.data.success) {
        setNotification({ type: 'success', message: 'Golden image created successfully' });
      } else {
        setNotification({ type: 'error', message: response.data.message || 'Failed to create golden image' });
      }
    } 
    catch (error) {
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to create golden image'
      });
    } 
    finally {
      setIsProcessing(false);
      setTimeout(() => setNotification(null), 3000);
    }
  }

  const handlePreviewEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollY = window.scrollY;
    setPreviewPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + scrollY
    });
    setShowPreviewDetails(true);
  };

  const getPriceByOS = (instance: any, os: string) => {
    if (lab.provider === 'aws') {
      switch (os.toLowerCase()) {
        case 'linux':
          return instance.ondemand_linux_base_pricing;
        case 'windows':
          return instance.ondemand_windows_base_pricing;
        case 'ubuntu':
          return instance.ondemand_ubuntu_pro_base_pricing;
        case 'suse':
          return instance.ondemand_suse_base_pricing;
        case 'rhel':
          return instance.ondemand_rhel_base_pricing;
        default:
          return 0;
      }
    } else if (lab.provider === 'azure') {
      switch (os.toLowerCase()) {
        case 'windows':
          return instance.windows;
        case 'linux':
          return instance.linux_vm_price;
        default:
          return 0;
      }
    }
    return 0;
  };

  const storageCost = 0.08 * (lab.storage);
  const numericValue = parseFloat(instanceCost);

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
                <GradientText>{lab.title}</GradientText>
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">{lab.description}</p>
            </div>
            <div className="flex items-center text-amber-400">
              <Star className="h-4 w-4 mr-1 fill-current" />
              <span className="text-sm">{lab.rating || 4.5}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-400">
              <Tag className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">{lab.type || 'Lab'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <BookOpen className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">Lab #{lab.lab_id}</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Cpu className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">{lab.provider}</span>
            </div>
          </div>

          {showPreviewDetails && instanceDetails && user?.result?.role !== 'user' && (
            <div 
              className="fixed bg-dark-200/95 backdrop-blur-sm border border-primary-500/20 
                        rounded-lg shadow-lg z-[9999] p-4 w-80"
              style={{
                left: `${previewPosition.x}px`,
                top: `${previewPosition.y - 220}px`,
                transform: 'translateX(-50%)',
              }}
              
            >
              <div className="text-gray-300 font-medium mb-3">Instance Details</div>
              <div className="space-y-2 text-gray-400">
                <div className="flex justify-between">
                  <span>Instance:</span>
                  <span className="text-primary-400">{lab.provider === 'aws' ? instanceDetails.instancename : instanceDetails.instance}</span>
                </div>
                <div className="flex justify-between">
                  <span>CPU:</span>
                  <span className="text-primary-400">{instanceDetails.vcpu} Cores</span>
                </div>
                <div className="flex justify-between">
                  <span>RAM:</span>
                  <span className="text-primary-400">{instanceDetails.memory} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span className="text-primary-400">{instanceDetails.storage}</span>
                </div>
                <div className="flex justify-between">
                  <span>OS:</span>
                  <span className="text-primary-400">{lab.os}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-primary-500/10">
            <div className="flex flex-col space-y-2">
              {/* First Row: Run and Preview buttons */}
              <div className="flex justify-between gap-2">
                {user?.result?.role !== 'user' && (
                  <button 
                    onClick={handleRun}
                    disabled={isRunning}
                    className="h-9 px-4 rounded-lg text-sm font-medium flex-1
                             bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30
                             transition-colors flex items-center justify-center
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isRunning ? 'Running...' : 'Run'}
                  </button>
                )}
                <button 
                  onMouseEnter={handlePreviewEnter}
                  onMouseLeave={() => setShowPreviewDetails(false)}
                  className="h-9 px-4 rounded-lg text-sm font-medium flex-1
                           bg-gradient-to-r from-primary-500 to-secondary-500
                           hover:from-primary-400 hover:to-secondary-400
                           transform hover:scale-105 transition-all duration-300
                           text-white shadow-lg shadow-primary-500/20
                           flex items-center justify-center whitespace-nowrap"
                >
                  {user?.result?.role === 'user' ? 'Buy Lab' : 'Preview'}
                </button>
              </div>

              {/* Second Row: Configure and VM-GoldenImage buttons */}
              {user?.result?.role !== 'user' && (
                <div className="flex justify-between gap-2">
                  <button
                    onClick={() => setIsConfigOpen(true)}
                    className="h-9 px-4 rounded-lg text-sm font-medium flex-1
                             bg-dark-300/50 hover:bg-dark-300
                             border border-primary-500/20 hover:border-primary-500/40
                             text-primary-400 hover:text-primary-300
                             transition-all duration-300 flex items-center justify-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </button>
                  <button 
                    onClick={handleVMGoldenImage}
                    disabled={isProcessing}
                    className="h-9 px-4 rounded-lg text-sm font-medium flex-1
                             bg-primary-500/20 text-primary-300 hover:bg-primary-500/30
                             transition-colors flex items-center justify-center whitespace-nowrap
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'VM-GoldenImage'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfigurationModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        lab={lab}
        instanceCost={numericValue}
        storageCost={storageCost}
      />
    </>
  );
};