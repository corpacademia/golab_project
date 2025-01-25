import React, { useState, useEffect } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { AssessmentCard } from '../../labs/components/assessment/AssessmentCard';
import { Plus, Search, Filter, FolderX } from 'lucide-react';
import axios from 'axios';

interface Assessment {
  assessment_id: string;
  title: string;
  description: string;
  provider: string;
  instance: string;
  instance_id?: string;
  status: 'active' | 'inactive' | 'pending';
  cpu: number;
  ram: number;
  storage: number;
  os: string;
  software: string[];
}
interface LabDetails{
  cpu:string,
  ram:string,
  storage:string,
  instance:string,
  description:string,
}

export const Assessments: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    provider: '',
    status: ''
  });
const [labDetails , setLabDetails] = useState<LabDetails | null>(null);


  const admin = JSON.parse(localStorage.getItem('auth')).result || {}


  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/v1/getAssessments',{
          admin_id:admin.id
        });
        if (response.data.success) {
          setAssessments(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching assessments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = !filters.search || 
      assessment.config_details.catalogueName.toLowerCase().includes(filters.search.toLowerCase()) 
      // ||
      // assessment.description.toLowerCase().includes(filters.search.toLowerCase());
    // const matchesProvider = !filters.provider || assessment.provider === filters.provider;
    // const matchesStatus = !filters.status || assessment.status === filters.status;
    return matchesSearch ;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">
            <GradientText>Assessments</GradientText>
          </h1>
          <p className="mt-2 text-gray-400">
            Manage and monitor assessment environments
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search assessments..."
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

            <button className="btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </button>
          </div>
        </div>
      </div>

      {/* Assessment Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-[320px] bg-dark-300/50 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] glass-panel">
          <FolderX className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            <GradientText>No Assessments Found</GradientText>
          </h2>
          <p className="text-gray-400 text-center max-w-md mb-6">
            {assessments.length === 0 
              ? "No assessments have been created yet."
              : "No assessments match your current filters. Try adjusting your search criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssessments.map((assessment) => (
            <AssessmentCard key={assessment.assessment_id} assessment={assessment} labDetails={labDetails}/>
          ))}
        </div>
      )}
    </div>
  );
};