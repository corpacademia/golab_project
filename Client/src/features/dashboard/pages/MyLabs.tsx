import React, { useEffect, useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { Clock, Tag, BookOpen, Play, Search, Filter, Brain, Sparkles } from 'lucide-react';
import axios from 'axios';

interface Lab {
  lab_id: string;
  title: string;
  description: string;
  duration: number;
  provider: string;
}

export const MyLabs: React.FC = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [labStatus, setLabStatus] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState<Lab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    provider: '',
    status: '',
  });

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('auth') || '{}').result;
        const catalogues = await axios.get('http://localhost:3000/api/v1/getCatalogues');
        const labs = await axios.post('http://localhost:3000/api/v1/getlabonid', {
          userId: user.id
        });
        
        const cats = catalogues.data.data;
        const labss = labs.data.data;
        
        const filteredCatalogues = cats.filter((cat) => {
          return labss.some((lab) => lab.lab_id === cat.lab_id);
        });
        
        setLabs(filteredCatalogues);
        setFilteredLabs(filteredCatalogues);
        setLabStatus(labss);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching labs:', error);
        setIsLoading(false);
      }
    };

    fetchLabs();
  }, []);

  useEffect(() => {
    const filtered = labs.filter(lab => {
      const matchesSearch = lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lab.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProvider = !filters.provider || lab.provider === filters.provider;
      const matchesStatus = !filters.status || labStatus.find(s => s.lab_id === lab.lab_id)?.status === filters.status;
      
      return matchesSearch && matchesProvider && matchesStatus;
    });
    setFilteredLabs(filtered);
  }, [searchQuery, filters, labs, labStatus]);

  // Get recommended labs (first 2 labs that are not completed)
  const recommendedLabs = labs.filter((_, index) => 
    labStatus[index]?.status !== 'completed'
  ).slice(0, 2);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-bold">
          <GradientText>My Labs</GradientText>
        </h1>
        <button className="btn-secondary">
          <Brain className="h-4 w-4 mr-2" />
          Get AI Recommendations
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass-panel">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search labs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg 
                       text-gray-300 placeholder-gray-500 focus:border-primary-500/40 focus:outline-none 
                       focus:ring-2 focus:ring-primary-500/20 transition-colors"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={filters.provider}
              onChange={(e) => setFilters(prev => ({ ...prev, provider: e.target.value }))}
              className="px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg 
                       text-gray-300 focus:border-primary-500/40 focus:outline-none 
                       focus:ring-2 focus:ring-primary-500/20 transition-colors"
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
                       text-gray-300 focus:border-primary-500/40 focus:outline-none 
                       focus:ring-2 focus:ring-primary-500/20 transition-colors"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_started">Not Started</option>
            </select>

            <button className="btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* AI Recommended Labs */}
      {recommendedLabs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary-400" />
            <div>
              <h2 className="text-xl font-semibold">
                <GradientText>Recommended Next Steps</GradientText>
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Continue your learning journey with these recommended labs
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedLabs.map((lab, index) => (
              <div key={lab.lab_id} 
                   className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                            hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                            transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                            hover:translate-y-[-2px] group">
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">
                        <GradientText>{lab.title}</GradientText>
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{lab.description}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
                      Recommended
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                      <span className="truncate">{lab.duration} mins</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Tag className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                      <span className="truncate">{lab.provider}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <BookOpen className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                      <span className="truncate">Lab #{lab.lab_id}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-primary-500/10">
                    <button className="w-full px-4 py-2 rounded-lg text-sm font-medium
                                    bg-gradient-to-r from-primary-500 to-secondary-500
                                    hover:from-primary-400 hover:to-secondary-400
                                    transform hover:scale-105 transition-all duration-300
                                    text-white shadow-lg shadow-primary-500/20 flex items-center justify-center">
                      <Play className="h-4 w-4 mr-2" />
                      Start Lab
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Labs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLabs.map((lab, index) => (
          <div key={lab.lab_id} 
               className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                        hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                        transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                        hover:translate-y-[-2px] group">
            <div className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">
                    <GradientText>{lab.title}</GradientText>
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{lab.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  labStatus[index]?.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                  labStatus[index]?.status === 'in_progress' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-primary-500/20 text-primary-300'
                }`}>
                  {labStatus[index]?.status || 'Not Started'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                  <span className="truncate">{lab.duration} mins</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Tag className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                  <span className="truncate">{lab.provider}</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <BookOpen className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                  <span className="truncate">Lab #{lab.lab_id}</span>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-primary-500/10">
                <button className="w-full px-4 py-2 rounded-lg text-sm font-medium
                                bg-gradient-to-r from-primary-500 to-secondary-500
                                hover:from-primary-400 hover:to-secondary-400
                                transform hover:scale-105 transition-all duration-300
                                text-white shadow-lg shadow-primary-500/20 flex items-center justify-center">
                  <Play className="h-4 w-4 mr-2" />
                  {labStatus[index]?.status === 'completed' ? 'Review Lab' : 
                   labStatus[index]?.status === 'in_progress' ? 'Continue Lab' : 'Start Lab'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};