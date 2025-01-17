import { useState } from "react";

export const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  isOpen,
  onClose,
  lab,
  instanceCost,
  storageCost,
}) => {
  const [configDetails, setConfigDetails] = useState({
    numberOfUsers: 1,
    numberOfDays: 1
  });

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfigDetails(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const costOfInstance = instanceCost + storageCost;
  const totalCost = costOfInstance * configDetails.numberOfUsers * configDetails.numberOfDays;

  const handleConfigurations = async () => {
    const user = JSON.parse(localStorage.getItem('auth')).result || {};
    try {
      const configs = {
        'instance': lab.instance,
        'cpu': lab.cpu,
        'ram': lab.ram,
        'users': configDetails.numberOfUsers,
        'days': configDetails.numberOfDays,
        'title': lab.title,
        'description': lab.description
      };
      
      const updateConfig = await axios.post('http://localhost:3000/api/v1/updateConfigOfLabs', {
        lab_id: lab.lab_id,
        admin_id: user.id,
        config_details: configs,
      });
      
      if (updateConfig.data.success) {
        onClose();
      }
    } catch (error) {
      console.error("Error updating configuration:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-xl w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              <GradientText>Configure Lab Environment</GradientText>
            </h2>
            <p className="mt-1 text-sm text-gray-400">{lab.title}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Lab Details - Static */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lab Title
              </label>
              <div className="px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg text-gray-300">
                {lab.title}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <div className="px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg text-gray-300">
                {lab.description}
              </div>
            </div>
          </div>

          {/* Instance Configuration */}
          <div className="p-4 bg-dark-300/50 rounded-lg space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Instance Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-400">Instance Type:</span>
                <div className="mt-1 px-3 py-2 bg-dark-400/50 rounded-lg text-primary-400">
                  {lab.instance}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-400">CPU:</span>
                <div className="mt-1 px-3 py-2 bg-dark-400/50 rounded-lg text-primary-400">
                  {lab.cpu} vCPUs
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-400">RAM:</span>
                <div className="mt-1 px-3 py-2 bg-dark-400/50 rounded-lg text-primary-400">
                  {lab.ram} GB
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-400">Storage:</span>
                <div className="mt-1 px-3 py-2 bg-dark-400/50 rounded-lg text-primary-400">
                  {lab.storage} GB
                </div>
              </div>
            </div>
          </div>

          {/* EBS Volume */}
          <div className="p-4 bg-dark-300/50 rounded-lg space-y-4">
            <h3 className="text-sm font-medium text-gray-300">EBS Volume</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-400">Volume Type:</span>
                <div className="mt-1 px-3 py-2 bg-dark-400/50 rounded-lg text-primary-400">
                  gp2
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-400">Size:</span>
                <div className="mt-1 px-3 py-2 bg-dark-400/50 rounded-lg text-primary-400">
                  {lab.storage} GB
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Users
              </label>
              <input
                type="number"
                name="numberOfUsers"
                min="1"
                value={configDetails.numberOfUsers}
                onChange={handleConfigChange}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Days
              </label>
              <input
                type="number"
                name="numberOfDays"
                min="1"
                value={configDetails.numberOfDays}
                onChange={handleConfigChange}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
            </div>
          </div>

          {/* Cost Summary */}
          <div className="p-4 bg-dark-300/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Instance Cost (per hour):</span>
              <span className="text-primary-400">${instanceCost}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Storage Cost (per hour):</span>
              <span className="text-primary-400">${storageCost}</span>
            </div>
            <div className="flex justify-between text-sm font-medium pt-2 border-t border-primary-500/10">
              <span className="text-gray-300">Total Cost:</span>
              <span className="text-primary-400">${totalCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfigurations}
              className="btn-primary"
            >
              Configure AMI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};