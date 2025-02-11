import React, { useState , useEffect } from 'react';
import { 
  X, 
  Search, 
  AlertCircle, 
  Check 
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { Lab } from '../../types';
import { json } from 'stream/consumers';
import axios from 'axios';

interface AssignUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  lab: Lab | null;
}

export const AssignUsersModal: React.FC<AssignUsersModalProps> = ({
  isOpen,
  onClose,
  lab
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [users,setUsers] = useState<string[]>([])
  
  const admin = JSON.parse(localStorage.getItem('auth')).result || {}

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/v1/getOrganizationUsers', {
          admin_id: admin.id
        });
        setUsers(response.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [admin.id]);
  // Mock users data - In real implementation, this would come from your user store or API
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'user' },
  ];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignUsers = () => {
    if (selectedUsers.length === 0) {
      setNotification({ type: 'error', message: 'Please select at least one user' });
      return;
    }

    // Here you would typically make an API call to assign the lab to selected users
    setNotification({ type: 'success', message: 'Lab assigned successfully' });
    setTimeout(() => {
      setNotification(null);
      onClose();
      setSelectedUsers([]);
    }, 1500);
  };

  if (!isOpen || !lab) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              <GradientText>Assign Lab to Users</GradientText>
            </h2>
            <p className="text-sm text-gray-400 mt-1">{lab.title}</p>
          </div>
          <button 
            onClick={() => {
              onClose();
              setSelectedUsers([]);
              setNotification(null);
            }}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 placeholder-gray-500 focus:border-primary-500/40 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredUsers.map(user => (
              <label 
                key={user.id}
                className="flex items-center space-x-3 p-3 rounded-lg bg-dark-300/50 
                         hover:bg-dark-300 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => {
                    setSelectedUsers(prev => 
                      prev.includes(user.id)
                        ? prev.filter(id => id !== user.id)
                        : [...prev, user.id]
                    );
                  }}
                  className="form-checkbox h-4 w-4 text-primary-500 rounded border-gray-500/20"
                />
                <div>
                  <p className="text-gray-200">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </label>
            ))}
          </div>

          {notification && (
            <div className={`p-4 rounded-lg flex items-center space-x-2 ${
              notification.type === 'success' 
                ? 'bg-emerald-500/20 border border-emerald-500/20' 
                : 'bg-red-500/20 border border-red-500/20'
            }`}>
              {notification.type === 'success' ? (
                <Check className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              <span className={`text-sm ${
                notification.type === 'success' ? 'text-emerald-300' : 'text-red-300'
              }`}>
                {notification.message}
              </span>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={() => {
                onClose();
                setSelectedUsers([]);
                setNotification(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignUsers}
              className="btn-primary"
            >
              Assign Lab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};