import React, { useEffect, useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  Clock, Tag, BookOpen, Play, FolderX, Brain, 
  ExternalLink, Sparkles, Target, TrendingUp, 
  BarChart, Award
} from 'lucide-react';
import axios from 'axios';

// Add interfaces for type safety
interface AIRecommendation {
  id: string;
  title: string;
  difficulty: string;
  duration: number;
  matchScore: number;
  skills: string[];
  prerequisites: string[];
  completionRate: number;
}

interface SkillProgress {
  skill: string;
  level: number;
  progress: number;
}

export const MyLabs: React.FC = () => {
  const [labs, setLabs] = useState([]);
  const [labStatus, setLabStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

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

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setRecommendations([
          {
            id: '1',
            title: "Advanced Cloud Architecture",
            difficulty: "Intermediate",
            duration: 120,
            matchScore: 95,
            skills: ["AWS", "Cloud Design", "Scalability"],
            prerequisites: ["Basic Cloud Knowledge", "Networking Fundamentals"],
            completionRate: 78
          },
          {
            id: '2',
            title: "Kubernetes Security Essentials",
            difficulty: "Advanced",
            duration: 90,
            matchScore: 88,
            skills: ["Kubernetes", "Security", "Container Orchestration"],
            prerequisites: ["Docker", "Basic Kubernetes"],
            completionRate: 65
          }
        ]);

        setSkillProgress([
          { skill: "Cloud Computing", level: 3, progress: 65 },
          { skill: "DevOps", level: 2, progress: 45 },
          { skill: "Security", level: 1, progress: 30 }
        ]);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
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
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
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

      {/* AI Recommendations Sidebar */}
      <div className="hidden lg:block w-80">
        <div className="glass-panel sticky top-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              <GradientText>AI Recommendations</GradientText>
            </h2>
            <Sparkles className="h-5 w-5 text-primary-400" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Your Skills</span>
              <Target className="h-4 w-4 text-primary-400" />
            </div>
            {skillProgress.map((skill) => (
              <div key={skill.skill} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">{skill.skill}</span>
                  <span className="text-primary-400">Level {skill.level}</span>
                </div>
                <div className="h-1.5 bg-dark-400 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                    style={{ width: `${skill.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-dark-300/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300">Learning Path Progress</span>
              <TrendingUp className="h-4 w-4 text-accent-400" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-500 to-secondary-500 rounded-full"
                    style={{ width: '45%' }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-accent-400">45%</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Recommended Next Steps</span>
              <BarChart className="h-4 w-4 text-primary-400" />
            </div>
            
            {recommendations.map((lab) => (
              <div key={lab.id} 
                   className="p-4 bg-dark-300/50 rounded-lg hover:bg-dark-300 
                            transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-200">{lab.title}</h3>
                  <div className="flex items-center">
                    <Award className="h-3 w-3 mr-1 text-primary-400" />
                    <span className="text-xs font-medium text-primary-400">
                      {lab.matchScore}% match
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {lab.skills.map((skill) => (
                      <span key={skill} 
                            className="px-1.5 py-0.5 text-xs rounded-full 
                                     bg-primary-500/10 text-primary-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <Brain className="h-3 w-3 mr-1" />
                    {lab.prerequisites.length} prerequisites
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {lab.duration} mins
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {lab.completionRate}% completion rate
                  </span>
                </div>

                <button className="w-full px-3 py-1.5 text-xs font-medium rounded-lg
                                 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20
                                 transition-colors flex items-center justify-center">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};