import React, { useState } from 'react';
import { X, AlertCircle, Check, Loader, Building2, Mail, MapPin, Phone, Globe, Upload } from 'lucide-react';
import { GradientText } from '../../../components/ui/GradientText';
import axios from 'axios';

interface AddOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  adminName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  type: 'training' | 'enterprise' | 'education';
  logo?: File;
}

export const AddOrganizationModal: React.FC<AddOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    adminName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    type: 'enterprise'
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Logo file size must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Organization name is required');
      return false;
    }
    if (!formData.adminName.trim()) {
      setError('Admin name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Invalid email format');
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
      const response = await axios.post('http://localhost:3000/api/v1/addOrganization', formData);

      if (response.data.success) {
        setSuccess('Organization added successfully');
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to add organization');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      adminName: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      type: 'enterprise'
    });
    setError(null);
    setSuccess(null);
    setLogoPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Add Organization</GradientText>
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Organization Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter organization name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Name
              </label>
              <input
                type="text"
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
                placeholder="Enter admin name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none resize-none h-20"
                  placeholder="Enter organization address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter website URL"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Organization Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              >
                <option value="enterprise">Enterprise</option>
                <option value="training">Training Institute</option>
                <option value="education">Educational Institute</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Organization Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="flex items-center justify-center w-full h-32 px-4 transition bg-dark-400/50 border-2 border-primary-500/20 border-dashed rounded-lg appearance-none cursor-pointer hover:border-primary-500/40 focus:outline-none">
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="w-6 h-6 text-primary-400" />
                      <span className="text-sm text-gray-400">
                        Click to upload logo (Max 5MB)
                      </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </label>
                </div>
                {logoPreview && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-primary-500/20">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
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
                  Adding...
                </span>
              ) : (
                'Add Organization'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};