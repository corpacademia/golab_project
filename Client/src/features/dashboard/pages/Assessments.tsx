import React, { useState, useEffect } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { Plus, Search, Filter, Calendar, AlertCircle, Check, Loader } from 'lucide-react';
import { AddAssessmentModal } from '../components/assessment/AddAssessmentModal';
import { AssessmentList } from '../components/assessment/AssessmentList';
import { AssessmentFilters } from '../components/assessment/AssessmentFilters';
import axios from 'axios';

interface Assessment {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  passingMarks: number;
  status: 'draft' | 'active' | 'completed';
  assignedUsers: string[];
  attachments: string[];
  createdAt: Date;
}

export const Assessments: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: ''
  });

  const admin = JSON.parse(localStorage.getItem('auth') ?? '{}').result || {};

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/v1/getAssessments', {
          admin_id: admin.id
        });

        if (response.data.success) {
          setAssessments(response.data.data);
          setFilteredAssessments(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch assessments');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch assessments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [admin.id]);

  useEffect(() => {
    const filtered = assessments.filter(assessment => {
      const matchesSearch = !filters.search || 
        assessment.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        assessment.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || assessment.status === filters.status;
      
      if (filters.dateRange) {
        const [start, end] = filters.dateRange.split(',').map(date => new Date(date));
        const assessmentDate = new Date(assessment.createdAt);
        if (assessmentDate < start || assessmentDate > end) return false;
      }
      
      return matchesSearch && matchesStatus;
    });

    setFilteredAssessments(filtered);
  }, [filters, assessments]);

  const handleFilterChange = (update: { key: string; value: string }) => {
    setFilters(prev => ({ ...prev, [update.key]: update.value }));
  };

  const handleAddSuccess = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/getAssessments', {
        admin_id: admin.id
      });

      if (response.data.success) {
        setAssessments(response.data.data);
        setFilteredAssessments(response.data.data);
      }
    } catch (err) {
      console.error('Error refreshing assessments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="glass-panel p-4 text-center">
        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">
            <GradientText>Assessments</GradientText>
          </h1>
          <p className="mt-2 text-gray-400">
            Create and manage assessments for your organization
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </button>
      </div>

      <AssessmentFilters 
        onFilterChange={handleFilterChange}
        filters={filters}
        setFilters={setFilters}
      />

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader className="h-8 w-8 text-primary-400 animate-spin" />
          <span className="ml-2 text-gray-400">Loading assessments...</span>
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="glass-panel p-8 text-center">
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              No Assessments Found
            </h3>
            <p className="text-gray-400 mb-6">
              {assessments.length === 0 
                ? "You haven't created any assessments yet. Click 'New Assessment' to get started."
                : "No assessments match your current filters. Try adjusting your search criteria."}
            </p>
            {assessments.length === 0 && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Assessment
              </button>
            )}
          </div>
        </div>
      ) : (
        <AssessmentList 
          assessments={filteredAssessments}
          onRefresh={handleAddSuccess}
        />
      )}

      <AddAssessmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};