import React, { useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { OrganizationList } from '../components/OrganizationList';
import { OrganizationFilters } from '../components/OrganizationFilters';
import { OrganizationStats } from '../components/OrganizationStats';
import { AddOrganizationModal } from '../components/AddOrganizationModal';
import { Organization } from '../types';
import { useOrganizationFilters } from '../hooks/useOrganizationFilters';
import { Plus } from 'lucide-react';

// Mock data - Replace with API calls
const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    type: 'enterprise',
    status: 'active',
    contactEmail: 'admin@techcorp.com',
    usersCount: 250,
    labsCount: 45,
    subscriptionTier: 'enterprise',
    createdAt: new Date('2023-01-15'),
    lastActive: new Date('2024-03-10')
  },
  {
    id: '2',
    name: 'EduTech Institute',
    type: 'education',
    status: 'active',
    contactEmail: 'info@edutech.edu',
    usersCount: 1500,
    labsCount: 120,
    subscriptionTier: 'professional',
    createdAt: new Date('2023-03-20'),
    lastActive: new Date('2024-03-11')
  },
  {
    id: '3',
    name: 'CloudSkills Academy',
    type: 'training',
    status: 'pending',
    contactEmail: 'support@cloudskills.io',
    usersCount: 800,
    labsCount: 75,
    subscriptionTier: 'professional',
    createdAt: new Date('2023-06-10'),
    lastActive: new Date('2024-03-09')
  }
];

const mockStats = {
  totalOrganizations: 24,
  activeUsers: 2500,
  totalLabs: 450,
  monthlyRevenue: 128500
};

export const Organizations: React.FC = () => {
  const [organizations] = useState(mockOrganizations);
  const { filters, filterOrganizations, handleFilterChange } = useOrganizationFilters(organizations);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredOrganizations = filterOrganizations(organizations);

  const handleViewDetails = (org: Organization) => {
    console.log('Viewing details for:', org);
    // TODO: Implement organization details view
  };

  const handleAddSuccess = () => {
    // TODO: Refresh organizations list
    console.log('Organization added successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold">
          <GradientText>Organizations</GradientText>
        </h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </button>
      </div>

      <OrganizationStats stats={mockStats} />
      
      <OrganizationFilters 
        onFilterChange={handleFilterChange} 
        filters={filters} 
        setFilters={setFilters}
      />
      
      <OrganizationList 
        organizations={filteredOrganizations}
        onViewDetails={handleViewDetails}
      />

      <AddOrganizationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};