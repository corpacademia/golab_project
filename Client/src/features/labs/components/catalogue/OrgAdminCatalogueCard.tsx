import React, { useState } from 'react';
import { 
  Clock, 
  Tag, 
  BookOpen, 
  Star, 
  Cpu, 
  Users,
  X,
  AlertCircle,
  Check,
  Search,
  HardDrive,
  Server
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { Lab } from '../../types';

interface OrgAdminCatalogueCardProps {
  lab: Lab;
}

export const OrgAdminCatalogueCard: React.FC<OrgAdminCatalogueCardProps> = ({ lab }) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Mock users data - In real implementation, this would come from your user store or API
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'user' },
  ];

  const filteredUsers = mockUsers.filter(user => 
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
      setIsAssignModalOpen(false);
      setSelectedUsers([]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                    hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                    transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
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
              <GradientText>{lab.title}</GradientText>
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{lab.description}</p>
          </div>
          <div className="flex items-center text-amber-400">
            <Star className="h-4 w-4 mr-1 fill-current" />
            <span className="text-sm">{lab.rating || 4.5}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <Cpu className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">4 vCPU</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Tag className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">8GB RAM</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Server className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">t2.large</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <HardDrive className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">100GB Storage</span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Technologies:</h4>
          <div className="flex flex-wrap gap-2">
            {lab.technologies.map((tech, index) => (
              <span key={index} className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-primary-500/10">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="w-full h-9 px-4 rounded-lg text-sm font-medium
                     bg-gradient-to-r from-primary-500 to-secondary-500
                     hover:from-primary-400 hover:to-secondary-400
                     transform hover:scale-105 transition-all duration-300
                     text-white shadow-lg shadow-primary-500/20
                     flex items-center justify-center"
          >
            <Users className="h-4 w-4 mr-2" />
            Assign Users
          </button>
        </div>
      </div>

      {/* Assign Users Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-200 rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                <GradientText>Assign Lab to Users</GradientText>
              </h2>
              <button 
                onClick={() => {
                  setIsAssignModalOpen(false);
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
                    setIsAssignModalOpen(false);
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
      )}
    </div>
  );
};