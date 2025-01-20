import React, { useEffect, useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { CloudVMCard } from '../components/cloudvm/CloudVMCard';
import { Plus } from 'lucide-react';
import axios from 'axios';

export const CloudVMsPage: React.FC = () => {
  const [vms, setVMs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVMs = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/getCloudVMs');
        if (response.data.success) {
          setVMs(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching VMs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVMs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">
            <GradientText>Cloud Virtual Machines</GradientText>
          </h1>
          <p className="mt-2 text-gray-400">
            Manage and configure your cloud-based virtual machines
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          New VM Instance
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-[320px] bg-dark-300/50 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vms.map((vm) => (
            <CloudVMCard key={vm.id} vm={vm} />
          ))}
        </div>
      )}
    </div>
  );
};