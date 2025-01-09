import React, { useState } from 'react';
import { Cpu, HardDrive, Database } from 'lucide-react';
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

export const VMSizeSelector: React.FC<VMSizeSelectorProps> = ({ onSelect }) => {
  const [config, setConfig] = useState<VMSizeConfig>({
    cpu: 2,
    ram: 2,
    storage: 50,
    os: 'windows'
  });

  const handleSubmit = () => {
    onSelect(config);
    const storedData = JSON.parse(localStorage.getItem('formData'))|| {}
     const updatedData = {...storedData,config}
     localStorage.setItem('formData',JSON.stringify(updatedData))
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-semibold">
        <GradientText></GradientText>
      </h2>

      <div className="glass-panel space-y-6">
        <div className="space-y-4">
          <div>
            <label className="flex items-center text-gray-300 mb-2">
              Operating System
            </label>
            <select
              value={config.os}
              onChange={(e) => setConfig(prev => ({ ...prev, os: e.target.value }))}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none
                       focus:ring-2 focus:ring-primary-500/20 transition-colors"
            >
              <option value="ubuntu">ubuntu</option>
              <option value="linux">linux</option>
              <option value="windows">windows</option>
              <option value="rhel">rhel</option>
              {/* <option value="windows-server-2019">Windows Server 2019</option>
              <option value="windows-server-2022">Windows Server 2022</option> */}
            </select>
          </div>

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

        <button
          onClick={handleSubmit}
          className="btn-primary w-full"
        >
          Continue
        </button>
      </div>
    </div>
  );
};