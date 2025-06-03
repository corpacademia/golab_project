import React, { useState } from 'react';
import { GradientText } from '../../../../../components/ui/GradientText';
import { 
  Server, 
  Plus, 
  Minus, 
  Network,
  AlertCircle,
  Trash2
} from 'lucide-react';

interface VM {
  name: string;
  username: string;
  password: string;
  ip: string;
  port: string;
}

interface ClusterConfigProps {
  config: {
    numberOfVMs: number;
    vms: VM[];
    network: {
      type: string;
      subnet: string;
    };
  };
  onChange: (config: ClusterConfigProps['config']) => void;
}

export const ClusterConfig: React.FC<ClusterConfigProps> = ({ config, onChange }) => {
  const [formData, setFormData] = useState(config);
  const [error, setError] = useState<string | null>(null);
  const [numberOfUsers, setNumberOfUsers] = useState(1);
  const [users, setUsers] = useState<Array<{ vms: VM[] }>>([
    { vms: [{ name: 'VM 1', username: '', password: '', ip: '', port: '22' }] }
  ]);

  const handleUserCountChange = (count: number) => {
    const newCount = Math.max(1, count);
    setNumberOfUsers(newCount);
    
    // Update users array based on new count
    if (newCount > users.length) {
      // Add new users
      const newUsers = [...users];
      for (let i = users.length; i < newCount; i++) {
        newUsers.push({ 
          vms: [{ name: `VM 1`, username: '', password: '', ip: '', port: '22' }] 
        });
      }
      setUsers(newUsers);
    } else if (newCount < users.length) {
      // Remove excess users
      setUsers(users.slice(0, newCount));
    }
  };

  const handleAddVM = (userIndex: number) => {
    const updatedUsers = [...users];
    const vmCount = updatedUsers[userIndex].vms.length;
    updatedUsers[userIndex].vms.push({
      name: `VM ${vmCount + 1}`,
      username: '',
      password: '',
      ip: '',
      port: '22'
    });
    setUsers(updatedUsers);
  };

  const handleRemoveVM = (userIndex: number, vmIndex: number) => {
    if (users[userIndex].vms.length <= 1) return;
    
    const updatedUsers = [...users];
    updatedUsers[userIndex].vms.splice(vmIndex, 1);
    setUsers(updatedUsers);
  };

  const handleVMChange = (userIndex: number, vmIndex: number, field: keyof VM, value: string | number) => {
    const updatedUsers = [...users];
    updatedUsers[userIndex].vms[vmIndex] = {
      ...updatedUsers[userIndex].vms[vmIndex],
      [field]: value
    };
    setUsers(updatedUsers);
    setError(null);
  };

  const validateForm = (): boolean => {
    // Check if all required fields are filled
    for (let userIndex = 0; userIndex < users.length; userIndex++) {
      const user = users[userIndex];
      for (let vmIndex = 0; vmIndex < user.vms.length; vmIndex++) {
        const vm = user.vms[vmIndex];
        if (!vm.name || !vm.username || !vm.password || !vm.ip || !vm.port) {
          setError(`Please fill all fields for User ${userIndex + 1}, VM ${vmIndex + 1}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Prepare data for submission
    const clusterConfig = {
      ...formData,
      numberOfVMs: users.reduce((total, user) => total + user.vms.length, 0),
      users: users
    };

    // Store in localStorage
    const storedData = JSON.parse(localStorage.getItem('formData') || '{}');
    const updatedData = { ...storedData, clusterConfig };
    localStorage.setItem('formData', JSON.stringify(updatedData));

    // Call onChange to proceed to next step
    onChange(clusterConfig);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-semibold">
        <GradientText>VM Cluster Configuration</GradientText>
      </h2>
      
      <div className="glass-panel space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Server className="h-5 w-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-gray-200">Number of Users</h3>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleUserCountChange(numberOfUsers - 1)}
              className="p-2 bg-dark-400/50 border border-primary-500/20 rounded-l-lg text-gray-400 hover:bg-dark-300 transition-colors"
              disabled={numberOfUsers <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min="1"
              value={numberOfUsers}
              onChange={(e) => handleUserCountChange(parseInt(e.target.value) || 1)}
              className="w-20 px-4 py-2 bg-dark-400/50 border-y border-primary-500/20 text-center
                       text-gray-300 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleUserCountChange(numberOfUsers + 1)}
              className="p-2 bg-dark-400/50 border border-primary-500/20 rounded-r-lg text-gray-400 hover:bg-dark-300 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* User Configuration */}
        <div className="space-y-8">
          {users.map((user, userIndex) => (
            <div key={userIndex} className="p-6 bg-dark-300/50 rounded-lg border border-primary-500/10">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">User {userIndex + 1}</h3>
              
              {/* VM List */}
              <div className="space-y-6">
                {user.vms.map((vm, vmIndex) => (
                  <div key={vmIndex} className="p-4 bg-dark-400/30 rounded-lg border border-primary-500/10">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        <Server className="h-5 w-5 text-primary-400" />
                        <h4 className="font-medium text-gray-200">VM {vmIndex + 1}</h4>
                      </div>
                      {user.vms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVM(userIndex, vmIndex)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">VM Name</label>
                        <input
                          type="text"
                          value={vm.name}
                          onChange={(e) => handleVMChange(userIndex, vmIndex, 'name', e.target.value)}
                          className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                   text-gray-300 focus:border-primary-500/40 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                        <input
                          type="text"
                          value={vm.username}
                          onChange={(e) => handleVMChange(userIndex, vmIndex, 'username', e.target.value)}
                          className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                   text-gray-300 focus:border-primary-500/40 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                          type="text"
                          value={vm.password}
                          onChange={(e) => handleVMChange(userIndex, vmIndex, 'password', e.target.value)}
                          className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                   text-gray-300 focus:border-primary-500/40 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">IP Address</label>
                        <input
                          type="text"
                          value={vm.ip}
                          onChange={(e) => handleVMChange(userIndex, vmIndex, 'ip', e.target.value)}
                          placeholder="e.g., 192.168.1.100"
                          className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                   text-gray-300 focus:border-primary-500/40 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Port</label>
                        <input
                          type="text"
                          value={vm.port}
                          onChange={(e) => handleVMChange(userIndex, vmIndex, 'port', e.target.value)}
                          placeholder="e.g., 22 for SSH, 3389 for RDP"
                          className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                   text-gray-300 focus:border-primary-500/40 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => handleAddVM(userIndex)}
                  className="w-full p-3 border border-dashed border-primary-500/30 rounded-lg
                           text-primary-400 hover:text-primary-300 hover:border-primary-500/50
                           transition-colors flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add VM
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Network Configuration */}
        <div className="p-6 bg-dark-300/50 rounded-lg border border-primary-500/10">
          <div className="flex items-center space-x-3 mb-4">
            <Network className="h-5 w-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-gray-200">Network Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Network Type</label>
              <select
                value={formData.network.type}
                onChange={(e) => setFormData({
                  ...formData,
                  network: { ...formData.network, type: e.target.value }
                })}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              >
                <option value="private">Private Network</option>
                <option value="public">Public Network</option>
                <option value="hybrid">Hybrid Network</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subnet</label>
              <input
                type="text"
                value={formData.network.subnet}
                onChange={(e) => setFormData({
                  ...formData,
                  network: { ...formData.network, subnet: e.target.value }
                })}
                placeholder="e.g., 10.0.0.0/24"
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
            </div>
          </div>
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
      
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-8 py-3 text-base font-semibold rounded-lg
                   bg-gradient-to-r from-primary-500 to-secondary-500
                   hover:from-primary-400 hover:to-secondary-400
                   transform hover:scale-105 transition-all duration-300
                   text-white shadow-lg shadow-primary-500/20
                   min-w-[200px] focus:outline-none focus:ring-2 
                   focus:ring-primary-500/50 focus:ring-offset-2 
                   focus:ring-offset-dark-300"
        >
          Continue
        </button>
      </div>
    </div>
  );
};