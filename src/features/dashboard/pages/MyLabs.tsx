import React, { useEffect, useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { Clock, Tag, BookOpen, Play, FolderX } from 'lucide-react';
import axios from 'axios';

export const MyLabs: React.FC = () => {
  const [labs, setLabs] = useState([]);
  const [labStatus, setLabStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        setLabStatus(labss);
      } catch (error) {
        console.error('Error fetching labs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabs();
  }, []);

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
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">
        <GradientText>My Labs</GradientText>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {labs.map((lab, index) => (
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