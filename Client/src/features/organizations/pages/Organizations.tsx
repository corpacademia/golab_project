import React, { useEffect, useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { OrganizationList } from '../components/OrganizationList';
import { OrganizationFilters } from '../components/OrganizationFilters';
import { OrganizationStats } from '../components/OrganizationStats';
import { Organization } from '../types';
import { useOrganizationFilters } from '../hooks/useOrganizationFilters';
import { AddOrganizationModal } from '../components/AddOrganizationModal';
import axios from 'axios';

export const Organizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { filters, filterOrganizations, handleFilterChange } = useOrganizationFilters(organizations);
  
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeUsers: 0,
    totalLabs: 0,
    monthlyRevenue: 0
  });

  const admin = JSON.parse(localStorage.getItem('auth') ?? '{}').result || {};

  const fetchOrganizations = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/v1/getOrganizations', {
        admin_id: admin.id
      });

      if (response.data.success) {
        setOrganizations(response.data.data || []);
        
        // Update stats
        const orgData = response.data.data || [];
        setStats({
          totalOrganizations: orgData.length,
          activeUsers: orgData.reduce((acc: number, org: any) => acc + (org.usersCount || 0), 0),
          totalLabs: orgData.reduce((acc: number, org: any) => acc + (org.labsCount || 0), 0),
          monthlyRevenue: orgData.reduce((acc: number, org: any) => acc + (org.revenue || 0), 0)
        });
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [admin.id]);

  const filteredOrganizations = filterOrganizations(organizations);

  const handleViewDetails = (org: Organization) => {
    // Navigate to organization details page
    console.log('Viewing details for:', org);
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
          Add Organization
        </button>
      </div>

      <OrganizationStats stats={stats} />
      
      <OrganizationFilters 
        onFilterChange={handleFilterChange}
        filters={filters}
        setFilters={() => {}}
      />
      
      <OrganizationList 
        organizations={filteredOrganizations}
        onViewDetails={handleViewDetails}
      />

      <AddOrganizationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchOrganizations}
      />
    </div>
  );
};