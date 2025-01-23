import React, { useState } from 'react';
import { 
  Clock, 
  Tag, 
  BookOpen, 
  AlertCircle,
  Check,
  X,
  Cpu,
  Hash,
  FileCode,
  HardDrive,
  Server,
  UserPlus
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import axios from 'axios';

interface AssessmentCardProps {
  assessment: {
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
  };
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleCreateUser = async () => {
    if (!email) {
      setNotification({ type: 'error', message: 'Please enter an email address' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/createAssessmentUser', {
        email,
        assessment_id: assessment.assessment_id
      });

      if (response.data.success) {
        setNotification({ type: 'success', message: 'User created successfully' });
        setEmail('');
        setTimeout(() => {
          setIsModalOpen(false);
          setNotification(null);
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to create user');
      }
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to create user'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                    hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                    transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                    hover:translate-y-[-2px] group relative">
      {notification && (
        <div className={`absolute top-2 right-2 px-4 py-2 rounded-lg flex items-center space-x-2 z-50 ${
          notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
        }`}>
          {notification.type === 'success' ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm">{notification.message}</span>
        </div>
      )}
      
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              <GradientText>{assessment.title}</GradientText>
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{assessment.description}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            assessment.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
            assessment.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
            'bg-amber-500/20 text-amber-300'
          }`}>
            {assessment.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <Cpu className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">{assessment.cpu} vCPU</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Tag className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">{assessment.ram}GB RAM</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Server className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">Instance: {assessment.instance}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <HardDrive className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">Storage: {assessment.storage}GB</span>
          </div>
        </div>

        {/* Software Details */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Software Installed:</h4>
          <div className="flex flex-wrap gap-2">
            {assessment.software.map((software, index) => (
              <span key={index} className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
                {software}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-primary-500/10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full h-9 px-4 rounded-lg text-sm font-medium
                     bg-gradient-to-r from-primary-500 to-secondary-500
                     hover:from-primary-400 hover:to-secondary-400
                     transform hover:scale-105 transition-all duration-300
                     text-white shadow-lg shadow-primary-500/20
                     flex items-center justify-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create Users
          </button>
        </div>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-200 rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                <GradientText>Create Assessment User</GradientText>
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setNotification(null);
                  setEmail('');
                }}
                className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter user's email"
                  className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 placeholder-gray-500 focus:border-primary-500/40 focus:outline-none
                           focus:ring-2 focus:ring-primary-500/20 transition-colors"
                />
              </div>

              <button
                onClick={handleCreateUser}
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};