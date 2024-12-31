import React, { useState } from 'react';
import { PlatformSelector } from './steps/PlatformSelector';
import { CloudProviderSelector } from './steps/CloudProviderSelector';
import { VMSizeSelector } from './steps/VMSizeSelector';
import { AIRecommendations } from './steps/AIRecommendations';
import { DeploymentStatus } from './steps/DeploymentStatus';
import { ChevronLeft } from 'lucide-react';

interface SingleVMWorkflowProps {
  onBack: () => void;
}

export const SingleVMWorkflow: React.FC<SingleVMWorkflowProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    platform: '',
    cloudProvider: '',
    vmSize: null,
    region: '',
  });

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setStep(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-400 hover:text-primary-400 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Lab Types
      </button>

      {step === 1 && <PlatformSelector onSelect={(platform) => updateConfig({ platform })} />}
      {step === 2 && config.platform === 'cloud' && (
        <CloudProviderSelector onSelect={(provider) => updateConfig({ cloudProvider: provider })} />
      )}
      {step === 3 && <VMSizeSelector onSelect={(size) => updateConfig({ vmSize: size })} />}
      {step === 4 && <AIRecommendations config={config} onConfirm={(region) => updateConfig({ region })} />}
      {step === 5 && <DeploymentStatus config={config} />}
    </div>
  );
};