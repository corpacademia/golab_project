import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Tag, 
  BookOpen, 
  Play, 
  Plus,
  Check,
  AlertCircle,
  X,
  Cpu,
  Hash,
  FileCode,
  HardDrive,
  Server,
  UserPlus,
  Loader,
  Pencil,
  Trash2
} from 'lucide-react';
import { GradientText } from '../../../../../components/ui/GradientText';
import axios from 'axios';
import { jsPDF } from "jspdf";

interface CloudVMAssessmentProps {
  assessment: {
    lab_id?: string;
    assessment_id?: string;
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
    config_details?: any;
  };
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (storageChange: { increase: number; decrease: number }) => Promise<void>;
  currentStorage: number;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSubmit, currentStorage }) => {
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

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>Confirm Deletion</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">
              Are you sure you want to delete this assessment? This action cannot be undone.
            </p>
          </div>

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

export const CloudVMAssessmentCard: React.FC<CloudVMAssessmentProps> = ({ assessment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [orgDetails, setOrgDetails] = useState<org | null>(null);
  const [labDetails, setLabDetails] = useState<LabDetails | null>(null);
  const [load, setLoad] = useState(true);

  const admin = JSON.parse(localStorage.getItem('auth') ?? '{}').result || {};

  useEffect(() => {
    const fetchOrg = async () => {
      if (assessment.config_details?.organizationId) {
        const organizationDetails = await axios.post('http://localhost:3000/api/v1/getOrgDetails', {
          org_id: assessment.config_details.organizationId
        });
        setOrgDetails(organizationDetails.data.data);
      }
    };
    fetchOrg();
  }, [assessment.config_details?.organizationId]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const fetchLabDetails = await axios.post(
          "http://localhost:3000/api/v1/getLabOnId",
          {
            labId: assessment.lab_id,
          }
        );
        if (fetchLabDetails.data.success) {
          setLabDetails(fetchLabDetails.data.data);
        }
      } catch (error) {
        console.error("Error fetching lab details:", error);
      } finally {
        setLoad(false);
      }
    };

    if (assessment.lab_id) {
      fetch();
    }
  }, [assessment.lab_id]);

  const pdfGenerate = (users: any[]) => {
    try {
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('User Credentials', 10, 10);
      pdf.setFontSize(12);
  
      users.forEach((user, index) => {
        pdf.text(`${index + 1}. User ID: ${user.userId}`, 10, 20 + index * 10);
        pdf.text(`   Password: ${user.password}`, 10, 30 + index * 10);
      });
  
      const pdfBlob = pdf.output('blob');
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(pdfBlob);
      downloadLink.download = 'User_Credentials.pdf';
      downloadLink.click();
  
      const formData = new FormData();
      formData.append('file', pdfBlob, 'User_Credentials.pdf');
      formData.append('email', email);
      formData.append('subject', 'User Credentials');
      formData.append('body', 'Please find attached the user credentials.');
  
      return formData;
    } catch (error) {
      console.error("Error in pdfGenerate:", error);
      throw new Error("Failed to generate PDF.");
    }
  };

  const mail = async (formData: FormData) => {
    const emailResponse = await axios.post('http://localhost:3000/api/v1/sendmail', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!emailResponse.data.success) {
      throw new Error('Failed to send email');
    }
  };

  const generateUserCredentials = (n: number) => {
    const users = [];
    for (let i = 0; i < n; i++) {
      const userId = `${Math.random().toString(36).slice(2, 10)}@golabing.ai`;
      const password = Math.random().toString(36).slice(2, 12);
      users.push({ userId, password });
    }
    return users;
  };

  const handleCreateUser = async () => {
    if (!email) {
      setNotification({ type: 'error', message: 'Please enter an email address' });
      return;
    }

    setIsLoading(true);
    try {
      const users = generateUserCredentials(assessment.config_details?.numberOfInstances || 1);

      const insertUsersResponse = await axios.post('http://localhost:3000/api/v1/insertUsers', {
        users: users,
        organization: orgDetails?.organization_name,
        admin_id: admin.id,
        organization_type: orgDetails?.org_type,
      });

      if (!insertUsersResponse.data.success) {
        throw new Error("Failed to insert users.");
      }

      const formData = pdfGenerate(users);
      await mail(formData);

      const assignLabResponse = await axios.post('http://localhost:3000/api/v1/assignlab', {
        lab: assessment.lab_id,
        duration: 60,
        userId: users,
        assign_admin_id: admin.id,
      });
      if (assignLabResponse.data.success) {
        setNotification({ type: 'success', message: 'User created successfully' });
        setEmail('');
        setTimeout(() => {
          setIsModalOpen(false);
          setNotification(null);
        }, 2000);
      } else {
        throw new Error("Failed to assign lab to user.");
      }
    } catch (error) {
      console.error("Error in handleCreateUser:", error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'An error occurred while processing the request.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (storageChange: { increase: number; decrease: number }) => {
    try {
      const response = await axios.put(`http://localhost:3000/api/v1/updateAssessment/${assessment.lab_id}`, {
        storageIncrease: storageChange.increase,
        storageDecrease: storageChange.decrease
      });

      if (response.data.success) {
        setNotification({ type: 'success', message: 'Storage updated successfully' });
        window.location.reload();
      } else {
        throw new Error(response.data.message || 'Failed to update storage');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update storage'
      });
      throw error;
    }
  };
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.post(`http://localhost:3000/api/v1/deleteAssessment`,{
        batch_id:assessment.batch_id,
        admin_id:admin.id

      });
      
      if (response.data.success) {
        setNotification({ type: 'success', message: 'Assessment deleted successfully' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(response.data.message || 'Failed to delete assessment');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete assessment'
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (load) {
    return <div className="animate-pulse h-[320px] bg-dark-300/50 rounded-lg"></div>;
  }

  return (
    <>
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
                <GradientText>{assessment.config_details?.catalogueName || assessment.title}</GradientText>
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">{labDetails?.description || assessment.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
              >
                <Pencil className="h-4 w-4 text-primary-400" />
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                assessment.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                assessment.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
                'bg-amber-500/20 text-amber-300'
              }`}>
                {assessment.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-400">
              <Cpu className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">{labDetails?.cpu || assessment.cpu} vCPU</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Tag className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">{labDetails?.ram || assessment.ram}GB RAM</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Server className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">Instance: {labDetails?.instance || assessment.instance}</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <HardDrive className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
              <span className="truncate">Storage: {labDetails?.storage || assessment.storage}GB</span>
            </div>
          </div>

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
      </div>

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

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEdit}
        currentStorage={assessment.storage}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};