import React, { useState, useRef } from 'react';
import { PlatformSelector } from './steps/PlatformSelector';
import { CloudProviderSelector } from './steps/CloudProviderSelector';
import { VMSizeSelector } from './steps/VMSizeSelector';
import { AIRecommendations } from './steps/AIRecommendations';
import { DeploymentStatus } from './steps/DeploymentStatus';
import { LabDetailsInput } from './steps/LabDetailsInput';
import { ChevronLeft, ChevronRight, Upload, X, FileText, AlertCircle } from 'lucide-react';

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
  const [documents, setDocuments] = useState<File[]>([]);
  const [userGuides, setUserGuides] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const guideInputRef = useRef<HTMLInputElement>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);

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
      breadcrumbs.push({ label: 'AI Recommendations', step: 5 });
    }

    if (step >= 6) {
      breadcrumbs.push({ label: 'Deployment', step: 6 });
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

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'guide') => {
    setDocumentError(null);
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    
    // Validate file types
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setDocumentError('Only PDF and Word documents are allowed');
       setTimeout(() => setDocumentError(null), 5000);
      return;
    }
    
    // Validate file sizes (1GB limit)
    const oversizedFiles = files.filter(file => file.size > 1 * 1024 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setDocumentError('Files must be smaller than 1GB');
       setTimeout(() => setDocumentError(null), 5000);
      return;
    }
    
    if (type === 'document') {
      setDocuments(prev => [...prev, ...files]);
    } else {
      setUserGuides(prev => [...prev, ...files]);
    }
  };

  const handleRemoveDocument = (index: number, type: 'document' | 'guide') => {
    if (type === 'document') {
      setDocuments(prev => prev.filter((_, i) => i !== index));
    } else {
      setUserGuides(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, type: 'document' | 'guide') => {
    e.preventDefault();
    e.stopPropagation();
    setDocumentError(null);
    
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    
    const files = Array.from(e.dataTransfer.files);
    
    // Validate file types
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setDocumentError('Only PDF and Word documents are allowed');
       setTimeout(() => setDocumentError(null), 5000);
      return;
    }
    
    // Validate file sizes (1GB limit)
    const oversizedFiles = files.filter(file => file.size > 1 * 1024 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setDocumentError('Files must be smaller than 1GB');
       setTimeout(() => setDocumentError(null), 5000);
      return;
    }
    
    if (type === 'document') {
      setDocuments(prev => [...prev, ...files]);
    } else {
      setUserGuides(prev => [...prev, ...files]);
    }
  };

  const renderDocumentUploader = (type: 'document' | 'guide') => {
    const files = type === 'document' ? documents : userGuides;
    const inputRef = type === 'document' ? fileInputRef : guideInputRef;
    const title = type === 'document' ? 'Lab Documents' : 'User Guides';
    const description = type === 'document' 
      ? 'Upload lab materials, exercises, and reference documents' 
      : 'Upload user guides and instructions for lab participants';

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-400 mb-3">{title}</h3>
        <div 
          className="border-2 border-dashed border-primary-500/20 rounded-lg p-6 mb-4 hover:border-primary-500/40 transition-colors"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, type)}
        >
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-primary-400/50 mb-4" />
            <input
              type="file"
              ref={inputRef}
              onChange={(e) => handleDocumentUpload(e, type)}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              Upload files
            </button>
            <p className="mt-2 text-sm text-gray-400">
              or drag and drop
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {description}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PDF, DOC, DOCX up to 1GB
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-400">Uploaded files:</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-300/50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-primary-400 mr-2" />
                  <span className="text-sm text-gray-300 truncate max-w-md">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({(file.size / (1024 * 1024) ).toFixed(1)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDocument(index, type)}
                  className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-400">Lab Documents</h2>
            <p className="text-gray-400">
              Upload documents and guides for your lab environment. These will be available to users during the lab session.
            </p>
            
            {documentError && (
              <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-200" />
                  <span className="text-white-600">{documentError}</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {renderDocumentUploader('document')}
              </div>
              <div className="space-y-4">
                {renderDocumentUploader('guide')}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                className="btn-primary"
                onClick={() => {
                  // Add documents to config
                  const updatedConfig = {
                    ...config,
                    documents,
                    userGuides
                  };
                  setConfig(updatedConfig);
                  setStep(prev => prev + 1);
                }}
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        );
      case 5:
        return config.platform === 'cloud' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-400">Lab Documents</h2>
            <p className="text-gray-400">
              Upload documents and guides for your lab environment. These will be available to users during the lab session.
            </p>
            
            {documentError && (
              <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <span className="text-red-200">{documentError}</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {renderDocumentUploader('document')}
              </div>
              <div className="space-y-4">
                {renderDocumentUploader('guide')}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                className="btn-primary"
                onClick={() => {
                  // Add documents to config
                  const updatedConfig = {
                    ...config,
                    documents,
                    userGuides
                  };
                  setConfig(updatedConfig);
                  setStep(prev => prev + 1);
                }}
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
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