import React from 'react';
import { LabCatalogueFilters } from '../components/catalogue/LabCatalogueFilters';
import { LabCatalogueGrid } from '../components/catalogue/LabCatalogueGrid';
import { LearningPathSidebar } from '../components/catalogue/LearningPathSidebar';
import { GradientText } from '../../../components/ui/GradientText';
import { Brain } from 'lucide-react';

export const CataloguePage: React.FC = () => {
  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">
              <GradientText>Lab Catalogue</GradientText>
            </h1>
            <p className="mt-2 text-gray-400">
              Browse our collection of hands-on labs and learning paths
            </p>
          </div>
          <button className="btn-primary">
            <Brain className="h-4 w-4 mr-2" />
            Get AI Recommendations
          </button>
        </div>

        <LabCatalogueFilters />
        <LabCatalogueGrid />
      </div>

      <LearningPathSidebar />
    </div>
  );
};