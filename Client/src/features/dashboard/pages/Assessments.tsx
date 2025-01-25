import React from 'react';
import { GradientText } from '../../../components/ui/GradientText';

export const Assessments: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">
            <GradientText>Assessments</GradientText>
          </h1>
          <p className="mt-2 text-gray-400">
            Manage and monitor assessment environments
          </p>
        </div>
      </div>

      <div className="glass-panel p-8 text-center">
        <p className="text-gray-400">No assessments available</p>
      </div>
    </div>
  );
};