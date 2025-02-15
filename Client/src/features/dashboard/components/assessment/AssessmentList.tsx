import React, { useState } from 'react';
import { 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Users, 
  Calendar,
  Brain,
  AlertCircle,
  Check,
  Loader,
  X
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
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

interface AssessmentListProps {
  assessments: Assessment[];
  onRefresh: () => void;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Assessment;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onConfirm,
  isDeleting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Delete Assessment</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete <span className="font-semibold">{assessment.title}</span>? 
            This action cannot be undone.
          </p>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="btn-primary bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Deleting...
                </span>
              ) : (
                'Delete Assessment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AssessmentList: React.FC<AssessmentListProps> = ({ 
  assessments,
  onRefresh
}) => {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    assessment: Assessment | null;
  }>({
    isOpen: false,
    assessment: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const admin = JSON.parse(localStorage.getItem('auth') ?? '{}').result || {};

  const handleDelete = async () => {
    if (!deleteModal.assessment) return;

    setIsDeleting(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/deleteAssessment', {
        assessment_id: deleteModal.assessment.id,
        admin_id: admin.id
      });

      if (response.data.success) {
        setNotification({
          type: 'success',
          message: 'Assessment deleted successfully'
        });
        setTimeout(() => {
          setDeleteModal({ isOpen: false, assessment: null });
          setNotification(null);
          onRefresh();
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to delete assessment');
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete assessment'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass-panel">
      {notification && (
        <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-500/20 border border-emerald-500/20' 
            : 'bg-red-500/20 border border-red-500/20'
        }`}>
          {notification.type === 'success' ? (
            <Check className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
          <span className={notification.type === 'success' ? 'text-emerald-200' : 'text-red-200'}>
            {notification.message}
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400 border-b border-primary-500/10">
              <th className="pb-4 pl-4">Assessment</th>
              <th className="pb-4">Assigned Users</th>
              <th className="pb-4">Duration</th>
              <th className="pb-4">Passing Marks</th>
              <th className="pb-4">Status</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((assessment) => (
              <tr 
                key={assessment.id} 
                className="border-b border-primary-500/10 hover:bg-dark-300/50 transition-colors"
              >
                <td className="py-4 pl-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="h-5 w-5 text-primary-400" />
                    <div>
                      <p className="text-gray-200 font-medium">{assessment.title}</p>
                      <p className="text-sm text-gray-400">{assessment.description}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    {/* {assessment.assignedUsers.length} users */}
                    10 users                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(assessment.startDate).toLocaleDateString()} - {new Date(assessment.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center text-gray-400">
                    <Brain className="h-4 w-4 mr-2" />
                    {assessment.passingMarks}%
                  </div>
                </td>
                <td className="py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    assessment.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                    assessment.status === 'draft' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-primary-500/20 text-primary-300'
                  }`}>
                    {assessment.status}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                    >
                      <Pencil className="h-4 w-4 text-primary-400" />
                    </button>
                    <button 
                      onClick={() => setDeleteModal({ 
                        isOpen: true, 
                        assessment 
                      })}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                    <button className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, assessment: null })}
        assessment={deleteModal.assessment!}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};