import React, { useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { LabTypeSelector } from '../components/create/LabTypeSelector';
import { SingleVMWorkflow } from '../components/create/SingleVMWorkflow';
import { CloudSliceWorkflow } from '../components/create/CloudSliceWorkflow';
import { LabDetailsInput } from '../components/create/steps/LabDetailsInput';
import { LabType } from '../types';

export const CreateLabEnvironment: React.FC = () => {
  const [selectedType, setSelectedType] = useState<LabType | null>(null);
  const [labDetails, setLabDetails] = useState<{
    title: string;
    description: string;
    duration: number;
  } | null>(null);

  const handleLabDetails = (details: { title: string; description: string; duration: number }) => {
    setLabDetails(details);
  };

  const renderWorkflow = () => {
    if (!labDetails) {
      return <LabDetailsInput onNext={handleLabDetails} />;
    }

    if (!selectedType) {
      return <LabTypeSelector onSelect={setSelectedType} />;
    }

    switch (selectedType) {
      case 'single-vm':
        return (
          <SingleVMWorkflow 
            onBack={() => setSelectedType(null)} 
            labDetails={labDetails}
          />
        );
      case 'cloud-slice':
        return (
          <CloudSliceWorkflow 
            onBack={() => setSelectedType(null)}
            labDetails={labDetails}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">
            <GradientText>Create Lab Environment</GradientText>
          </h1>
          <p className="mt-2 text-gray-400">
            Configure and provision new lab environments
          </p>
        </div>
      </div>

      {renderWorkflow()}
    </div>
  );
};