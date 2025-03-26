import React, { useState } from 'react';
import { PlatformSelector } from './steps/PlatformSelector';
import { CloudProviderSelector } from './steps/CloudProviderSelector';
import { CloudSliceConfig } from './steps/CloudSliceConfig';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CloudSliceWorkflowProps {
  onBack: () => void;
  labDetails: {
    title: string;
    description: string;
    duration: number;
  };
}

export const CloudSliceWorkflow: React.FC<CloudSliceWorkflowProps> = ({ 
  onBack,
  labDetails 
}) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    platform: '',
    cloudProvider: '',
    region: '',
    services: [],
    duration: {
      start: '',
      end: ''
    },
    cleanupPolicy: '1'
  });

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setStep(prev => prev + 1);
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Lab Types', step: 0 },
      { label: 'Platform Selection', step: 1 },
      { label: 'Cloud Provider', step: 2 },
      { label: 'Service Configuration', step: 3 }
    ];

    return breadcrumbs.slice(0, step + 1);
  };

  const handleNavigate = (targetStep: number) => {
    if (targetStep === 0) {
      onBack();
    } else if (targetStep < step) {
      setStep(targetStep);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap gap-2 text-gray-400">
        {getBreadcrumbs().map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
            <button
              onClick={() => handleNavigate(item.step)}
              className={`flex items-center ${
                item.step < step 
                  ? 'text-primary-400 hover:text-primary-300' 
                  : 'text-gray-300'
              } transition-colors`}
            >
              {item.step === 0 && <ChevronLeft className="h-4 w-4 mr-1" />}
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <PlatformSelector 
          onSelect={(platform) => updateConfig({ platform })} 
        />
      )}
      {step === 2 && (
        <CloudProviderSelector 
          onSelect={(provider) => updateConfig({ cloudProvider: provider })} 
        />
      )}
      {step === 3 && (
        <CloudSliceConfig 
          onBack={() => setStep(2)}
          labDetails={labDetails}
        />
      )}
    </div>
  );
};