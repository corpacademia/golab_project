import React, { useState, useEffect } from 'react';
import { GradientText } from '../../../../components/ui/GradientText';
import { 
  UserPlus, 
  Upload, 
  Trash2, 
  MoreVertical, 
  Eye, 
  Pencil,
  Check,
  X,
  Loader,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

interface OrgUsersTabProps {
  orgId: string;
}

export const OrgUsersTab: React.FC<OrgUsersTabProps> = ({ orgId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [orgId]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/getUsersFromOrganization/${orgId}`);
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedUsers.length) return;

    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.delete(`http://localhost:3000/api/v1/organization/${orgId}/users`, {
        data: { userIds: selectedUsers }
      });

      if (response.data.success) {
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
        setSelectedUsers([]);
        setSuccess('Selected users deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete users');
      }
    } catch (err) {
      setError('Failed to delete selected users');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditUser = async (userId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/organization/${orgId}/users/${userId}`);
      if (response.data.success) {
        // Open edit modal with user data
        console.log('Edit user:', response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch user details');
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/organization/${orgId}/users/${userId}`);
      if (response.data.success) {
        // Open view modal with user data
        console.log('View user:', response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch user details');
    }
  };

  const handleImportUsers = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`http://localhost:3000/api/v1/organization/${orgId}/users/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Users imported successfully');
        fetchUsers(); // Refresh user list
      } else {
        throw new Error(response.data.message || 'Failed to import users');
      }
    } catch (err) {
      setError('Failed to import users');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          <GradientText>Users & Admins</GradientText>
        </h2>
        <div className="flex space-x-4">
          {selectedUsers.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="btn-secondary text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </button>
          )}
          <label className="btn-secondary cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleImportUsers(e.target.files[0])}
            />
            <Upload className="h-4 w-4 mr-2" />
            Import Users
          </label>
          <button className="btn-primary">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-emerald-400" />
            <span className="text-emerald-200">{success}</span>
          </div>
        </div>
      )}

      <div className="glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-primary-500/10">
                <th className="pb-4 pl-4">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedUsers.length === users.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-400 text-primary-500 focus:ring-primary-500"
                  />
                </th>
                <th className="pb-4">Name</th>
                <th className="pb-4">Role</th>
                <th className="pb-4">Email</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Last Active</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.id}
                  className="border-b border-primary-500/10 hover:bg-dark-300/50 transition-colors"
                >
                  <td className="py-4 pl-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-400 text-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-400">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-200">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'bg-secondary-500/20 text-secondary-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 text-gray-300">{user.email}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 text-gray-400">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleViewUser(user.id)}
                        className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4 text-primary-400" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                      >
                        <Pencil className="h-4 w-4 text-primary-400" />
                      </button>
                      <button
                        onClick={() => handleSelectUser(user.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                      <button className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};