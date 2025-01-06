import React from 'react';
import { LabCard } from '../LabCard';
import { useLabs } from '../../hooks/useLabs';

export const LabCatalogueGrid: React.FC = () => {
  const { labs, isLoading } = useLabs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-panel animate-pulse border border-primary-500/10 rounded-xl">
            <div className="h-32 bg-dark-300/50 rounded-lg mb-4"></div>
            <div className="h-4 bg-dark-300/50 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-dark-300/50 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {labs.map(lab => (
        <div key={lab.id} className="border border-primary-500/10 rounded-xl hover:border-primary-500/30 transition-colors duration-300">
          <LabCard lab={lab} />
        </div>
      ))}
    </div>
  );
};