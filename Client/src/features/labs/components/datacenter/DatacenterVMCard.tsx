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
  Power,
  Eye,
  EyeOff
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { ConvertToCatalogueModal } from '../cloudvm/ConvertToCatalogueModal';
import { EditUserModal } from './EditUserModal';
import { DeleteModal } from './DeleteModal';
import { UserListModal } from './UserListModal';
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

export const DatacenterVMCard: React.FC<{ vm: DatacenterVM }> = ({ vm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLaunchProcessing, setIsLaunchProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConvertEnabled, setIsConvertEnabled] = useState(false);
  const [amiId, setAmiId] = useState<string | undefined>(vm.ami_id);
  const [instanceDetails, setInstance] = useState<Instance | undefined>(undefined);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isInstance, setIsInstance] = useState(false);
  const [isAmi, setIsAmi] = useState(false);
  const [labDetails, setLabDetails] = useState<LabDetails | null>(null);
  const [buttonLabel, setButtonLabel] = useState<'Launch Software' | 'Stop'>('Launch Software');
  const [showFullAmiId, setShowFullAmiId] = useState(false);
  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [vmUsers, setVmUsers] = useState<Array<any>>(vm.userscredentials || []);

  const [admin,setAdmin] = useState({});
  useEffect(() => {
    const getUserDetails = async () => {
      const response = await axios.get('http://localhost:3000/api/v1/user_ms/user_profile');
      setAdmin(response.data.user);
    };
    getUserDetails();
  }, []);

  const handleSaveUser = async (userData: any) => {
    try {
      const response = await axios.post(`http://localhost:3000/api/v1/lab_ms/editSingleVmDatacenterCreds`, {
        labId: vm.lab_id,
        id: userData.id,
        username: userData.username,
        password: userData.password,
        protocol: userData.protocol,
        ip: userData.ip,
        port: userData.port
      });

      if (response.data.success) {
        // Update the user in the local state
        setVmUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userData.id ? { ...user, ...userData } : user
          )
        );
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.delete(`http://localhost:3000/api/v1/lab_ms/deleteSingleVMDatacenterLab/${vm.lab_id}`);
      
      if (response.data.success) {
        setNotification({ type: 'success', message: 'VM deleted successfully' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to delete VM');
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete VM'
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleConvertToCatalogue = async () => {
    setIsModalOpen(true);
  };

  const toggleDocumentsPanel = () => {
    setShowDocuments(!showDocuments);
  };

  function formatDate(dateString:string) {
    const date = new Date(dateString);
  
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
  
    let hours = date.getHours();
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    hours = hours % 12 || 12; // Convert 0 to 12 for 12AM
    hours = `${hours}`.padStart(1, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  }

  return (
    <>
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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                vm.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                vm.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
                'bg-amber-500/20 text-amber-300'
              }`}>
                {vm.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-400">
              <Server className="h-4 w-4 mr-2 text-secondary-400 flex-shrink-0" />
              <span className="truncate">{vm.platform}</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="h-4 w-4 mr-2 text-secondary-400 flex-shrink-0" />
              <span className="truncate">{vm.protocol}</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="h-4 w-4 mr-2 text-secondary-400 flex-shrink-0" />
              <span 
                className={`${showFullStartDate ? '' : 'truncate'} cursor-pointer`}
                onClick={() => setShowFullStartDate(!showFullStartDate)}
                title={showFullStartDate ? "Click to collapse" : "Click to expand"}
              >
                Start: {formatDate(vm?.startdate)}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="h-4 w-4 mr-2 text-secondary-400 flex-shrink-0" />
              <span 
                className={`${showFullEndDate ? '' : 'truncate'} cursor-pointer`}
                onClick={() => setShowFullEndDate(!showFullEndDate)}
                title={showFullEndDate ? "Click to collapse" : "Click to expand"}
              >
                End: {formatDate(vm?.enddate)}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-400 mb-2">
              <Users className="h-4 w-4 mr-2 text-secondary-400" />
              <span>{vmUsers.length} Users</span>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-secondary-500/10 flex flex-col space-y-2">
            <button
              onClick={() => setIsUserListModalOpen(true)}
              className="w-full h-9 px-4 rounded-lg text-sm font-medium
                       bg-dark-400/80 hover:bg-dark-300/80
                       border border-secondary-500/20 hover:border-secondary-500/30
                       text-secondary-300
                       flex items-center justify-center"
            >
              <Users className="h-4 w-4 mr-2" />
              User List
            </button>
            
            <button
              onClick={handleConvertToCatalogue}
              disabled={isProcessing}
              className="w-full h-9 px-4 rounded-lg text-sm font-medium
                       bg-gradient-to-r from-secondary-500 to-accent-500
                       hover:from-secondary-400 hover:to-accent-400
                       transform hover:scale-105 transition-all duration-300
                       text-white shadow-lg shadow-secondary-500/20
                       flex items-center justify-center"
            >
              {isProcessing ? (
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
      </div>

      {isUserListModalOpen && (
        <UserListModal
          isOpen={isUserListModalOpen}
          onClose={() => setIsUserListModalOpen(false)}
          users={vmUsers}
          vmId={vm.id}
          vmTitle={vm.title}
          onEditUser={(user) => {
            setSelectedUser(user);
            setIsEditModalOpen(true);
          }}
        />
      )}

      {isEditModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          vmId={vm.id}
          onSave={async (userData) => {
            try {
              await handleSaveUser(userData);
              setIsEditModalOpen(false);
              setSelectedUser(null);
            } catch (error) {
              console.error('Error updating user:', error);
              throw error;
            }
          }}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      <ConvertToCatalogueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vmId={vm?.lab_id}
        isDatacenterVM={true}
      />
    </>
  );
};