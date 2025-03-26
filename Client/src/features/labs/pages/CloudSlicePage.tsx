import React, { useState, useEffect } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { Plus, Search, Filter, AlertCircle, FolderX, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CloudSlice {
  id: string;
  name: string;
  provider: string;
  region: string;
  services: string[];
  status: 'active' | 'inactive' | 'pending';
  startDate: string;
  endDate: string;
  cleanupPolicy: string;
  credits: number;
}

export const CloudSlicePage: React.FC = () => {
  const navigate = useNavigate();
  const [cloudSlices, setCloudSlices] = useState<CloudSlice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    provider: '',
    status: '',
    level: ''
  });

  useEffect(() => {
    const fetchCloudSlices = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/aws_ms/getCloudSlices');
        if (response.data.success) {
          setCloudSlices(response.data.data);
        } else {
          throw new Error('Failed to fetch cloud slices');
        }
      } catch (err) {
        console.error('Error fetching cloud slices:', err);
        setError('Failed to load cloud slices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCloudSlices();
  }, []);

  const filteredSlices = cloudSlices.filter(slice => {
    const matchesSearch = !filters.search || 
      slice.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesProvider = !filters.provider || slice.provider === filters.provider;
    const matchesStatus = !filters.status || slice.status === filters.status;
    return matchesSearch && matchesProvider && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">
            <GradientText>Cloud Slices</GradientText>
          </h1>
          <p className="mt-2 text-gray-400">
            Manage and configure cloud environment slices
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/labs/create')}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Cloud Slice
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search cloud slices..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg 
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
            >
              <option value="">All Levels</option>
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <button className="btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-panel p-4 border-red-500/20">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 text-primary-400 animate-spin" />
        </div>
      ) : (
        <>
          {filteredSlices.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 rounded-full bg-dark-300/50">
                  <FolderX className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300">
                  No Cloud Slices Found
                </h3>
                <p className="text-gray-400 max-w-md">
                  {filters.search || filters.provider || filters.status
                    ? "No cloud slices match your current filters. Try adjusting your search criteria."
                    : "You haven't created any cloud slices yet. Click 'New Cloud Slice' to get started."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSlices.map((slice) => (
                <div 
                  key={slice.id}
                  className="glass-panel hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-200">{slice.name}</h3>
                      <p className="text-sm text-gray-400">{slice.provider} • {slice.region}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      slice.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                      slice.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {slice.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {slice.services.map((service, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Start Date:</p>
                        <p className="text-gray-200">
                          {new Date(slice.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">End Date:</p>
                        <p className="text-gray-200">
                          {new Date(slice.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Cleanup Policy:</p>
                        <p className="text-gray-200">{slice.cleanupPolicy}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Credits:</p>
                        <p className="text-gray-200">${slice.credits.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};