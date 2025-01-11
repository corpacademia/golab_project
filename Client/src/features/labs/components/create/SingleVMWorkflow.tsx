import React, { useState } from 'react';
import { PlatformSelector } from './steps/PlatformSelector';
import { CloudProviderSelector } from './steps/CloudProviderSelector';
import { VMSizeSelector } from './steps/VMSizeSelector';
import { AIRecommendations } from './steps/AIRecommendations';
import { DeploymentStatus } from './steps/DeploymentStatus';
import { LabDetailsInput } from './steps/LabDetailsInput';
import { ChevronLeft } from 'lucide-react';

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

  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(prev => prev - 1);
    }
  };

  const getBackLabel = () => {
    switch (step) {
      case 1:
        return 'Back to Lab Types';
      case 2:
        return 'Back to Lab Details';
      case 3:
        return 'Back to Platform Selection';
      case 4:
        return 'Back to Cloud Provider';
      case 5:
        return 'Back to VM Configuration';
      case 6:
        return 'Back to AI Recommendations';
      default:
        return 'Back';
    }
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={handleBack}
        className="flex items-center text-gray-400 hover:text-primary-400 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {getBackLabel()}
      </button>

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