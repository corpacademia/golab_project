import React from 'react';
import { LabCard } from './LabCard';
import { useLabs } from '../../hooks/useLabs';

export const LabCatalogueGrid: React.FC = () => {
  const { labs, isLoading } = useLabs();

  if (isLoading) {
    return <div>Loading labs...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {labs.map(lab => (
        <LabCard key={lab.id} lab={lab} />
      ))}
    </div>
  );
};