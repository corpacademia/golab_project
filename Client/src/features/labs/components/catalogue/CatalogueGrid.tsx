import React from 'react';
import { CatalogueCard } from './CatalogueCard';
import { Lab } from '../../types';

interface CatalogueGridProps {
  labs: Lab[];
  isLoading?: boolean;
}

export const CatalogueGrid: React.FC<CatalogueGridProps> = ({ labs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-dark-300/50 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {labs.map(lab => (
        <CatalogueCard key={lab.id} lab={lab} />
      ))}
    </div>
  );
};