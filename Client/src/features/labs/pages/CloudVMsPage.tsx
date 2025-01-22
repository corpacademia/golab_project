import React, { useEffect, useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { CloudVMCard } from '../components/cloudvm/CloudVMCard';
import { Plus, Search, Filter } from 'lucide-react';
import axios from 'axios';

export const CloudVMsPage: React.FC = () => {
  const [vms, setVMs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    provider: '',
    status: ''
  });
  const admin= JSON.parse(localStorage.getItem('auth')).result || {}
  useEffect(() => {
    const fetchVMs = async () => {
      try {
        // setError(null);
        const response = await axios.post('http://localhost:3000/api/v1/getLabsConfigured',{
          admin_id : admin.id
        });
//         const response = await axios.get('http://localhost:3000/api/v1/getCloudVMs');
// >>>>>>> 23250d309ae92a91506061c076413738f22e59c9
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
 console.log(vms)
  const filteredVMs = vms.filter(vm => {
    const matchesSearch = !filters.search || 
      vm.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      vm.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesProvider = !filters.provider || vm.provider === filters.provider;
    const matchesStatus = !filters.status || vm.status === filters.status;
    return matchesSearch && matchesProvider && matchesStatus;
  });

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

      {/* Filters */}
      <div className="glass-panel p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search VMs..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg 
                       text-gray-300 placeholder-gray-500 focus:border-primary-500/40 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={filters.provider}
              onChange={(e) => setFilters(prev => ({ ...prev, provider: e.target.value }))}
              className="px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg 
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
            >
              <option value="">All Providers</option>
              <option value="aws">AWS</option>
              <option value="azure">Azure</option>
              <option value="gcp">GCP</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg 
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
              <option value="pending">Pending</option>
            </select>

            <button className="btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* VM Grid */}
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
          {filteredVMs.map((vm) => (
            <CloudVMCard key={vm.id} vm={vm} />
          ))}
        </div>
      )}
    </div>
  );
};