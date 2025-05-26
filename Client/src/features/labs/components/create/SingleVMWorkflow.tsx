import React, { useState, useRef } from 'react';
import { PlatformSelector } from './steps/PlatformSelector';
import { CloudProviderSelector } from './steps/CloudProviderSelector';
import { VMSizeSelector } from './steps/VMSizeSelector';
import { AIRecommendations } from './steps/AIRecommendations';
import { DeploymentStatus } from './steps/DeploymentStatus';
import { LabDetailsInput } from './steps/LabDetailsInput';
import { DocumentUploader } from './steps/DocumentUploader';
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
    documents: [] as File[],
    userGuides: [] as File[]
  });

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setStep(prev => prev + 1);
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Lab Types', step: 0 },
      { label: 'Lab Details', step: 1 },
      { label: 'Platform Selection', step: 2 },
    ];

    if (step >= 3 && config.platform === 'cloud') {
      breadcrumbs.push({ label: 'Cloud Provider', step: 3 });
    }

    if (step >= 4) {
      breadcrumbs.push({ label: 'VM Configuration', step: 4 });
    }

    if (step >= 5) {
      breadcrumbs.push({ label: 'Documents', step: 5 });
    }

    if (step >= 6) {
      breadcrumbs.push({ label: 'AI Recommendations', step: 6 });
    }

    if (step >= 7) {
      breadcrumbs.push({ label: 'Deployment', step: 7 });
    }

    return breadcrumbs.slice(0, step + 1);
  };

  const handleNavigate = (targetStep: number) => {
    if (targetStep === 0) {
      onBack();
    } else if (targetStep < step) {
      setStep(targetStep);
    }
  };

  const handleDocumentsChange = (documents: File[]) => {
    setConfig(prev => ({ ...prev, documents }));
  };

  const handleUserGuidesChange = (userGuides: File[]) => {
    setConfig(prev => ({ ...prev, userGuides }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <LabDetailsInput 
            onNext={(details) => updateConfig(details)} 
          />
        );
      case 2:
        return (
          <PlatformSelector 
            onSelect={(platform) => updateConfig({ platform })} 
          />
        );
      case 3:
        return config.platform === 'cloud' ? (
          <CloudProviderSelector 
            onSelect={(provider) => updateConfig({ cloudProvider: provider })} 
          />
        ) : (
          <VMSizeSelector 
            onSelect={(size) => updateConfig({ vmSize: size })} 
          />
        );
      case 4:
        return config.platform === 'cloud' ? (
          <VMSizeSelector 
            onSelect={(size) => updateConfig({ vmSize: size })} 
          />
        ) : (
          <DocumentUploader
            onDocumentsChange={handleDocumentsChange}
            onUserGuidesChange={handleUserGuidesChange}
          />
        );
      case 5:
        return config.platform === 'cloud' ? (
          <DocumentUploader
            onDocumentsChange={handleDocumentsChange}
            onUserGuidesChange={handleUserGuidesChange}
          />
        ) : (
          <AIRecommendations 
            config={config} 
            onConfirm={(region, responseData) => {
              const lab_id = responseData?.lab_id;
              updateConfig({ region, lab_id: lab_id });
            }}
          />
        );
      case 6:
        return config.platform === 'cloud' ? (
          <AIRecommendations 
            config={config} 
            onConfirm={(region, responseData) => {
              const lab_id = responseData?.lab_id;
              updateConfig({ region, lab_id: lab_id });
            }}
          />
        ) : (
          <DeploymentStatus config={config} />
        );
      case 7:
        return <DeploymentStatus config={config} />;
      default:
        return null;
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

      {renderStep()}
    </div>
  );
};