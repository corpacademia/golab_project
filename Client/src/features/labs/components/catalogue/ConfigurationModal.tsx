import React, { useEffect, useState } from 'react';
import { X, Settings, AlertCircle, ChevronDown, Check } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { Lab } from '../../types';
import axios from 'axios';

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lab: Lab;
}

interface ServiceRow {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  monthlyCost: number;
  configSummary: string;
}

export const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  isOpen,
  onClose,
  lab
}) => {
  const [showConfigColumn, setShowConfigColumn] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [instanceDetails,setInstanceDetails] = useState()

  const mockServices: ServiceRow[] = [
    {
      id: '1',
      name: 'EC2 Instance',
      status: 'active',
      monthlyCost: 29.99,
      configSummary: `${lab.instance},${lab.ram} RAM ,${lab.cpu} VCPU`
    },
    {
      id: '2',
      name: 'EBS Volume',
      status: 'active',
      monthlyCost: 10.00,
      configSummary: `${lab.storage}GB`
    },
    // {
    //   id: '3',
    //   name: 'Network Transfer',
    //   status: 'active',
    //   monthlyCost: 5.00,
    //   configSummary: 'Up to 100GB/month'
    // }
  ];
  useEffect(()=>{
      const fetch = async()=>{
        const data = await axios.post('http://localhost:3000/api/v1/getInstanceDetails',{
              instance:lab.instance,
              cpu:lab.cpu,
              ram:lab.ram,
        })
        setInstanceDetails(data.data.data)
        if(!data.data.success){
          console.log("error")
        }
        
      }
      fetch();
     
  },[])

  // const totalCost = mockServices.reduce((acc, service) => acc + service.monthlyCost, 0);
  const getPricingByOS=(data, os)=> {
    switch (os.toLowerCase()) {
      case "linux":
        return data.ondemand_linux_base_pricing;
      case "windows":
        return data.ondemand_windows_base_pricing;
      case "ubuntu":
        return data.ondemand_ubuntu_pro_base_pricing;
      default:
        return "OS not supported";
    }
  }
  // const instancePrice = getPricingByOS(instanceDetails,lab.os)
  const totalCost = instancePrice

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-200 rounded-xl w-full max-w-4xl">
        {/* Header */}
        <div className="p-6 border-b border-primary-500/10">
          <div className="flex justify-between items-center">
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
        </div>

        {/* Dashboard Section */}
        <div className="p-6 border-b border-primary-500/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Resources</h3>
              <p className="text-2xl font-semibold text-primary-400">
                {mockServices.length}
              </p>
            </div>
            <div className="glass-panel">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
              <p className="text-2xl font-semibold text-emerald-400">Ready</p>
            </div>
            <div className="glass-panel">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Total Cost</h3>
              <p className="text-2xl font-semibold">
                <GradientText>${totalCost}/mo</GradientText>
              </p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-300">Services Configuration</h3>
            <button
              onClick={() => setShowConfigColumn(!showConfigColumn)}
              className="flex items-center px-3 py-1.5 text-sm bg-dark-300/50 
                       text-gray-400 rounded-lg hover:bg-dark-300 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              {showConfigColumn ? 'Hide' : 'Show'} Config
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-primary-500/10">
                  <th className="pb-3 text-sm font-medium text-gray-400">Service</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Status</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Monthly Cost</th>
                  {showConfigColumn && (
                    <th className="pb-3 text-sm font-medium text-gray-400">Configuration</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {mockServices.map((service) => (
                  <tr 
                    key={service.id}
                    className="border-b border-primary-500/10 hover:bg-dark-300/50 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center">
                        <span className="text-gray-300">{service.name}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        service.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-primary-400">${service.monthlyCost}</span>
                    </td>
                    {showConfigColumn && (
                      <td className="py-4 text-sm text-gray-400">
                        {service.configSummary}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-primary-500/10 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            <AlertCircle className="h-4 w-4 inline-block mr-2" />
            Changes will be applied after confirmation
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 
                       hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button className="px-6 py-2 rounded-lg text-sm font-medium
                           bg-gradient-to-r from-primary-500 to-secondary-500
                           hover:from-primary-400 hover:to-secondary-400
                           text-white shadow-lg shadow-primary-500/20
                           transition-all duration-300">
              Configure AMI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};