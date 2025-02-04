
import React, { useEffect, useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  Clock, Tag, BookOpen, Play, FolderX, Brain, 
  Search, Filter, Sparkles, Target, TrendingUp
} from 'lucide-react';
import axios from 'axios';

interface Filters {
  search: string;
  provider: string;
  status: string;
}

export const MyLabs: React.FC = () => {
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [labStatus, setLabStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    provider: '',
    status: ''
  });
  // Fetch labs data
  useEffect(() => {
    const fetchLabs = async () => {

      try {
        const user = JSON.parse(localStorage.getItem('auth') || '{}').result;
        const catalogues = await axios.get('http://localhost:3000/api/v1/getCatalogues');
        const labs = await axios.post('http://localhost:3000/api/v1/getAssignedLabs', {
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
      } catch (error) {
        console.error('Error fetching labs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabs();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...labs];

    if (filters.search) {
      result = result.filter(lab => 
        lab.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        lab.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.provider) {
      result = result.filter(lab => lab.provider.toLowerCase() === filters.provider.toLowerCase());
    }

    if (filters.status) {
      result = result.filter((lab, index) => 
        labStatus[index]?.status === filters.status
      );
    }

    setFilteredLabs(result);
  }, [filters, labs, labStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="glass-panel p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold mb-2">
              <GradientText>My Labs</GradientText>
            </h1>
            <p className="text-gray-400">Track your progress and continue your learning journey</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search labs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 placeholder-gray-500 focus:border-primary-500/40 focus:outline-none
                         focus:ring-2 focus:ring-primary-500/20 transition-colors"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            </div>

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
              <option value="ibm">IBM</option>
              <option value="oracle">Oracle</option>
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
              <option value="pending">Pending</option>
            </select>

            <button 
              onClick={() => setFilters({ search: '', provider: '', status: '' })}
              className="btn-secondary whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-6 w-6 text-primary-400" />
          <div>
            <h2 className="text-lg font-semibold">
              <GradientText>AI Recommendations</GradientText>
            </h2>
            <p className="text-sm text-gray-400">Personalized suggestions based on your progress</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-dark-300/50 rounded-lg border border-primary-500/20 hover:border-primary-500/40 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-5 w-5 text-primary-400" />
              <h3 className="font-medium text-gray-200">Next Best Lab</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">Complete AWS Solutions Architect to advance your cloud skills</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-primary-400">98% match</span>
              <button className="text-xs text-primary-400 hover:text-primary-300">View Details →</button>
            </div>
          </div>

          <div className="p-4 bg-dark-300/50 rounded-lg border border-primary-500/20 hover:border-primary-500/40 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-accent-400" />
              <h3 className="font-medium text-gray-200">Skill Gap</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">Focus on Kubernetes to strengthen your container orchestration</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-accent-400">Key skill</span>
              <button className="text-xs text-accent-400 hover:text-accent-300">Explore Labs →</button>
            </div>
          </div>

          <div className="p-4 bg-dark-300/50 rounded-lg border border-primary-500/20 hover:border-primary-500/40 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-secondary-400" />
              <h3 className="font-medium text-gray-200">Learning Path</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">Continue Cloud Architecture path - 65% complete</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-secondary-400">In Progress</span>
              <button className="text-xs text-secondary-400 hover:text-secondary-300">Resume →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Cards */}
      {filteredLabs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] glass-panel">
          <FolderX className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            <GradientText>No Labs Found</GradientText>
          </h2>
          <p className="text-gray-400 text-center max-w-md mb-6">
            {labs.length === 0 
              ? "You haven't been assigned any labs yet. Check out our lab catalogue to get started."
              : "No labs match your current filters. Try adjusting your search criteria."}
          </p>
          {labs.length === 0 && (
            <a 
              href="/dashboard/labs/catalogue"
              className="btn-primary"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Lab Catalogue
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rest of the lab cards code remains the same */}
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
      )}
    </div>
  );
};
