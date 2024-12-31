import React, { useState } from 'react';
import { X, BookOpen, AlertCircle } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';

interface AssignLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface Lab {
  id: string;
  title: string;
  description: string;
  duration: number;
  technologies: string[];
}

// Mock available labs - Replace with API call
const availableLabs: Lab[] = [
  {
    id: '1',
    title: 'Advanced Cloud Architecture',
    description: 'Design and implement scalable cloud solutions',
    duration: 180,
    technologies: ['AWS', 'Azure', 'GCP']
  },
  {
    id: '2',
    title: 'Kubernetes in Production',
    description: 'Deploy and manage production-grade Kubernetes clusters',
    duration: 240,
    technologies: ['Kubernetes', 'Docker', 'Helm']
  },
  {
    id: '3',
    title: 'CI/CD Pipeline Implementation',
    description: 'Build automated deployment pipelines',
    duration: 120,
    technologies: ['Jenkins', 'GitLab', 'GitHub Actions']
  }
];

export const AssignLabModal: React.FC<AssignLabModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [selectedLab, setSelectedLab] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedLab) {
      setError('Please select a lab');
      return;
    }

    setIsAssigning(true);
    setError(null);

    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onClose();
    } catch (err) {
      setError('Failed to assign lab. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Assign Lab</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Lab
            </label>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none
                       focus:ring-2 focus:ring-primary-500/20 transition-colors"
            >
              <option value="">Select a lab</option>
              {availableLabs.map(lab => (
                <option key={lab.id} value={lab.id}>
                  {lab.title}
                </option>
              ))}
            </select>
          </div>

          {selectedLab && (
            <div className="p-4 bg-dark-300/50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <BookOpen className="h-5 w-5 text-primary-400" />
                <h3 className="font-medium text-gray-200">
                  {availableLabs.find(l => l.id === selectedLab)?.title}
                </h3>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                {availableLabs.find(l => l.id === selectedLab)?.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {availableLabs.find(l => l.id === selectedLab)?.technologies.map(tech => (
                  <span 
                    key={tech}
                    className="px-2 py-1 text-xs font-medium rounded-full
                             bg-primary-500/20 text-primary-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-400">
                Duration: {availableLabs.find(l => l.id === selectedLab)?.duration} minutes
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-200">{error}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={isAssigning}
              className="btn-primary"
            >
              {isAssigning ? 'Assigning...' : 'Assign Lab'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};