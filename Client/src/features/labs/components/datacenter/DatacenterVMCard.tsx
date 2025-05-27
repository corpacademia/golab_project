import React, { useState } from 'react';
import { 
  Server, 
  Users, 
  Calendar, 
  Clock, 
  Pencil, 
  Trash2, 
  Plus, 
  X, 
  Check, 
  AlertCircle, 
  Loader,
  Link as LinkIcon,
  Power,
  Eye,
  EyeOff
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import axios from 'axios';

interface DatacenterVM {
  id: string;
  title: string;
  description: string;
  platform: string;
  protocol: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'pending';
  users: Array<{
    id: string;
    username: string;
    password: string;
    ip: string;
    port: string;
  }>;
}

interface DatacenterVMCardProps {
  vm: DatacenterVM;
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: Array<{
    id: string;
    username: string;
    password: string;
    ip: string;
    port: string;
  }>;
  vmId: string;
  vmTitle: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    username: string;
    password: string;
    ip: string;
    port: string;
  };
  vmId: string;
  onSave: (userData: any) => Promise<void>;
}

const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, users, vmId, vmTitle }) => {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (userData: any) => {
    try {
      // API call to update user
      const response = await axios.post(`http://localhost:3000/api/v1/lab_ms/updateDatacenterUser`, {
        vmId,
        userId: userData.id,
        username: userData.username,
        password: userData.password,
        ip: userData.ip,
        port: userData.port
      });

      if (response.data.success) {
        // Update the user in the list
        const updatedUsers = users.map(user => 
          user.id === userData.id ? userData : user
        );
        // Close the edit modal
        setIsEditModalOpen(false);
        setEditingUser(null);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>User List - {vmTitle}</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {users.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-400">No users available for this VM</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-primary-500/10">
                  <th className="pb-4 pl-4">Username</th>
                  <th className="pb-4">Password</th>
                  <th className="pb-4">IP Address</th>
                  <th className="pb-4">Port</th>
                  <th className="pb-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-primary-500/10">
                    <td className="py-4 pl-4">
                      <div className="font-medium text-gray-300">{user.username}</div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-gray-300">
                          {showPasswords[user.id] ? user.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="p-1 hover:bg-dark-300/50 rounded-lg transition-colors"
                        >
                          {showPasswords[user.id] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-mono text-gray-300">{user.ip}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-mono text-gray-300">{user.port}</div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4 text-primary-400" />
                        </button>
                        <button
                          className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                          onClick={() => {
                            // Connect to VM logic
                            window.open(`${user.protocol || 'rdp'}://${user.ip}:${user.port}`, '_blank');
                          }}
                        >
                          <LinkIcon className="h-4 w-4 text-primary-400" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                          onClick={() => {
                            // Disable user logic
                          }}
                        >
                          <Power className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isEditModalOpen && editingUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={editingUser}
          vmId={vmId}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, vmId, onSave }) => {
  const [formData, setFormData] = useState({
    id: user.id,
    username: user.username,
    password: user.password,
    ip: user.ip,
    port: user.port
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await onSave(formData);
      setSuccess('User updated successfully');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-dark-200 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Edit User</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              IP Address
            </label>
            <input
              type="text"
              name="ip"
              value={formData.ip}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Port
            </label>
            <input
              type="text"
              name="port"
              value={formData.port}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
              required
            />
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

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const DatacenterVMCard: React.FC<DatacenterVMCardProps> = ({ vm }) => {
  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleConvertToCatalogue = async () => {
    setIsConverting(true);
    setNotification(null);

    try {
      const response = await axios.post(`http://localhost:3000/api/v1/lab_ms/convertToCatalogue`, {
        vmId: vm.id
      });

      if (response.data.success) {
        setNotification({ 
          type: 'success', 
          message: 'Successfully converted to catalogue' 
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to convert to catalogue');
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to convert to catalogue'
      });
    } finally {
      setIsConverting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-secondary-500/10 
                  hover:border-secondary-500/30 bg-dark-200/80 backdrop-blur-sm
                  transition-all duration-300 hover:shadow-lg hover:shadow-secondary-500/10 
                  hover:translate-y-[-2px] group relative">
      {notification && (
        <div className={`absolute top-2 right-2 px-4 py-2 rounded-lg flex items-center space-x-2 z-50 ${
          notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
        }`}>
          {notification.type === 'success' ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm">{notification.message}</span>
        </div>
      )}
      
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              <GradientText>{vm.title}</GradientText>
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{vm.description}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            vm.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
            vm.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
            'bg-amber-500/20 text-amber-300'
          }`}>
            {vm.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <Server className="h-4 w-4 mr-2 text-secondary-400 flex-shrink-0" />
            <span className="truncate">{vm.platform}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <LinkIcon className="h-4 w-4 mr-2 text-secondary-400 flex-shrink-0" />
            <span className="truncate">{vm.protocol}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Calendar className="h-4 w-4 mr-2 text-secondary-400 flex-shrink-0" />
            <span className="truncate">Start: {formatDate(vm.startDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Clock className="h-4 w-4 mr-2 text-secondary-400 flex-shrink-0" />
            <span className="truncate">End: {formatDate(vm.endDate)}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-400 mb-2">
            <Users className="h-4 w-4 mr-2 text-secondary-400" />
            <span>{vm.users.length} Users</span>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-secondary-500/10 flex justify-between">
          <button
            onClick={() => setIsUserListModalOpen(true)}
            className="flex-1 h-9 px-4 rounded-lg text-sm font-medium
                     bg-dark-400/80 hover:bg-dark-300/80
                     border border-secondary-500/20 hover:border-secondary-500/30
                     text-secondary-300
                     flex items-center justify-center mr-2"
          >
            <Users className="h-4 w-4 mr-2" />
            User List
          </button>
          
          <button
            onClick={handleConvertToCatalogue}
            disabled={isConverting}
            className="flex-1 h-9 px-4 rounded-lg text-sm font-medium
                     bg-gradient-to-r from-secondary-500 to-accent-500
                     hover:from-secondary-400 hover:to-accent-400
                     transform hover:scale-105 transition-all duration-300
                     text-white shadow-lg shadow-secondary-500/20
                     flex items-center justify-center"
          >
            {isConverting ? (
              <Loader className="animate-spin h-4 w-4" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Convert to Catalogue
              </>
            )}
          </button>
        </div>
      </div>

      <UserListModal
        isOpen={isUserListModalOpen}
        onClose={() => setIsUserListModalOpen(false)}
        users={vm.users}
        vmId={vm.id}
        vmTitle={vm.title}
      />
    </div>
  );
};