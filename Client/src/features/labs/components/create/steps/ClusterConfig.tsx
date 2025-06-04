import React, { useState } from 'react';
import { GradientText } from '../../../../../components/ui/GradientText';
import { 
  Server, 
  Plus, 
  Minus, 
  AlertCircle,
  Trash2,
  User
} from 'lucide-react';

interface VM {
  name: string;
  protocol: string;
}

interface UserVM {
  vmId: number;
  username: string;
  password: string;
  ip: string;
  port: string;
}

interface ClusterConfigProps {
  config: {
    numberOfVMs: number;
    vms: VM[];
    users: Array<{
      userVMs: UserVM[];
    }>;
  };
  onChange: (config: ClusterConfigProps['config']) => void;
}

export const ClusterConfig: React.FC<ClusterConfigProps> = ({ config, onChange }) => {
  const [error, setError] = useState<string | null>(null);
  
  // Step 1: Configure VMs
  const [numberOfVMs, setNumberOfVMs] = useState(1);
  const [vms, setVMs] = useState<VM[]>([
    { name: 'VM 1', protocol: 'rdp' }
  ]);
  
  // Step 2: Configure Users
  const [numberOfUsers, setNumberOfUsers] = useState(1);
  const [users, setUsers] = useState<Array<{ userVMs: UserVM[] }>>([
    { 
      userVMs: [
        { vmId: 0, username: '', password: '', ip: '', port: '3389' }
      ] 
    }
  ]);

  // Handle VM count change
  const handleVMCountChange = (count: number) => {
    const newCount = Math.max(1, count);
    setNumberOfVMs(newCount);
    
    // Update VMs array based on new count
    if (newCount > vms.length) {
      // Add new VMs
      const newVMs = [...vms];
      for (let i = vms.length; i < newCount; i++) {
        newVMs.push({ 
          name: `VM ${i + 1}`, 
          protocol: 'rdp' 
        });
      }
      setVMs(newVMs);
      
      // Update all users to have entries for the new VMs
      const updatedUsers = users.map(user => {
        const updatedUserVMs = [...user.userVMs];
        for (let i = user.userVMs.length; i < newCount; i++) {
          const defaultPort = newVMs[i].protocol === 'rdp' ? '3389' : 
                             newVMs[i].protocol === 'ssh' ? '22' : '5900';
          updatedUserVMs.push({
            vmId: i,
            username: '',
            password: '',
            ip: '',
            port: defaultPort
          });
        }
        return { ...user, userVMs: updatedUserVMs };
      });
      setUsers(updatedUsers);
    } else if (newCount < vms.length) {
      // Remove excess VMs
      setVMs(vms.slice(0, newCount));
      
      // Remove corresponding VM entries from all users
      const updatedUsers = users.map(user => ({
        ...user,
        userVMs: user.userVMs.filter(userVM => userVM.vmId < newCount)
      }));
      setUsers(updatedUsers);
    }
  };

  // Handle VM name or protocol change
  const handleVMChange = (vmIndex: number, field: keyof VM, value: string) => {
    const updatedVMs = [...vms];
    updatedVMs[vmIndex] = {
      ...updatedVMs[vmIndex],
      [field]: value
    };
    setVMs(updatedVMs);
    
    // If protocol changed, update default ports for all users
    if (field === 'protocol') {
      const defaultPort = value === 'rdp' ? '3389' : value === 'ssh' ? '22' : '5900';
      const updatedUsers = users.map(user => ({
        ...user,
        userVMs: user.userVMs.map(userVM => 
          userVM.vmId === vmIndex 
            ? { ...userVM, port: defaultPort }
            : userVM
        )
      }));
      setUsers(updatedUsers);
    }
    
    setError(null);
  };

  // Handle removing a specific VM
  const handleRemoveVM = (vmIndex: number) => {
    if (vms.length <= 1) return; // Don't remove the last VM
    
    // Remove the VM
    const updatedVMs = [...vms];
    updatedVMs.splice(vmIndex, 1);
    
    // Renumber VM names if they follow the default pattern
    const renamedVMs = updatedVMs.map((vm, idx) => {
      // Only rename if it follows the pattern "VM X"
      if (/^VM \d+$/.test(vm.name)) {
        return { ...vm, name: `VM ${idx + 1}` };
      }
      return vm;
    });
    
    setVMs(renamedVMs);
    setNumberOfVMs(renamedVMs.length);
    
    // Update all users to remove entries for the deleted VM and adjust vmId values
    const updatedUsers = users.map(user => {
      // Remove the VM entry
      const filteredVMs = user.userVMs.filter(userVM => userVM.vmId !== vmIndex);
      
      // Adjust vmId values for VMs after the deleted one
      const adjustedVMs = filteredVMs.map(userVM => {
        if (userVM.vmId > vmIndex) {
          return { ...userVM, vmId: userVM.vmId - 1 };
        }
        return userVM;
      });
      
      return { ...user, userVMs: adjustedVMs };
    });
    
    setUsers(updatedUsers);
  };

  // Handle user count change
  const handleUserCountChange = (count: number) => {
    const newCount = Math.max(1, count);
    setNumberOfUsers(newCount);
    
    // Update users array based on new count
    if (newCount > users.length) {
      // Add new users
      const newUsers = [...users];
      for (let i = users.length; i < newCount; i++) {
        const userVMs = vms.map((vm, vmIndex) => {
          const defaultPort = vm.protocol === 'rdp' ? '3389' : 
                             vm.protocol === 'ssh' ? '22' : '5900';
          return {
            vmId: vmIndex,
            username: '',
            password: '',
            ip: '',
            port: defaultPort
          };
        });
        newUsers.push({ userVMs });
      }
      setUsers(newUsers);
    } else if (newCount < users.length) {
      // Remove excess users
      setUsers(users.slice(0, newCount));
    }
  };

  // Handle removing a specific user
  const handleRemoveUser = (userIndex: number) => {
    if (users.length <= 1) return; // Don't remove the last user
    
    const updatedUsers = [...users];
    updatedUsers.splice(userIndex, 1);
    setUsers(updatedUsers);
    setNumberOfUsers(updatedUsers.length);
  };

  // Handle user VM field change
  const handleUserVMChange = (userIndex: number, vmIndex: number, field: keyof UserVM, value: string) => {
    const updatedUsers = [...users];
    const userVM = updatedUsers[userIndex].userVMs.find(uvm => uvm.vmId === vmIndex);
    
    if (userVM) {
      userVM[field] = value;
      setUsers(updatedUsers);
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    // Check if all VMs have names and protocols
    for (let i = 0; i < vms.length; i++) {
      if (!vms[i].name || !vms[i].protocol) {
        setError(`Please provide a name and protocol for VM ${i + 1}`);
        return false;
      }
    }
    
    // Check if all user VM fields are filled
    for (let userIndex = 0; userIndex < users.length; userIndex++) {
      const user = users[userIndex];
      for (let vmIndex = 0; vmIndex < user.userVMs.length; vmIndex++) {
        const userVM = user.userVMs[vmIndex];
        if (!userVM.username || !userVM.password || !userVM.ip || !userVM.port) {
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
      numberOfVMs,
      vms,
      users
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
        {/* Step 1: Configure VMs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Server className="h-5 w-5 text-primary-400" />
              <h3 className="text-lg font-semibold text-gray-200">Number of VMs</h3>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleVMCountChange(numberOfVMs - 1)}
                className="p-2 bg-dark-400/50 border border-primary-500/20 rounded-l-lg text-gray-400 hover:bg-dark-300 transition-colors"
                disabled={numberOfVMs <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min="1"
                value={numberOfVMs}
                onChange={(e) => handleVMCountChange(parseInt(e.target.value) || 1)}
                className="w-20 px-4 py-2 bg-dark-400/50 border-y border-primary-500/20 text-center
                         text-gray-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleVMCountChange(numberOfVMs + 1)}
                className="p-2 bg-dark-400/50 border border-primary-500/20 rounded-r-lg text-gray-400 hover:bg-dark-300 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            {vms.map((vm, vmIndex) => (
              <div key={vmIndex} className="p-4 bg-dark-300/50 rounded-lg border border-primary-500/10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-200">VM {vmIndex + 1} Configuration</h4>
                  {vms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVM(vmIndex)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">VM Name</label>
                    <input
                      type="text"
                      value={vm.name}
                      onChange={(e) => handleVMChange(vmIndex, 'name', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                               text-gray-300 focus:border-primary-500/40 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Connection Protocol</label>
                    <select
                      value={vm.protocol}
                      onChange={(e) => handleVMChange(vmIndex, 'protocol', e.target.value)}
                      className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                               text-gray-300 focus:border-primary-500/40 focus:outline-none"
                      required
                    >
                      <option value="rdp">RDP (Remote Desktop Protocol)</option>
                      <option value="ssh">SSH (Secure Shell)</option>
                      <option value="vnc">VNC (Virtual Network Computing)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Step 2: Configure Users */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-primary-400" />
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
          
          <div className="space-y-6">
            {users.map((user, userIndex) => (
              <div key={userIndex} className="p-6 bg-dark-300/50 rounded-lg border border-primary-500/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-200">User {userIndex + 1}</h3>
                  {users.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(userIndex)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-6">
                  {vms.map((vm, vmIndex) => {
                    const userVM = user.userVMs.find(uvm => uvm.vmId === vmIndex) || {
                      vmId: vmIndex,
                      username: '',
                      password: '',
                      ip: '',
                      port: vm.protocol === 'rdp' ? '3389' : vm.protocol === 'ssh' ? '22' : '5900'
                    };
                    
                    return (
                      <div key={vmIndex} className="p-4 bg-dark-400/30 rounded-lg border border-primary-500/10">
                        <div className="flex items-center space-x-2 mb-4">
                          <Server className="h-5 w-5 text-primary-400" />
                          <h4 className="font-medium text-gray-200">{vm.name} ({vm.protocol.toUpperCase()})</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                            <input
                              type="text"
                              value={userVM.username}
                              onChange={(e) => handleUserVMChange(userIndex, vmIndex, 'username', e.target.value)}
                              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input
                              type="text"
                              value={userVM.password}
                              onChange={(e) => handleUserVMChange(userIndex, vmIndex, 'password', e.target.value)}
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
                              value={userVM.ip}
                              onChange={(e) => handleUserVMChange(userIndex, vmIndex, 'ip', e.target.value)}
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
                              value={userVM.port}
                              onChange={(e) => handleUserVMChange(userIndex, vmIndex, 'port', e.target.value)}
                              placeholder={vm.protocol === 'rdp' ? '3389' : vm.protocol === 'ssh' ? '22' : '5900'}
                              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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