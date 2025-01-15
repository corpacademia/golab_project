import React, { useState, useEffect } from 'react';
import { Clock, Tag, BookOpen, Star, Cpu, Settings, Play, Image } from 'lucide-react';
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
  const [isGoldenImageReady, setIsGoldenImageReady] = useState(false);
  const user = JSON.parse(localStorage.getItem('auth') || '{}');

  // Calculate storage cost
  const storageCost = 0.08 * (lab.storage);

  // Fetch instance details when component mounts
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

  // Function to get price based on OS
  const getPriceByOS = (instance, os) => {
    if(lab.provider === 'aws'){
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
    }
    else if(lab.provider === 'azure'){
      switch(os.toLowerCase()){
        case 'windows':
          return instance.windows
        case 'linux':
          return instance.linux_vm_price
        default:
          return 0;
      }
    }
  };

  const handleRun = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/v1/runLab', {
        labId: lab.lab_id,
        userId: user?.result?.id
      });

      if (response.data.success) {
        setIsGoldenImageReady(true);
        // You can add additional handling here based on the response
      }
    } catch (error) {
      console.error("Error running lab:", error);
    }
  };

  return (
    <>
      <div className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                    hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                    transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                    hover:translate-y-[-2px] group">
        {/* ... existing card content ... */}
        
        <div className="mt-auto pt-3 border-t border-primary-500/10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setIsConfigOpen(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium
                         bg-dark-300/50 hover:bg-dark-300
                         border border-primary-500/20 hover:border-primary-500/40
                         text-primary-400 hover:text-primary-300
                         transition-all duration-300"
              >
                <Settings className="h-4 w-4 inline-block mr-2" />
                Convert Catalogue
              </button>
              
              <button
                onClick={handleRun}
                className="px-4 py-2 rounded-lg text-sm font-medium
                         bg-accent-500/20 hover:bg-accent-500/30
                         border border-accent-500/20 hover:border-accent-500/40
                         text-accent-300 hover:text-accent-200
                         transition-all duration-300"
              >
                <Play className="h-4 w-4 inline-block mr-2" />
                Run
              </button>

              {isGoldenImageReady && (
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium
                           bg-secondary-500/20 hover:bg-secondary-500/30
                           border border-secondary-500/20 hover:border-secondary-500/40
                           text-secondary-300 hover:text-secondary-200
                           transition-all duration-300"
                >
                  <Image className="h-4 w-4 inline-block mr-2" />
                  VM-GoldenImage
                </button>
              )}
            </div>

            <div className="relative">
              <button 
                onMouseEnter={() => setShowPreviewDetails(true)}
                onMouseLeave={() => setShowPreviewDetails(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium
                         bg-gradient-to-r from-primary-500 to-secondary-500
                         hover:from-primary-400 hover:to-secondary-400
                         transform hover:scale-105 transition-all duration-300
                         text-white shadow-lg shadow-primary-500/20"
              >
                {user?.result?.role === 'user' ? 'Launch Lab' : 'Preview'}
              </button>
              
              {showPreviewDetails && instanceDetails && user?.result?.role !== 'user' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64
                              bg-dark-200/95 backdrop-blur-sm border border-primary-500/20 
                              rounded-lg p-3 shadow-lg text-sm z-50">
                  {/* ... existing preview details ... */}
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
        instanceCost={instanceCost}
        storageCost={storageCost}
      />
    </>
  );
};