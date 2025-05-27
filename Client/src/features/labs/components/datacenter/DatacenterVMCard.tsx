import React, { useState, useEffect } from 'react';
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
import { UserListModal } from './UserListModal';
import { EditUserModal } from './EditUserModal';

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

export const DatacenterVMCard: React.FC<DatacenterVMCardProps> = ({ vm }) => {
  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
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
            <span>{vm.userscredentials.length} Users</span>
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

      {isUserListModalOpen && (
        <UserListModal
          isOpen={isUserListModalOpen}
          onClose={() => setIsUserListModalOpen(false)}
          users={[JSON.parse(vm.userscredentials)]}
          vmId={vm.id}
          vmTitle={vm.title}
          onEditUser={handleEditUser}
        />
      )}

      {isEditModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
          vmId={vm.id}
          onSave={async (userData) => {
            try {
              const response = await axios.post(`http://localhost:3000/api/v1/lab_ms/updateDatacenterUser`, {
                vmId: vm.id,
                userId: userData.id,
                username: userData.username,
                password: userData.password,
                ip: userData.ip,
                port: userData.port
              });

              if (response.data.success) {
                setIsEditModalOpen(false);
                setSelectedUser(null);
                window.location.reload();
              } else {
                throw new Error(response.data.message || 'Failed to update user');
              }
            } catch (error) {
              console.error('Error updating user:', error);
              throw error;
            }
          }}
        />
      )}
    </div>
  );
};