import React, { useState } from 'react';
import { CatalogueLayout } from '../components/catalogue/CatalogueLayout';
import { LabCatalogueFilters } from '../components/catalogue/LabCatalogueFilters';
import { OrgAdminCatalogueCard } from '../components/catalogue/OrgAdminCatalogueCard';
import { AssignUsersModal } from '../components/catalogue/AssignUsersModal';
import { Lab } from '../types';

export const OrgAdminCataloguePage: React.FC = () => {
  // Mock data - In real implementation, this would come from your API
  const mockLabs: Lab[] = [
    {
      id: '1',
      title: 'AWS Solutions Architect Lab',
      description: 'Learn to design scalable cloud architectures',
      type: 'catalogue',
      duration: 120,
      price: 49.99,
      technologies: ['AWS', 'Cloud Architecture'],
      status: 'available',
      rating: 4.8,
      prerequisites: ['Basic AWS knowledge', 'Cloud fundamentals']
    },
    {
      id: '2',
      title: 'Kubernetes Mastery',
      description: 'Master container orchestration with Kubernetes',
      type: 'catalogue',
      duration: 180,
      price: 79.99,
      technologies: ['Kubernetes', 'Docker', 'Container Orchestration'],
      status: 'available',
      rating: 4.9,
      prerequisites: ['Docker basics', 'Linux fundamentals']
    }
  ];

  const [filteredLabs, setFilteredLabs] = useState(mockLabs);
  const [filters, setFilters] = useState({
    search: '',
    technology: '',
    level: ''
  });
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleFilterChange = (update: { key: string; value: string }) => {
    const updatedFilters = { ...filters, [update.key]: update.value };
    setFilters(updatedFilters);

    // Apply filters
    const filtered = mockLabs.filter(lab => {
      const matchesSearch = !updatedFilters.search || 
        lab.title.toLowerCase().includes(updatedFilters.search.toLowerCase()) ||
        lab.description.toLowerCase().includes(updatedFilters.search.toLowerCase());
      
      const matchesTech = !updatedFilters.technology || 
        lab.technologies.some(tech => 
          tech.toLowerCase().includes(updatedFilters.technology.toLowerCase())
        );
      
      return matchesSearch && matchesTech;
    });

    setFilteredLabs(filtered);
  };

  const handleAssignUsers = (lab: Lab) => {
    setSelectedLab(lab);
    setIsAssignModalOpen(true);
  };

  return (
    <CatalogueLayout>
      <div className="space-y-6">
        <LabCatalogueFilters 
          onFilterChange={handleFilterChange} 
          filters={filters}
          setFilters={setFilters}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLabs.map(lab => (
            <OrgAdminCatalogueCard 
              key={lab.id} 
              lab={lab}
              onAssignUsers={handleAssignUsers}
            />
          ))}
        </div>

        <AssignUsersModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedLab(null);
          }}
          lab={selectedLab}
        />
      </div>
    </CatalogueLayout>
  );
};