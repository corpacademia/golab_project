import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';

interface UserFilterUpdate {
  key: string; // Restrict key to valid filter fields
  value: string; // The value associated with the key
}


interface UserFiltersProps {
  onFilterChange: (update: UserFilterUpdate) => void;
  setFilters: (filters: { [key: string]: string }) => void; // Function to update filters
  filters: { [key: string]: string }; // Current filters passed from the parent
}
  


export const UserFilters: React.FC<UserFiltersProps> = ({ onFilterChange,filters,setFilters }) => {

// Handle input changes dynamically
const handleInputChange = (key: string, value: string) => {
  onFilterChange({ key, value }); // Pass key and value to onFilterChange
};

  return (
    <div className="glass-panel mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg 
                     text-gray-300 placeholder-gray-500 focus:border-primary-500/40 focus:outline-none 
                     focus:ring-2 focus:ring-primary-500/20 transition-colors"
           // Assuming filters is an object like { search: '', role: '', status: '' }
           onChange={(e)=>{handleInputChange('search',e.target.value) }}

          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
        </div>

        <div className="flex flex-wrap gap-4">
          <select
            className="px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg 
                     text-gray-300 focus:border-primary-500/40 focus:outline-none 
                     focus:ring-2 focus:ring-primary-500/20 transition-colors"
            onChange={(e)=>{handleInputChange("role",e.target.value) }}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="trainer">Trainer</option>
            <option value="orgadmin">Organization Admin</option>
          </select>

          <select
            className="px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg 
                     text-gray-300 focus:border-primary-500/40 focus:outline-none 
                     focus:ring-2 focus:ring-primary-500/20 transition-colors"
            onChange={(e)=>{handleInputChange('status',e.target.value) }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>

          <button className="btn-secondary">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </button>

          <button className="btn-secondary">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>
    </div>
  );
};