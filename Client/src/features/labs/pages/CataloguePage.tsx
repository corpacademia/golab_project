import React from 'react';
import { CatalogueLayout } from '../components/catalogue/CatalogueLayout';
import { LabCatalogueFilters } from '../components/catalogue/LabCatalogueFilters';
import { CatalogueGrid } from '../components/catalogue/CatalogueGrid';
import { useLabs } from '../hooks/useLabs';

export const CataloguePage: React.FC = () => {
  const { labs, isLoading } = useLabs();

  return (
    <CatalogueLayout>
      <div className="space-y-6">
        <LabCatalogueFilters />
        <CatalogueGrid labs={labs} isLoading={isLoading} />
      </div>
    </CatalogueLayout>
  );
};