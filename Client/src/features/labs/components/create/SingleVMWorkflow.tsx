import React, { useState, useRef } from 'react';
import { PlatformSelector } from './steps/PlatformSelector';
import { CloudProviderSelector } from './steps/CloudProviderSelector';
import { VMSizeSelector } from './steps/VMSizeSelector';
import { AIRecommendations } from './steps/AIRecommendations';
import { DeploymentStatus } from './steps/DeploymentStatus';
import { LabDetailsInput } from './steps/LabDetailsInput';
import { DocumentUploader } from './steps/DocumentUploader';
import { DatacenterConfig } from './steps/DatacenterConfig';
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
    userGuides: [] as File[],
    datacenter: {
      numberOfUsers: 1,
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      protocol: 'rdp',
      users: [{ ip: '', port: '3389', username: '', password: '' }]
    }
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

    if (step >= 3) {
      if (config.platform === 'cloud') {
        breadcrumbs.push({ label: 'Cloud Provider', step: 3 });
      } else if (config.platform === 'datacenter') {
        breadcrumbs.push({ label: 'Datacenter Config', step: 3 });
      }
    }

    if (step >= 4) {
      if (config.platform === 'cloud') {
        breadcrumbs.push({ label: 'VM Configuration', step: 4 });
      } else if (config.platform === 'datacenter') {
        breadcrumbs.push({ label: 'Documents', step: 4 });
      } else {
        breadcrumbs.push({ label: 'VM Configuration', step: 4 });
      }
    }

    if (step >= 5) {
      if (config.platform === 'cloud') {
        breadcrumbs.push({ label: 'Documents', step: 5 });
      } else if (config.platform === 'datacenter') {
        breadcrumbs.push({ label: 'AI Recommendations', step: 5 });
      } else {
        breadcrumbs.push({ label: 'Documents', step: 5 });
      }
    }

    if (step >= 6) {
      if (config.platform === 'cloud') {
        breadcrumbs.push({ label: 'AI Recommendations', step: 6 });
      } else if (config.platform === 'datacenter') {
        breadcrumbs.push({ label: 'Deployment', step: 6 });
      } else {
        breadcrumbs.push({ label: 'AI Recommendations', step: 6 });
      }
    }

    if (step >= 7) {
      if (config.platform === 'cloud' || config.platform === 'hybrid') {
        breadcrumbs.push({ label: 'Deployment', step: 7 });
      }
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

  const handleDatacenterConfigChange = (datacenterConfig: typeof config.datacenter) => {
    setConfig(prev => ({ ...prev, datacenter: datacenterConfig }));
    setStep(prev => prev + 1);
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
        if (config.platform === 'cloud') {
          return (
            <CloudProviderSelector 
              onSelect={(provider) => updateConfig({ cloudProvider: provider })} 
            />
          );
        } else if (config.platform === 'datacenter') {
          return (
            <DatacenterConfig
              config={config.datacenter}
              onChange={handleDatacenterConfigChange}
            />
          );
        } else {
          return (
            <VMSizeSelector 
              onSelect={(size) => updateConfig({ vmSize: size })} 
            />
          );
        }
      case 4:
        if (config.platform === 'cloud') {
          return (
            <VMSizeSelector 
              onSelect={(size) => updateConfig({ vmSize: size })} 
            />
          );
        } else if (config.platform === 'datacenter') {
          return (
            <DocumentUploader
              onDocumentsChange={handleDocumentsChange}
              onUserGuidesChange={handleUserGuidesChange}
              onNext={() => setStep(prev => prev + 1)}
            />
          );
        } else {
          return (
            <DocumentUploader
              onDocumentsChange={handleDocumentsChange}
              onUserGuidesChange={handleUserGuidesChange}
              onNext={() => setStep(prev => prev + 1)}
            />
          );
        }
      case 5:
        if (config.platform === 'cloud') {
          return (
            <DocumentUploader
              onDocumentsChange={handleDocumentsChange}
              onUserGuidesChange={handleUserGuidesChange}
              onNext={() => setStep(prev => prev + 1)}
            />
          );
        } else if (config.platform === 'datacenter') {
          return (
            <AIRecommendations 
              config={config} 
              onConfirm={(region, responseData) => {
                const lab_id = responseData?.lab_id;
                updateConfig({ region, lab_id: lab_id });
              }}
            />
          );
        } else {
          return (
            <AIRecommendations 
              config={config} 
              onConfirm={(region, responseData) => {
                const lab_id = responseData?.lab_id;
                updateConfig({ region, lab_id: lab_id });
              }}
            />
          );
        }
      case 6:
        if (config.platform === 'cloud') {
          return (
            <AIRecommendations 
              config={config} 
              onConfirm={(region, responseData) => {
                const lab_id = responseData?.lab_id;
                updateConfig({ region, lab_id: lab_id });
              }}
            />
          );
        } else if (config.platform === 'datacenter') {
          return <DeploymentStatus config={config} />;
        } else {
          return <DeploymentStatus config={config} />;
        }
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