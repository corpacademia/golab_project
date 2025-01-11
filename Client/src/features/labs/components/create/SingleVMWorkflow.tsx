import React, { useState } from 'react';
import { PlatformSelector } from './steps/PlatformSelector';
import { CloudProviderSelector } from './steps/CloudProviderSelector';
import { VMSizeSelector } from './steps/VMSizeSelector';
import { AIRecommendations } from './steps/AIRecommendations';
import { DeploymentStatus } from './steps/DeploymentStatus';
import { LabDetailsInput } from './steps/LabDetailsInput';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SingleVMWorkflowProps {
  onBack: () => void;
}

export const SingleVMWorkflow: React.FC<SingleVMWorkflowProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    title: '',
    description: '',
    duration: 60,
    platform: '',
    cloudProvider: '',
    vmSize: null,
    region: '',
  });

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setStep(prev => prev + 1);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Lab Details';
      case 2:
        return 'Platform Selection';
      case 3:
        return 'Cloud Provider';
      case 4:
        return 'VM Configuration';
      case 5:
        return 'AI Recommendations';
      case 6:
        return 'Deployment';
      default:
        return '';
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-gray-400">
        <button 
          onClick={handleBack}
          className="flex items-center hover:text-primary-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-primary-400">Lab Types</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-primary-400">Single VM</span>
        <ChevronRight className="h-4 w-4" />
        <span>{getStepTitle()}</span>
      </div>

      {step === 1 && (
        <LabDetailsInput 
          onNext={(details) => updateConfig(details)} 
        />
      )}
      {step === 2 && (
        <PlatformSelector 
          onSelect={(platform) => updateConfig({ platform })} 
        />
      )}
      {step === 3 && config.platform === 'cloud' && (
        <CloudProviderSelector 
          onSelect={(provider) => updateConfig({ cloudProvider: provider })} 
        />
      )}
      {step === 4 && (
        <VMSizeSelector 
          onSelect={(size) => updateConfig({ vmSize: size })} 
        />
      )}
      {step === 5 && (
        <AIRecommendations 
          config={config} 
          onConfirm={(region) => updateConfig({ region })} 
        />
      )}
      {step === 6 && <DeploymentStatus config={config} />}
    </div>
  );
};