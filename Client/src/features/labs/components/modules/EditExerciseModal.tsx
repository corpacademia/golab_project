import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { Exercise } from '../../types/modules';
import axios from 'axios';

interface EditExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  exercise: Exercise | null;
  onSave: (moduleId: string, exercise: Exercise) => void;
}

export const EditExerciseModal: React.FC<EditExerciseModalProps> = ({ 
  isOpen, 
  onClose, 
  moduleId, 
  exercise, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Exercise>({
    id: '',
    title: '',
    type: 'lab',
    description: '',
    order: 1,
    duration: 30
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (exercise) {
      setFormData({ ...exercise });
    } else {
      setFormData({
        id: `exercise-${Date.now()}`,
        title: '',
        type: 'lab',
        description: '',
        order: 1,
        duration: 30
      });
    }
  }, [exercise, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setApiError(null);

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Exercise title is required');
      }

      // Determine if this is an update or create operation
      if (exercise) {
        // Update existing exercise
        console.log(formData)
        try {
          const response = await axios.put(`http://localhost:3000/api/v1/cloud_slice_ms/updateExercise`, {
            ...formData,
            moduleId
          });
          
          if (response.data.success) {
            // Save exercise
            onSave(moduleId, formData);
            onClose();
          } else {
            setApiError(response.data.message || 'Failed to update exercise');
          }
        } catch (err: any) {
          setApiError(err.response?.data?.message || 'An error occurred while updating the exercise');
        }
      } else {
        // Create new exercise
        try {
          const response = await axios.post(`http://localhost:3000/api/v1/cloud_slice_ms/createExercise`, {
            ...formData,
            moduleId
          });
          
          if (response.data.success) {
            // Save exercise with the ID from the response
            const savedExercise = {
              ...formData,
              id: response.data.data.id || formData.id
            };
            onSave(moduleId, savedExercise);
            onClose();
          } else {
            setApiError(response.data.message || 'Failed to create exercise');
          }
        } catch (err: any) {
          setApiError(err.response?.data?.message || 'An error occurred while creating the exercise');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>{exercise ? 'Edit Exercise' : 'Add Exercise'}</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Exercise Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={formData.type === 'lab'}
                  onChange={() => setFormData({ ...formData, type: 'lab' })}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-gray-300">Lab</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={formData.type === 'questions'}
                  onChange={() => setFormData({ ...formData, type: 'questions' })}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-gray-300">Quiz</span>
              </label>
            </div>
          </div>

          {formData.type === 'questions' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Order
              </label>
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
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

          {apiError && (
            <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-200">{apiError}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
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
                  Saving...
                </span>
              ) : (
                'Save Exercise'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};