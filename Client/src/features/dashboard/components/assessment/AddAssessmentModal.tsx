import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Check, Loader, Calendar, Upload, Users, Brain } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import axios from 'axios';

interface AddAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  passingMarks: number;
  instructions: string;
  attachments: File[];
  assignedUsers: string[];
}

export const AddAssessmentModal: React.FC<AddAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    passingMarks: 60,
    instructions: '',
    attachments: [],
    assignedUsers: []
  });

  const [users, setUsers] = useState<{ id: string; name: string; email: string; }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);

  const admin = JSON.parse(localStorage.getItem('auth') ?? '{}').result || {};

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/v1/getOrganizationUsers', {
          admin_id: admin.id
        });
        setUsers(response.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, admin.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit

    if (validFiles.length !== files.length) {
      setError('Some files exceeded the 10MB size limit');
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    if (!formData.endDate) {
      setError('End date is required');
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after start date');
      return false;
    }
    if (formData.assignedUsers.length === 0) {
      setError('Please assign at least one user');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/createAssessment', {
        ...formData,
        admin_id: admin.id
      });

      if (response.data.success) {
        setSuccess('Assessment created successfully');
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to create assessment');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      passingMarks: 60,
      instructions: '',
      attachments: [],
      assignedUsers: []
    });
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Create New Assessment</GradientText>
          </h2>
          <button 
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
                placeholder="Enter assessment title"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none resize-none h-20"
                placeholder="Enter assessment description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Passing Marks (%)
              </label>
              <div className="relative">
                <Brain className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <input
                  type="number"
                  name="passingMarks"
                  min="0"
                  max="100"
                  value={formData.passingMarks}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assign Users
              </label>
              <div 
                onClick={() => setIsUsersDropdownOpen(!isUsersDropdownOpen)}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 cursor-pointer flex justify-between items-center"
              >
                <span>
                  {formData.assignedUsers.length 
                    ? `${formData.assignedUsers.length} user${formData.assignedUsers.length > 1 ? 's' : ''} selected` 
                    : 'Select users'}
                </span>
                <Users className="h-5 w-5 text-gray-500" />
              </div>
              
              {isUsersDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-dark-200 border border-primary-500/20 rounded-lg shadow-lg">
                  <div className="max-h-48 overflow-y-auto py-1">
                    {users.map(user => (
                      <label 
                        key={user.id} 
                        className="flex items-center space-x-3 px-4 py-2 hover:bg-dark-300/50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedUsers.includes(user.id)}
                          onChange={() => {
                            setFormData(prev => ({
                              ...prev,
                              assignedUsers: prev.assignedUsers.includes(user.id)
                                ? prev.assignedUsers.filter(id => id !== user.id)
                                : [...prev.assignedUsers, user.id]
                            }));
                          }}
                          className="form-checkbox h-4 w-4 text-primary-500 rounded border-gray-500/20"
                        />
                        <div>
                          <p className="text-gray-300">{user.name}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none resize-none h-32"
                placeholder="Enter assessment instructions"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Attachments
              </label>
              <div className="space-y-4">
                <label className="flex items-center justify-center w-full h-32 px-4 transition bg-dark-400/50 border-2 border-primary-500/20 border-dashed rounded-lg appearance-none cursor-pointer hover:border-primary-500/40 focus:outline-none">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-6 h-6 text-primary-400" />
                    <span className="text-sm text-gray-400">
                      Click to upload files (Max 10MB each)
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>

                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 bg-dark-300/50 rounded-lg"
                      >
                        <span className="text-sm text-gray-300 truncate">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-dark-300 rounded-lg text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-200">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-emerald-400" />
                <span className="text-emerald-200">{success}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </span>
              ) : (
                'Create Assessment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};