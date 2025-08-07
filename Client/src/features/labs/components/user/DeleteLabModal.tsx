import React, { useState } from 'react';
import { X, AlertCircle, Check, Loader } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';

interface DeleteLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  labId: string;
  labTitle: string;
  onSuccess: () => void;
}

export const DeleteLabModal: React.FC<DeleteLabModalProps> = ({
  isOpen,
  onClose,
  labId,
  labTitle,
  onSuccess
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<any>({ id: 'user-123', name: 'Test User' });

  const handleDelete = async () => {
    if (!user) {
      setError('User information not available');
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    // Simulate API call
    setTimeout(() => {
      setSuccess('Lab deleted successfully');
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
      
      setIsDeleting(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Delete Lab</GradientText>
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
            Are you sure you want to delete <span className="font-semibold">{labTitle}</span>? This action cannot be undone.
          </p>

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
              onClick={onClose}
              className="btn-secondary"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-primary bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Deleting...
                </span>
              ) : (
                'Delete Lab'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};