import React, { useEffect, useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { UserFilters } from '../components/UserFilters';
import { UserStats } from '../components/UserStats';
import { UserList } from '../components/UserList';
import { BulkUploadModal } from '../components/BulkUploadModal';
import { AddUserModal } from '../components/AddUserModal';
import { User } from '../types';
import { Upload, UserPlus } from 'lucide-react';
import axios from 'axios';

// Mock users with consistent IDs
// const mockUsers: User[] = [
//   {
//     id: 'user-1', // Individual user
//     name: 'John Smith',
//     email: 'john.smith@example.com',
//     role: 'user',
//     status: 'active',
//     lastActive: new Date(),
//     createdAt: new Date('2024-01-15')
//   },
//   {
//     id: 'trainer-1', // Independent trainer
//     name: 'Sarah Johnson',
//     email: 'sarah.johnson@example.com',
//     role: 'trainer',
//     status: 'active',
//     lastActive: new Date(),
//     createdAt: new Date('2023-11-20')
//   },
//   {
//     id: 'orgadmin-1', // Training organization admin
//     name: 'Michael Chen',
//     email: 'michael.chen@techtraining.com',
//     role: 'orgadmin',
//     organization: 'TechTraining Solutions',
//     status: 'active',
//     lastActive: new Date(),
//     createdAt: new Date('2023-09-15')
//   },
//   {
//     id: 'orgadmin-2', // Educational institution admin
//     name: 'Dr. Patricia Williams',
//     email: 'p.williams@techuniversity.edu',
//     role: 'orgadmin',
//     organization: 'Tech University',
//     status: 'active',
//     lastActive: new Date(),
//     createdAt: new Date('2023-10-01')
//   }
// ];





export const UsersPage: React.FC = () => {
  const [originalUsers,setOriginalUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mockStats,setMockstats] = useState({
    totalUsers: 0,
          activeUsers: 0,
          trainers: 0,
          organizations: 0
  })

  useEffect(()=>{
    const getUsers=async ()=>{
      try{
        const response = await axios.get('http://localhost:3000/api/v1/allUsers')
        setOriginalUsers(response.data.data)
        setUsers(response.data.data)
         console.log(response.data.data)
          let  totalUsers = response.data.data.length
          let activeUsers = 1894
          let trainers = response.data.data.filter((u)=>(  u.role ==='trainer' )).length;
          const distinctOrganizations = new Set(
            response.data.data
              .map(org => org.organization)
              .filter(name => name !== null && name !== undefined) // Exclude null or undefined
          );
          let organizations = distinctOrganizations.size
          setMockstats({...mockStats,totalUsers,activeUsers,trainers,organizations})
        
      }
      catch(error){
        console.log(error)
      }
  }
  getUsers();
  },[])
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
  });
  const handleFilterChange = (update: { key: string; value: string }) => {
    const updatedFilters = { ...filters, [update.key]: update.value };
    setFilters(updatedFilters);
  }

  // Use useEffect to apply the filtering whenever the filters or users change
  useEffect(() => {
    const filteredUsers = originalUsers.filter((user) => {
      const matchesSearch =
        !filters.search || user.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesRole = !filters.role || user.role === filters.role;
      const matchesStatus = !filters.status || user.status === filters.status;
      return matchesSearch && matchesRole && matchesStatus;
    });
    setUsers(filteredUsers);
  }, [filters]); // Re-run this effect whenever filters change

  
 
  const handleViewDetails = (user: User) => {
    console.log('Viewing details for:', user);
  };

  const handleAddUser = async (userData: Omit<User, 'id' | 'lastActive' | 'createdAt'>) => {
    // const newUser: User = {
    //   id: `new-${Date.now()}`,
    //   ...userData,
    //   lastActive: new Date(),
    //   createdAt: new Date(),
    //   status: 'pending'
    // };
    
    // setUsers([...users, newUser]);
    // setIsAddModalOpen(false);
  };

  const handleBulkUpload = async (uploadedUsers: any[]) => {
    const newUsers = uploadedUsers.map((userData, index) => ({
      id: `bulk-${Date.now()}-${index}`,
      ...userData,
      lastActive: new Date(),
      createdAt: new Date(),
      status: 'pending' as const
    }));
    
    setUsers([...users, ...newUsers]);
    setIsUploadModalOpen(false);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold">
          <GradientText>Users</GradientText>
        </h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-secondary"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <UserStats stats={mockStats} />
      
      <UserFilters onFilterChange={handleFilterChange} filters={filters} setFilters={setFilters}/>
      
      <UserList 
        users={users}
        onViewDetails={handleViewDetails}
      />

      <BulkUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleBulkUpload}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddUser}
      />
    </div>
  );
};