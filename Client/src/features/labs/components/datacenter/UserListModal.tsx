import React, { useState } from 'react';
import { X, Pencil, Link as LinkIcon, Power, Eye, EyeOff } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';

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
  onEditUser: (user: any) => void;
}

export const UserListModal: React.FC<UserListModalProps> = ({ 
  isOpen, 
  onClose, 
  users, 
  vmId, 
  vmTitle,
  onEditUser
}) => {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-dark-200 rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
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
                          onClick={() => onEditUser(user)}
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
    </div>
  );
};