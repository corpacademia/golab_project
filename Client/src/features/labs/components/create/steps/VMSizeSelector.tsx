import React, { useState } from 'react';
import { Cpu, HardDrive, Database, Server, Check, AlertCircle } from 'lucide-react';
import { GradientText } from '../../../../../components/ui/GradientText';

interface VMSizeConfig {
  cpu: number;
  ram: number;
  storage: number;
  os?: string;
}

interface VMSizeSelectorProps {
  onSelect: (config: VMSizeConfig) => void;
}

interface OSVersion {
  name: string;
  version: string;
}

const osCategories = {
  Ubuntu: [
    { name: 'Ubuntu', version: 'ubuntu' },
    { name: 'Ubuntu Pro', version: 'ubuntu-pro' }
  ],
  Windows: [
    { name: 'Windows Server 2022', version: 'windows' },
    { name: 'Windows Server 2019', version: 'windows-2019' }
  ],
  RedHat: [
    { name: 'RHEL 9', version: 'rhel' },
    { name: 'RHEL 8', version: 'rhel-8' }
  ],
  Linux: [
    { name: 'Amazon Linux 2', version: 'linux' },
    { name: 'CentOS 7', version: 'linux-centos' }
  ]
};

const recommendedInstances = [
  {
    type: 't3.large',
    cpu: 2,
    ram: 8,
    storage: 50,
    description: 'Balanced performance for general workloads'
  },
  {
    type: 't3.xlarge',
    cpu: 4,
    ram: 16,
    storage: 100,
    description: 'Enhanced performance for memory-intensive applications'
  },
  {
    type: 'c6i.large',
    cpu: 2,
    ram: 4,
    storage: 50,
    description: 'Compute-optimized for CPU-intensive workloads'
  }
];

export const VMSizeSelector: React.FC<VMSizeSelectorProps> = ({ onSelect }) => {
  const [config, setConfig] = useState<VMSizeConfig>({
    cpu: 2,
    ram: 2,
    storage: 50,
    os: ''
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [showError, setShowError] = useState(false);

  const handleSubmit = () => {
    if (!selectedVersion) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onSelect(config);
    const storedData = JSON.parse(localStorage.getItem('formData') || '{}');
    const updatedData = { ...storedData, config };
    localStorage.setItem('formData', JSON.stringify(updatedData));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedVersion('');
    setConfig(prev => ({ ...prev, os: '' }));
    setShowError(false);
  };

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version);
    setConfig(prev => ({ ...prev, os: version }));
    setShowError(false);
  };

  const handleInstanceSelect = (instance: typeof recommendedInstances[0]) => {
    setConfig(prev => ({
      ...prev,
      cpu: instance.cpu,
      ram: instance.ram,
      storage: instance.storage
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-semibold">
        <GradientText>Configure Lab Environment</GradientText>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Section - Configuration */}
        <div className="glass-panel space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Operating System Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={`w-full px-4 py-2 bg-dark-400/50 border rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none
                         focus:ring-2 focus:ring-primary-500/20 transition-colors
                         ${showError && !selectedCategory ? 'border-red-500/50' : 'border-primary-500/20'}`}
              >
                <option value="">Select OS Category</option>
                {Object.keys(osCategories).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Operating System Version
                </label>
                <select
                  value={selectedVersion}
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className={`w-full px-4 py-2 bg-dark-400/50 border rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none
                           focus:ring-2 focus:ring-primary-500/20 transition-colors
                           ${showError && !selectedVersion ? 'border-red-500/50' : 'border-primary-500/20'}`}
                >
                  <option value="">Select Version</option>
                  {osCategories[selectedCategory as keyof typeof osCategories].map(os => (
                    <option key={os.version} value={os.version}>{os.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="flex items-center text-gray-300 mb-2">
                <Cpu className="h-4 w-4 mr-2" />
                CPU Cores
              </label>
              <input
                type="range"
                min="1"
                max="16"
                value={config.cpu}
                onChange={(e) => setConfig(prev => ({ ...prev, cpu: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>{config.cpu} Cores</span>
                <span>16 Cores max</span>
              </div>
            </div>

            <div>
              <label className="flex items-center text-gray-300 mb-2">
                <Database className="h-4 w-4 mr-2" />
                Memory (RAM)
              </label>
              <input
                type="range"
                min="2"
                max="64"
                step="2"
                value={config.ram}
                onChange={(e) => setConfig(prev => ({ ...prev, ram: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>{config.ram} GB</span>
                <span>64 GB max</span>
              </div>
            </div>

            <div>
              <label className="flex items-center text-gray-300 mb-2">
                <HardDrive className="h-4 w-4 mr-2" />
                Storage
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={config.storage}
                onChange={(e) => setConfig(prev => ({ ...prev, storage: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>{config.storage} GB</span>
                <span>1000 GB max</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - AI Recommendations */}
        <div className="glass-panel">
          <h3 className="text-lg font-semibold mb-4">
            <GradientText>AI Recommended Instances</GradientText>
          </h3>
          <div className="space-y-4">
            {recommendedInstances.map((instance, index) => (
              <div
                key={index}
                className="p-4 bg-dark-300/50 rounded-lg border border-primary-500/20 
                         hover:border-primary-500/40 transition-all cursor-pointer"
                onClick={() => handleInstanceSelect(instance)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-200">{instance.type}</h4>
                    <p className="text-sm text-gray-400">{instance.description}</p>
                  </div>
                  <Server className="h-5 w-5 text-primary-400" />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm text-gray-400">
                  <div>
                    <span className="block text-gray-500">CPU</span>
                    <span>{instance.cpu} Cores</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">RAM</span>
                    <span>{instance.ram} GB</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Storage</span>
                    <span>{instance.storage} GB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Centered Apply Configuration Button with Error Message */}
      <div className="flex flex-col items-center space-y-4">
        {showError && !selectedVersion && (
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>Please select an operating system before continuing</span>
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="btn-primary w-64 justify-center transform hover:scale-105 transition-all duration-300"
        >
          <Check className="h-4 w-4 mr-2" />
          Apply Configuration
        </button>
      </div>
    </div>
  );
};