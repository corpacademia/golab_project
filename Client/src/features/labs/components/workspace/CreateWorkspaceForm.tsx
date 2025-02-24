import React, { useState } from 'react';
import { Calendar, Upload, X } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';

interface CreateWorkspaceFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const CreateWorkspaceForm: React.FC<CreateWorkspaceFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'single-vm',
    createdAt: new Date().toISOString().split('T')[0],
  });

  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, file });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold mb-6">
          <GradientText>Create Workspace</GradientText>
        </h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Lab Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                     text-gray-300 focus:border-primary-500/40 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                     text-gray-300 focus:border-primary-500/40 focus:outline-none"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Lab Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                     text-gray-300 focus:border-primary-500/40 focus:outline-none"
            required
          >
            <option value="single-vm">Single VM</option>
            <option value="dedicated-vm">Dedicated VM</option>
            <option value="vm-cluster">VM Cluster</option>
            <option value="cloud-slice">Cloud Slice</option>
            <option value="emulated">Emulated Environment</option>
            <option value="hybrid">Hybrid Lab</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Documents
          </label>
          <div className="border-2 border-dashed border-primary-500/20 rounded-lg p-8">
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-primary-400 mb-4" />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-primary-400 hover:text-primary-300"
              >
                Upload files
              </label>
              <p className="mt-1 text-sm text-gray-400">
                or drag and drop
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Create Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.createdAt}
              onChange={(e) => setFormData(prev => ({ ...prev, createdAt: e.target.value }))}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
              required
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-primary-500/10">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          Create Workspace
        </button>
      </div>
    </form>
  );
};