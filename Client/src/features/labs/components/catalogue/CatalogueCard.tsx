import React, { useState, useEffect } from 'react';
import { Clock, Tag, BookOpen, Star, Cpu, Settings, Play } from 'lucide-react';
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
  const user = JSON.parse(localStorage.getItem('auth') || '{}');

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
    try {
      const response = await axios.post('http://localhost:3000/api/v1/run', {
        lab_id: lab.lab_id,
        admin_id: user.result.id
      });
      
      if (response.data.success) {
        setIsRunning(true);
      }
    } catch (error) {
      console.error("Error running lab:", error);
    }
  };

  const handleGoldenImage = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/v1/createGoldenImage', {
        lab_id: lab.lab_id,
        admin_id: user.result.id
      });
      
      if (response.data.success) {
        console.log('Golden image created successfully');
      }
    } catch (error) {
      console.error("Error creating golden image:", error);
    }
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
  const totalCost = numericValue + storageCost;

  return (
    <div className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                    hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                    transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                    hover:translate-y-[-2px] group relative">
      <div className="p-4 flex flex-col h-full">
        {/* Header */}
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

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
            {lab.provider}
          </span>
          {lab.technologies?.map((tech) => (
            <span key={tech} className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
              {tech}
            </span>
          ))}
        </div>

        {/* Metrics */}
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

        {/* Preview Section */}
        {showPreviewDetails && instanceDetails && user?.result?.role !== 'user' && (
          <div className="fixed transform translate-x-full right-0 top-1/2 -translate-y-1/2 z-50 w-80 
                        bg-dark-200/95 backdrop-blur-sm border border-primary-500/20 
                        rounded-lg p-4 shadow-lg ml-4">
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
              <div className="flex justify-between">
                <span>Total Cost:</span>
                <span className="text-primary-400">${totalCost.toFixed(2)}/hr</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 border-t border-primary-500/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsConfigOpen(true)}
                className="px-3 py-2 rounded-lg text-sm font-medium
                         bg-dark-300/50 hover:bg-dark-300
                         border border-primary-500/20 hover:border-primary-500/40
                         text-primary-400 hover:text-primary-300
                         transition-all duration-300 flex items-center justify-center"
              >
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </button>
              {user?.result?.role !== 'user' && (
                <button 
                  onClick={handleGoldenImage}
                  className="px-3 py-2 rounded-lg text-sm font-medium
                           bg-primary-500/20 text-primary-300 hover:bg-primary-500/30
                           transition-colors flex items-center justify-center"
                >
                  VM-GoldenImage
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {user?.result?.role !== 'user' && (
                <button 
                  onClick={handleRun}
                  disabled={isRunning}
                  className="px-3 py-2 rounded-lg text-sm font-medium
                           bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30
                           transition-colors flex items-center justify-center"
                >
                  <Play className="h-4 w-4 mr-1" />
                  {isRunning ? 'Running...' : 'Run'}
                </button>
              )}
              <button 
                onMouseEnter={() => setShowPreviewDetails(true)}
                onMouseLeave={() => setShowPreviewDetails(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium
                         bg-gradient-to-r from-primary-500 to-secondary-500
                         hover:from-primary-400 hover:to-secondary-400
                         transform hover:scale-105 transition-all duration-300
                         text-white shadow-lg shadow-primary-500/20"
              >
                {user?.result?.role === 'user' ? 'Buy Lab' : 'Preview'}
              </button>
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
    </div>
  );
};