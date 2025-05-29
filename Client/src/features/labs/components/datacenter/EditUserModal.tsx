import React, { useState } from 'react';
import { X, AlertCircle, Check, Loader } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    username: string;
    password: string;
    ip: string;
    port: string;
    protocol: string;
  };
  vmId: string;
  vm:any;
  onSave: (userData: any) => Promise<void>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  vmId,
  vm,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    id: user?.id || '',
    username: user?.username || '',
    password: user?.password || '',
    ip: user?.ip || '',
    port: user?.port || '',
    protocol: user?.protocol || 'RDP',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await onSave(formData);
      setSuccess('User updated successfully');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] overflow-auto"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="bg-dark-200 rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Edit User</GradientText>
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
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg text-gray-300 focus:border-primary-500/40 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg text-gray-300 focus:border-primary-500/40 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              IP Address
            </label>
            <input
              type="text"
              name="ip"
              value={formData.ip}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg text-gray-300 focus:border-primary-500/40 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Port
            </label>
            <input
              type="text"
              name="port"
              value={formData.port}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg text-gray-300 focus:border-primary-500/40 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Protocol
            </label>
            <select
              name="protocol"
              value={formData.protocol}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg text-gray-300 focus:border-primary-500/40 focus:outline-none"
              required
            >
              <option value="RDP">RDP</option>
              <option value="SSH">SSH</option>
              <option value="VNC">VNC</option>
            </select>
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
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};