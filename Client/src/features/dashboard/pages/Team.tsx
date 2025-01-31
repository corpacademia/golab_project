import React, { useEffect, useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { UserFilters } from '../../../features/users/components/UserFilters';
import { UserStats } from '../../../features/users/components/UserStats';
import { UserList } from '../../../features/users/components/UserList';
import { User } from '../../../features/users/types';
import { UserPlus } from 'lucide-react';
import axios from 'axios';

export const Team: React.FC = () => {
  const [originalUsers, setOriginalUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [mockStats, setMockStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    trainers: 0,
    organizations: 0
  });

  const admin = JSON.parse(localStorage.getItem('auth') ?? '{}').result || {};

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/v1/getTeamMembers', {
          orgId: admin.organization_id
        });
        setOriginalUsers(response.data.data);
        setUsers(response.data.data);
        
        const totalUsers = response.data.data.length;
        const activeUsers = response.data.data.filter((u) => u.status === 'active').length;
        const trainers = response.data.data.filter((u) => u.role === 'trainer').length;
        
        setMockStats({
          ...mockStats,
          totalUsers,
          activeUsers,
          trainers,
          organizations: 1 // Since this is team view, we only have one organization
        });
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };
    getUsers();
  }, []);

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    dateRange: "",
  });

  const handleFilterChange = (update: { key: string; value: string }) => {
    const updatedFilters = { ...filters, [update.key]: update.value };
    setFilters(updatedFilters);
  };

  useEffect(() => {
    const filteredUsers = originalUsers.filter((user) => {
      const matchesSearch = !filters.search || 
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());
      const matchesRole = !filters.role || user.role === filters.role;
      const matchesStatus = !filters.status || user.status === filters.status;
      
      if (filters.dateRange) {
        const userDate = new Date(user.created_at);
        const [start, end] = filters.dateRange.split(',').map(date => new Date(date));
        if (userDate < start || userDate > end) return false;
      }
      
      return matchesSearch && matchesRole && matchesStatus;
    });
    setUsers(filteredUsers);
  }, [filters, originalUsers]);

  const handleViewDetails = (user: User) => {
    // Navigation is handled by the UserList component
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold">
          <GradientText>Team Members</GradientText>
        </h1>
        <button className="btn-primary">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team Member
        </button>
      </div>

      <UserStats stats={mockStats} />
      
      <UserFilters 
        onFilterChange={handleFilterChange} 
        filters={filters} 
        setFilters={setFilters}
      />
      
      <UserList 
        users={users}
        onViewDetails={handleViewDetails}
        hideOrganization={true}
      />
    </div>
  );
};