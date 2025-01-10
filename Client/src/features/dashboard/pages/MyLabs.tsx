import React, { useEffect, useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { Clock, Tag, BookOpen, Play, FolderX, Search, Brain, Filter, Star, Target, Sparkles } from 'lucide-react';
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
  const [filteredLabs, setFilteredLabs] = useState<Lab[]>([]);
  const [labStatus, setLabStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);

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
      } catch (error) {
        console.error('Error fetching labs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabs();
  }, []);

  useEffect(() => {
    const filtered = labs.filter(lab => {
      const matchesSearch = lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lab.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProvider = !selectedProvider || lab.provider === selectedProvider;
      return matchesSearch && matchesProvider;
    });
    setFilteredLabs(filtered);
  }, [searchTerm, selectedProvider, labs]);

  const AIRecommendationsPanel = () => (
    <div className="glass-panel space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          <GradientText>AI Recommendations</GradientText>
        </h2>
        <Brain className="h-5 w-5 text-primary-400" />
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-dark-300/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-primary-400" />
            <h3 className="font-medium text-gray-200">Next Best Lab</h3>
          </div>
          <p className="text-sm text-gray-400 mb-3">Based on your progress and interests</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-gray-300">98% Match</span>
            </div>
            <button className="btn-secondary text-sm">View Details</button>
          </div>
        </div>

        <div className="p-4 bg-dark-300/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-4 w-4 text-accent-400" />
            <h3 className="font-medium text-gray-200">Learning Path Progress</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cloud Architecture</span>
              <span className="text-primary-400">75%</span>
            </div>
            <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (labs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass-panel">
        <FolderX className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          <GradientText>No Labs Available</GradientText>
        </h2>
        <p className="text-gray-400 text-center max-w-md mb-6">
          You haven't been assigned any labs yet. Check out our lab catalogue to get started with your learning journey.
        </p>
        <a 
          href="/dashboard/labs/catalogue"
          className="btn-primary"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Browse Lab Catalogue
        </a>
      </div>
    );
  }

  return (
    <div className="flex space-x-6">
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-display font-bold">
            <GradientText>My Labs</GradientText>
          </h1>
          <button 
            onClick={() => setShowAIRecommendations(!showAIRecommendations)}
            className="btn-secondary md:hidden"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Insights
          </button>
        </div>

        <div className="glass-panel p-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search labs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg 
                       text-gray-300 placeholder-gray-500 focus:border-primary-500/40 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg 
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
            >
              <option value="">All Providers</option>
              <option value="aws">AWS</option>
              <option value="azure">Azure</option>
              <option value="gcp">GCP</option>
            </select>

            <button className="btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* AI Recommendations Sidebar - Hidden on mobile, shown on larger screens */}
      <div className="hidden md:block w-80 space-y-6">
        <AIRecommendationsPanel />
      </div>

      {/* Mobile AI Recommendations Modal */}
      {showAIRecommendations && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 md:hidden p-4">
          <div className="w-full max-w-md">
            <AIRecommendationsPanel />
            <button 
              onClick={() => setShowAIRecommendations(false)}
              className="mt-4 w-full btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};