import React, { useState } from 'react';
import { X, AlertCircle, Loader } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (storageChange: { increase: number; decrease: number }) => Promise<void>;
  currentStorage: number;
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentStorage
}) => {
  const [increaseStorage, setIncreaseStorage] = useState(0);
  const [decreaseStorage, setDecreaseStorage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (decreaseStorage > currentStorage) {
      setError('Decrease amount cannot be greater than current storage');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ increase: increaseStorage, decrease: decreaseStorage });
      onClose();
    } catch (error) {
      console.error('Error updating storage:', error);
      setError('Failed to update storage');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Modify Storage</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-dark-300/50 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Current Storage</p>
            <p className="text-2xl font-semibold text-gray-200">{currentStorage} GB</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Increase Storage (GB)
              </label>
              <input
                type="number"
                value={increaseStorage}
                onChange={(e) => setIncreaseStorage(Math.max(0, Number(e.target.value)))}
                min="0"
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Decrease Storage (GB)
              </label>
              <input
                type="number"
                value={decreaseStorage}
                onChange={(e) => setDecreaseStorage(Math.max(0, Number(e.target.value)))}
                min="0"
                max={currentStorage}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (increaseStorage === 0 && decreaseStorage === 0)}
              className="btn-primary"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Updating...
                </span>
              ) : (
                'Update Storage'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};