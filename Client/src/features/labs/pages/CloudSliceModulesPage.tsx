import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  Layers, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Award, 
  ChevronRight, 
  ChevronDown,
  AlertCircle,
  Loader,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  FileText,
  Link as LinkIcon,
  Cloud,
  Key,
  User,
  Search,
  Lock,
  Calendar,
  ClockIcon,
  AlertTriangle,
  Info
} from 'lucide-react';
import axios from 'axios';

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  title: string;
  type: 'lab' | 'quiz';
  description: string;
  order: number;
  duration: number;
}

interface CleanupPolicy {
  enabled: boolean;
  type: 'auto' | 'scheduled' | 'inactivity' | 'manual';
  duration?: number;
  durationUnit?: 'seconds' | 'minutes' | 'hours';
  scheduledTime?: string;
  inactivityTimeout?: number;
  inactivityTimeoutUnit?: 'minutes' | 'hours';
}

interface LabExercise {
  id: string;
  exerciseId: string;
  instructions: string;
  resources: string[];
  services: string[];
  credentials: {
    accessKeyId: string;
    username: string;
    password: string;
  };
  cleanupPolicy?: CleanupPolicy;
}

interface QuizExercise {
  id: string;
  exerciseId: string;
  duration: number;
  questions: {
    id: string;
    text: string;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
    }[];
  }[];
}

// Mock data for testing
const mockModules: Module[] = [
  {
    id: 'module-1',
    title: 'Introduction to AWS',
    description: 'Learn the basics of AWS cloud services and infrastructure',
    order: 1,
    duration: 60,
    exercises: [
      {
        id: 'exercise-1',
        title: 'AWS Console Overview',
        type: 'lab',
        description: 'Navigate and understand the AWS Management Console',
        order: 1,
        duration: 30
      },
      {
        id: 'exercise-2',
        title: 'AWS Services Quiz',
        type: 'quiz',
        description: 'Test your knowledge of core AWS services',
        order: 2,
        duration: 15
      }
    ]
  },
  {
    id: 'module-2',
    title: 'EC2 and Virtual Machines',
    description: 'Deep dive into EC2 instances and virtual machine management',
    order: 2,
    duration: 90,
    exercises: [
      {
        id: 'exercise-3',
        title: 'Launch an EC2 Instance',
        type: 'lab',
        description: 'Create and configure your first EC2 instance',
        order: 1,
        duration: 45
      },
      {
        id: 'exercise-4',
        title: 'EC2 Configuration Quiz',
        type: 'quiz',
        description: 'Test your knowledge of EC2 configuration options',
        order: 2,
        duration: 20
      }
    ]
  }
];

const mockLabExercises: Record<string, LabExercise> = {
  'exercise-1': {
    id: 'lab-1',
    exerciseId: 'exercise-1',
    instructions: 'In this lab, you will explore the AWS Management Console and learn how to navigate between different services. Follow the steps below to complete the lab.',
    resources: [
      'https://docs.aws.amazon.com/awsconsolehelpdocs/latest/gsg/getting-started.html',
      'https://aws.amazon.com/console/getting-started/'
    ],
    services: ['EC2', 'S3', 'RDS'],
    credentials: {
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      username: 'admin',
      password: 'Password123!'
    },
    cleanupPolicy: {
      enabled: true,
      type: 'auto',
      duration: 60,
      durationUnit: 'minutes'
    }
  },
  'exercise-3': {
    id: 'lab-2',
    exerciseId: 'exercise-3',
    instructions: 'In this lab, you will launch an EC2 instance and connect to it using SSH. You will also configure security groups and learn about instance types.',
    resources: [
      'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html',
      'https://aws.amazon.com/ec2/getting-started/'
    ],
    services: ['EC2', 'VPC', 'CloudWatch'],
    credentials: {
      accessKeyId: 'AKIAI44QH8DHBEXAMPLE',
      username: 'ec2-user',
      password: 'SecurePass456!'
    },
    cleanupPolicy: {
      enabled: true,
      type: 'scheduled',
      scheduledTime: '2024-12-31T23:59'
    }
  }
};

const mockQuizExercises: Record<string, QuizExercise> = {
  'exercise-2': {
    id: 'quiz-1',
    exerciseId: 'exercise-2',
    duration: 15,
    questions: [
      {
        id: 'question-1',
        text: 'Which AWS service is used for object storage?',
        options: [
          { id: 'option-1', text: 'EC2', isCorrect: false },
          { id: 'option-2', text: 'S3', isCorrect: true },
          { id: 'option-3', text: 'RDS', isCorrect: false },
          { id: 'option-4', text: 'Lambda', isCorrect: false }
        ]
      },
      {
        id: 'question-2',
        text: 'Which AWS service is used for relational databases?',
        options: [
          { id: 'option-5', text: 'DynamoDB', isCorrect: false },
          { id: 'option-6', text: 'S3', isCorrect: false },
          { id: 'option-7', text: 'RDS', isCorrect: true },
          { id: 'option-8', text: 'SQS', isCorrect: false }
        ]
      }
    ]
  },
  'exercise-4': {
    id: 'quiz-2',
    exerciseId: 'exercise-4',
    duration: 20,
    questions: [
      {
        id: 'question-3',
        text: 'Which EC2 instance type is optimized for memory-intensive applications?',
        options: [
          { id: 'option-9', text: 'C5', isCorrect: false },
          { id: 'option-10', text: 'R5', isCorrect: true },
          { id: 'option-11', text: 'T3', isCorrect: false },
          { id: 'option-12', text: 'M5', isCorrect: false }
        ]
      },
      {
        id: 'question-4',
        text: 'What is the default tenancy model for EC2 instances?',
        options: [
          { id: 'option-13', text: 'Dedicated', isCorrect: false },
          { id: 'option-14', text: 'Reserved', isCorrect: false },
          { id: 'option-15', text: 'Shared', isCorrect: true },
          { id: 'option-16', text: 'Host', isCorrect: false }
        ]
      }
    ]
  }
};

// AWS Service Categories and Services for dropdown
const awsServiceCategories = {
  'Compute': ['EC2', 'Lambda', 'ECS', 'EKS', 'Fargate', 'Batch', 'Lightsail'],
  'Storage': ['S3', 'EBS', 'EFS', 'FSx', 'Storage Gateway', 'S3 Glacier'],
  'Database': ['RDS', 'DynamoDB', 'ElastiCache', 'Neptune', 'Redshift', 'DocumentDB'],
  'Networking': ['VPC', 'CloudFront', 'Route 53', 'API Gateway', 'Direct Connect', 'Global Accelerator'],
  'Security': ['IAM', 'Cognito', 'GuardDuty', 'Inspector', 'KMS', 'Shield', 'WAF'],
  'Management': ['CloudWatch', 'CloudTrail', 'Config', 'CloudFormation', 'Systems Manager', 'Control Tower'],
  'Analytics': ['Athena', 'EMR', 'Kinesis', 'QuickSight', 'Glue', 'Lake Formation'],
  'AI/ML': ['SageMaker', 'Comprehend', 'Rekognition', 'Polly', 'Lex', 'Textract']
};

// Modal components for CRUD operations
interface EditModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module | null;
  onSave: (module: Module) => void;
}

const EditModuleModal: React.FC<EditModuleModalProps> = ({ isOpen, onClose, module, onSave }) => {
  const [formData, setFormData] = useState<Module>({
    id: '',
    title: '',
    description: '',
    order: 1,
    duration: 60,
    exercises: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (module) {
      setFormData({ ...module });
    } else {
      setFormData({
        id: `module-${Date.now()}`,
        title: '',
        description: '',
        order: 1,
        duration: 60,
        exercises: []
      });
    }
  }, [module, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Module title is required');
      }

      // Save module
      onSave(formData);
      onClose();
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
            <GradientText>{module ? 'Edit Module' : 'Add Module'}</GradientText>
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
              Module Title
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
                'Save Module'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  exercise: Exercise | null;
  onSave: (moduleId: string, exercise: Exercise) => void;
}

const EditExerciseModal: React.FC<EditExerciseModalProps> = ({ 
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

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Exercise title is required');
      }

      // Save exercise
      onSave(moduleId, formData);
      onClose();
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
                  checked={formData.type === 'quiz'}
                  onChange={() => setFormData({ ...formData, type: 'quiz' })}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-gray-300">Quiz</span>
              </label>
            </div>
          </div>

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

interface EditLabExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  labExercise: LabExercise | null;
  onSave: (exerciseId: string, labExercise: LabExercise) => void;
}

const EditLabExerciseModal: React.FC<EditLabExerciseModalProps> = ({
  isOpen,
  onClose,
  exerciseId,
  labExercise,
  onSave
}) => {
  const [formData, setFormData] = useState<LabExercise>({
    id: '',
    exerciseId: '',
    instructions: '',
    resources: [''],
    services: [],
    credentials: {
      accessKeyId: '',
      username: '',
      password: ''
    },
    cleanupPolicy: {
      enabled: false,
      type: 'auto',
      duration: 60,
      durationUnit: 'minutes'
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  useEffect(() => {
    if (labExercise) {
      setFormData({ 
        ...labExercise,
        cleanupPolicy: labExercise.cleanupPolicy || {
          enabled: false,
          type: 'auto',
          duration: 60,
          durationUnit: 'minutes'
        }
      });
    } else {
      setFormData({
        id: `lab-${Date.now()}`,
        exerciseId,
        instructions: '',
        resources: [''],
        services: [],
        credentials: {
          accessKeyId: '',
          username: '',
          password: ''
        },
        cleanupPolicy: {
          enabled: false,
          type: 'auto',
          duration: 60,
          durationUnit: 'minutes'
        }
      });
    }
  }, [labExercise, exerciseId, isOpen]);

  const handleAddResource = () => {
    setFormData({
      ...formData,
      resources: [...formData.resources, '']
    });
  };

  const handleResourceChange = (index: number, value: string) => {
    const updatedResources = [...formData.resources];
    updatedResources[index] = value;
    setFormData({
      ...formData,
      resources: updatedResources
    });
  };

  const handleRemoveResource = (index: number) => {
    const updatedResources = [...formData.resources];
    updatedResources.splice(index, 1);
    setFormData({
      ...formData,
      resources: updatedResources
    });
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => {
      const services = prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
  };

  const handleCredentialsChange = (field: keyof LabExercise['credentials'], value: string) => {
    setFormData({
      ...formData,
      credentials: {
        ...formData.credentials,
        [field]: value
      }
    });
  };

  const handleCleanupPolicyChange = (field: keyof CleanupPolicy, value: any) => {
    if (!formData.cleanupPolicy) return;
    
    setFormData({
      ...formData,
      cleanupPolicy: {
        ...formData.cleanupPolicy,
        [field]: value
      }
    });
  };

  const filteredCategories = Object.keys(awsServiceCategories).filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredServices = selectedCategory 
    ? awsServiceCategories[selectedCategory as keyof typeof awsServiceCategories].filter(service =>
        service.toLowerCase().includes(serviceSearch.toLowerCase())
      )
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!formData.instructions.trim()) {
        throw new Error('Instructions are required');
      }

      // Filter out empty resources
      const filteredResources = formData.resources.filter(r => r.trim() !== '');
      
      // Save lab exercise
      onSave(exerciseId, {
        ...formData,
        resources: filteredResources
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>{labExercise ? 'Edit Lab Exercise' : 'Add Lab Exercise'}</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Resources
              </label>
              <button
                type="button"
                onClick={handleAddResource}
                className="text-sm text-primary-400 hover:text-primary-300 flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Resource
              </button>
            </div>
            <div className="space-y-3">
              {formData.resources.map((resource, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={resource}
                    onChange={(e) => handleResourceChange(index, e.target.value)}
                    placeholder="Enter resource URL"
                    className="flex-1 px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                             text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(index)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cleanup Policy Section */}
          <div className="p-4 bg-dark-300/50 rounded-lg border border-primary-500/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-300">Cleanup Policy</h4>
              <div className="flex items-center">
                <span className="text-sm text-gray-400 mr-2">Enable</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.cleanupPolicy?.enabled || false}
                    onChange={(e) => handleCleanupPolicyChange('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>

            {formData.cleanupPolicy?.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cleanup Policy Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'auto', label: 'Auto delete after duration', 
                        tooltip: 'Automatically delete resources after a specified time period' },
                      { value: 'scheduled', label: 'Delete at specific time', 
                        tooltip: 'Delete resources at a scheduled date and time' },
                      { value: 'inactivity', label: 'Delete after inactivity', 
                        tooltip: 'Delete resources after a period of user inactivity' },
                      { value: 'manual', label: 'Manual cleanup only', 
                        tooltip: 'Resources must be manually deleted by user or admin' }
                    ].map(policy => (
                      <div key={policy.value} className="relative group">
                        <label className="flex items-center space-x-2 p-3 bg-dark-400/50 rounded-lg cursor-pointer hover:bg-dark-400/70 transition-colors">
                          <input
                            type="radio"
                            name={`cleanup-policy-type`}
                            value={policy.value}
                            checked={formData.cleanupPolicy?.type === policy.value}
                            onChange={() => handleCleanupPolicyChange('type', policy.value)}
                            className="form-radio h-4 w-4 text-primary-500 border-gray-500/20 focus:ring-primary-500"
                          />
                          <span className="text-gray-300">{policy.label}</span>
                          <Info className="h-4 w-4 text-gray-500 ml-1" />
                        </label>
                        <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-dark-200 rounded-lg shadow-lg border border-primary-500/20 text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                          {policy.tooltip}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conditional fields based on policy type */}
                {formData.cleanupPolicy?.type === 'auto' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Duration
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.cleanupPolicy?.duration || 60}
                        onChange={(e) => handleCleanupPolicyChange('duration', parseInt(e.target.value) || 60)}
                        className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                 text-gray-300 focus:border-primary-500/40 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Unit
                      </label>
                      <select
                        value={formData.cleanupPolicy?.durationUnit || 'minutes'}
                        onChange={(e) => handleCleanupPolicyChange('durationUnit', e.target.value)}
                        className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                 text-gray-300 focus:border-primary-500/40 focus:outline-none"
                      >
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.cleanupPolicy?.type === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Scheduled Time
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={formData.cleanupPolicy?.scheduledTime || ''}
                        onChange={(e) => handleCleanupPolicyChange('scheduledTime', e.target.value)}
                        className="w-full px-4 py-2 pl-10 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                 text-gray-300 focus:border-primary-500/40 focus:outline-none"
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                )}

                {formData.cleanupPolicy?.type === 'inactivity' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Inactivity Timeout
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.cleanupPolicy?.inactivityTimeout || 30}
                        onChange={(e) => handleCleanupPolicyChange('inactivityTimeout', parseInt(e.target.value) || 30)}
                        className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                 text-gray-300 focus:border-primary-500/40 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Unit
                      </label>
                      <select
                        value={formData.cleanupPolicy?.inactivityTimeoutUnit || 'minutes'}
                        onChange={(e) => handleCleanupPolicyChange('inactivityTimeoutUnit', e.target.value)}
                        className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                 text-gray-300 focus:border-primary-500/40 focus:outline-none"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.cleanupPolicy?.type === 'manual' && (
                  <div className="p-3 bg-dark-400/30 rounded-lg flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    <p className="text-sm text-gray-300">
                      Cleanup must be triggered manually by the user or admin.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AWS Services Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-4">AWS Services</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {/* Service Category Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Service Category
                </label>
                <div className="relative">
                  <div 
                    className="w-full flex items-center justify-between p-3 bg-dark-400/50 
                             border border-primary-500/20 hover:border-primary-500/40 
                             rounded-lg cursor-pointer transition-colors"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <span className="text-gray-300">
                      {selectedCategory || 'Select a category'}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${
                      showCategoryDropdown ? 'transform rotate-180' : ''
                    }`} />
                  </div>

                  {showCategoryDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-dark-200 rounded-lg border 
                                  border-primary-500/20 shadow-lg max-h-80 overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-dark-200 border-b border-primary-500/10">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="w-full px-3 py-2 pl-9 bg-dark-400/50 border border-primary-500/20 
                                     rounded-lg text-gray-300 focus:border-primary-500/40 focus:outline-none"
                          />
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      <div>
                        {filteredCategories.map(category => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowCategoryDropdown(false);
                              setShowServiceDropdown(true);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-dark-300/50 transition-colors"
                          >
                            <p className="text-gray-200">{category}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Services
                </label>
                <div className="relative">
                  <div 
                    className="w-full flex items-center justify-between p-3 bg-dark-400/50 
                             border border-primary-500/20 hover:border-primary-500/40 
                             rounded-lg cursor-pointer transition-colors"
                    onClick={() => selectedCategory && setShowServiceDropdown(!showServiceDropdown)}
                  >
                    <span className="text-gray-300">
                      {formData.services.length > 0 
                        ? `${formData.services.length} service(s) selected` 
                        : 'Select services'}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${
                      showServiceDropdown ? 'transform rotate-180' : ''
                    }`} />
                  </div>

                  {showServiceDropdown && selectedCategory && (
                    <div className="absolute z-50 w-full mt-2 bg-dark-200 rounded-lg border 
                                  border-primary-500/20 shadow-lg max-h-80 overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-dark-200 border-b border-primary-500/10">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search services..."
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                            className="w-full px-3 py-2 pl-9 bg-dark-400/50 border border-primary-500/20 
                                     rounded-lg text-gray-300 focus:border-primary-500/40 focus:outline-none"
                          />
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      <div>
                        {filteredServices.map(service => (
                          <label
                            key={service}
                            className="flex items-center space-x-3 p-3 hover:bg-dark-300/50 
                                     cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.services.includes(service)}
                              onChange={() => handleServiceToggle(service)}
                              className="form-checkbox h-4 w-4 text-primary-500 rounded 
                                       border-gray-500/20 focus:ring-primary-500"
                            />
                            <div>
                              <p className="font-medium text-gray-200">{service}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Services Display */}
            {formData.services.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Selected Services:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.services.map(service => (
                    <div
                      key={service}
                      className="flex items-center px-3 py-1 bg-primary-500/10 text-primary-300
                               rounded-full text-sm"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => handleServiceToggle(service)}
                        className="ml-2 hover:text-primary-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AWS Console Credentials */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-4">AWS Console Credentials</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Access Key ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.credentials.accessKeyId}
                    onChange={(e) => handleCredentialsChange('accessKeyId', e.target.value)}
                    placeholder="Enter AWS Access Key ID"
                    className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                             text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  />
                  <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.credentials.username}
                    onChange={(e) => handleCredentialsChange('username', e.target.value)}
                    placeholder="Enter username"
                    className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                             text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  />
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.credentials.password}
                    onChange={(e) => handleCredentialsChange('password', e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                             text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                </div>
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
                'Save Lab Exercise'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditQuizExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  quizExercise: QuizExercise | null;
  onSave: (exerciseId: string, quizExercise: QuizExercise) => void;
}

const EditQuizExerciseModal: React.FC<EditQuizExerciseModalProps> = ({
  isOpen,
  onClose,
  exerciseId,
  quizExercise,
  onSave
}) => {
  const [formData, setFormData] = useState<QuizExercise>({
    id: '',
    exerciseId: '',
    duration: 15,
    questions: [{
      id: `question-${Date.now()}`,
      text: '',
      options: [
        { id: `option-${Date.now()}-1`, text: '', isCorrect: false },
        { id: `option-${Date.now()}-2`, text: '', isCorrect: false }
      ]
    }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizExercise) {
      setFormData({ ...quizExercise });
    } else {
      setFormData({
        id: `quiz-${Date.now()}`,
        exerciseId,
        duration: 15,
        questions: [{
          id: `question-${Date.now()}`,
          text: '',
          options: [
            { id: `option-${Date.now()}-1`, text: '', isCorrect: false },
            { id: `option-${Date.now()}-2`, text: '', isCorrect: false }
          ]
        }]
      });
    }
  }, [quizExercise, exerciseId, isOpen]);

  const handleDurationChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      duration: value
    }));
  };

  const handleAddQuestion = () => {
    const newQuestionId = `question-${Date.now()}`;
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          id: newQuestionId,
          text: '',
          options: [
            { id: `option-${Date.now()}-1`, text: '', isCorrect: false },
            { id: `option-${Date.now()}-2`, text: '', isCorrect: false }
          ]
        }
      ]
    });
  };

  const handleQuestionChange = (questionIndex: number, text: string) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], text };
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleRemoveQuestion = (questionIndex: number) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(questionIndex, 1);
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...formData.questions];
    const question = updatedQuestions[questionIndex];
    question.options = [
      ...question.options,
      { id: `option-${Date.now()}`, text: '', isCorrect: false }
    ];
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, text: string) => {
    const updatedQuestions = [...formData.questions];
    const question = updatedQuestions[questionIndex];
    question.options[optionIndex] = { ...question.options[optionIndex], text };
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleCorrectOptionChange = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...formData.questions];
    const question = updatedQuestions[questionIndex];
    
    // Reset all options to not correct
    question.options = question.options.map(option => ({
      ...option,
      isCorrect: false
    }));
    
    // Set the selected option as correct
    question.options[optionIndex] = { 
      ...question.options[optionIndex], 
      isCorrect: true 
    };
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...formData.questions];
    const question = updatedQuestions[questionIndex];
    question.options.splice(optionIndex, 1);
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (formData.questions.some(q => !q.text.trim())) {
        throw new Error('All questions must have text');
      }

      if (formData.questions.some(q => q.options.some(o => !o.text.trim()))) {
        throw new Error('All options must have text');
      }

      if (formData.questions.some(q => !q.options.some(o => o.isCorrect))) {
        throw new Error('Each question must have at least one correct answer');
      }

      if (formData.duration <= 0) {
        throw new Error('Duration must be greater than 0');
      }

      // Save quiz exercise
      onSave(exerciseId, formData);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>{quizExercise ? 'Edit Quiz' : 'Add Quiz'}</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Duration Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (in minutes)
            </label>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
                className="flex-1 px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
                required
              />
            </div>
          </div>

          {formData.questions.map((question, questionIndex) => (
            <div key={question.id} className="p-4 bg-dark-300/50 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Question {questionIndex + 1}
                  </label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                    placeholder="Enter question text"
                    className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                             text-gray-300 focus:border-primary-500/40 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(questionIndex)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                  disabled={formData.questions.length <= 1}
                >
                  <X className="h-4 w-4 text-red-400" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-300">
                    Options
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddOption(questionIndex)}
                    className="text-sm text-primary-400 hover:text-primary-300 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </button>
                </div>

                {question.options.map((option, optionIndex) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={option.isCorrect}
                      onChange={() => handleCorrectOptionChange(questionIndex, optionIndex)}
                      className="text-primary-500 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      className="flex-1 px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                               text-gray-300 focus:border-primary-500/40 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      disabled={question.options.length <= 2}
                    >
                      <X className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full p-3 border border-dashed border-primary-500/30 rounded-lg
                     text-primary-400 hover:text-primary-300 hover:border-primary-500/50
                     transition-colors flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Question
          </button>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-200">{error}</span>
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
                'Save Quiz'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <GradientText>{title}</GradientText>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <p className="text-gray-300 mb-6">{message}</p>

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
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const CloudSliceModulesPage: React.FC = () => {
  const { sliceId } = useParams<{ sliceId: string }>();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [labExercises, setLabExercises] = useState<Record<string, LabExercise>>({});
  const [quizExercises, setQuizExercises] = useState<Record<string, QuizExercise>>({});
  
  // Loading states for each API call
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [isLoadingLabExercises, setIsLoadingLabExercises] = useState(false);
  const [isLoadingQuizExercises, setIsLoadingQuizExercises] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CRUD modals state
  const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
  const [isEditExerciseModalOpen, setIsEditExerciseModalOpen] = useState(false);
  const [isEditLabExerciseModalOpen, setIsEditLabExerciseModalOpen] = useState(false);
  const [isEditQuizExerciseModalOpen, setIsEditQuizExerciseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedLabExercise, setSelectedLabExercise] = useState<LabExercise | null>(null);
  const [selectedQuizExercise, setSelectedQuizExercise] = useState<QuizExercise | null>(null);
  const [deleteType, setDeleteType] = useState<'module' | 'exercise' | 'labExercise' | 'quizExercise'>('module');
  const [deleteItemId, setDeleteItemId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Fetch modules
  useEffect(() => {
    const fetchModules = async () => {
      setIsLoadingModules(true);
      setError(null);
      try {
        // For development/testing, use mock data
        // In production, uncomment the API call below
        
        // Simulate API delay
        // await new Promise(resolve => setTimeout(resolve, 1000));
        // setModules(mockModules);
        // if (mockModules.length > 0) {
        //   setActiveModule(mockModules[0].id);
        // }
        
        const response = await axios.get(`http://localhost:3000/api/v1/cloud_slice_ms/modules/${sliceId}`);
        if (response.data.success) {
          setModules(response.data.data || []);
          if (response.data.data && response.data.data.length > 0) {
            setActiveModule(response.data.data[0].id);
          }
        } else {
          throw new Error(response.data.message || 'Failed to fetch modules');
        }
      } catch (err: any) {
        console.error('Error fetching modules:', err);
        setError(err.response?.data?.message || 'Failed to fetch modules');
        setModules([]);
      } finally {
        setIsLoadingModules(false);
      }
    };

    if (sliceId) {
      fetchModules();
    }
  }, [sliceId]);

  // Fetch lab exercises when a module is selected
  useEffect(() => {
    const fetchLabExercises = async () => {
      if (!activeModule) return;
      
      setIsLoadingLabExercises(true);
      try {
        // For development/testing, use mock data
        // In production, uncomment the API call below
        
        // Simulate API delay
        // await new Promise(resolve => setTimeout(resolve, 800));
        // setLabExercises(mockLabExercises);
        
        const response = await axios.get(`http://localhost:3000/api/v1/cloud_slice_ms/lab-exercises/${activeModule}`);
        if (response.data.success) {
          const labExercisesData = response.data.data || [];
          const labExercisesMap: Record<string, LabExercise> = {};
          
          labExercisesData.forEach((exercise: LabExercise) => {
            labExercisesMap[exercise.exerciseId] = exercise;
          });
          
          setLabExercises(labExercisesMap);
        }
      } catch (err) {
        console.error('Error fetching lab exercises:', err);
      } finally {
        setIsLoadingLabExercises(false);
      }
    };

    fetchLabExercises();
  }, [activeModule]);

  // Fetch quiz exercises when a module is selected
  useEffect(() => {
    const fetchQuizExercises = async () => {
      if (!activeModule) return;
      
      setIsLoadingQuizExercises(true);
      try {
        // For development/testing, use mock data
        // In production, uncomment the API call below
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setQuizExercises(mockQuizExercises);
        
        /* Uncomment for real API call
        const response = await axios.get(`http://localhost:3000/api/v1/cloud_slice_ms/quiz-exercises/${activeModule}`);
        if (response.data.success) {
          const quizExercisesData = response.data.data || [];
          const quizExercisesMap: Record<string, QuizExercise> = {};
          
          quizExercisesData.forEach((exercise: QuizExercise) => {
            quizExercisesMap[exercise.exerciseId] = exercise;
          });
          
          setQuizExercises(quizExercisesMap);
        }
        */
      } catch (err) {
        console.error('Error fetching quiz exercises:', err);
      } finally {
        setIsLoadingQuizExercises(false);
      }
    };

    fetchQuizExercises();
  }, [activeModule]);

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(activeModule === moduleId ? null : moduleId);
    setActiveExercise(null);
  };

  const handleExerciseClick = (exerciseId: string) => {
    setActiveExercise(activeExercise === exerciseId ? null : exerciseId);
  };

  const getActiveModule = () => {
    if (!activeModule || !modules || modules.length === 0) return null;
    return modules.find(m => m.id === activeModule) || null;
  };

  const getActiveExercise = () => {
    const module = getActiveModule();
    if (!module || !activeExercise || !module.exercises) return null;
    return module.exercises.find(e => e.id === activeExercise) || null;
  };

  // CRUD operations for modules
  const handleAddModule = () => {
    setSelectedModule(null);
    setIsEditModuleModalOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setIsEditModuleModalOpen(true);
  };

  const handleDeleteModule = (moduleId: string) => {
    setDeleteType('module');
    setDeleteItemId(moduleId);
    setIsDeleteModalOpen(true);
  };

  const handleSaveModule = (module: Module) => {
    if (selectedModule) {
      // Update existing module
      setModules(modules.map(m => m.id === module.id ? module : m));
      showNotification('success', 'Module updated successfully');
    } else {
      // Add new module
      setModules([...modules, module]);
      showNotification('success', 'Module added successfully');
    }
  };

  // CRUD operations for exercises
  const handleAddExercise = (moduleId: string) => {
    setSelectedExercise(null);
    setActiveModule(moduleId);
    setIsEditExerciseModalOpen(true);
  };

  const handleEditExercise = (moduleId: string, exercise: Exercise) => {
    setSelectedExercise(exercise);
    setActiveModule(moduleId);
    setIsEditExerciseModalOpen(true);
  };

  const handleDeleteExercise = (moduleId: string, exerciseId: string) => {
    setDeleteType('exercise');
    setActiveModule(moduleId);
    setDeleteItemId(exerciseId);
    setIsDeleteModalOpen(true);
  };

  const handleSaveExercise = (moduleId: string, exercise: Exercise) => {
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return;

    const updatedModules = [...modules];
    const module = { ...updatedModules[moduleIndex] };

    if (selectedExercise) {
      // Update existing exercise
      module.exercises = module.exercises.map(e => e.id === exercise.id ? exercise : e);
      showNotification('success', 'Exercise updated successfully');
    } else {
      // Add new exercise
      module.exercises = [...module.exercises, exercise];
      showNotification('success', 'Exercise added successfully');
    }

    updatedModules[moduleIndex] = module;
    setModules(updatedModules);
  };

  // CRUD operations for lab exercises
  const handleEditLabExercise = (exerciseId: string) => {
    setSelectedLabExercise(labExercises[exerciseId] || null);
    setIsEditLabExerciseModalOpen(true);
  };

  const handleSaveLabExercise = (exerciseId: string, labExercise: LabExercise) => {
    setLabExercises({
      ...labExercises,
      [exerciseId]: labExercise
    });
    showNotification('success', 'Lab exercise updated successfully');
  };

  // CRUD operations for quiz exercises
  const handleEditQuizExercise = (exerciseId: string) => {
    setSelectedQuizExercise(quizExercises[exerciseId] || null);
    setIsEditQuizExerciseModalOpen(true);
  };

  const handleSaveQuizExercise = (exerciseId: string, quizExercise: QuizExercise) => {
    setQuizExercises({
      ...quizExercises,
      [exerciseId]: quizExercise
    });
    showNotification('success', 'Quiz updated successfully');
  };

  // Delete confirmation handler
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      switch (deleteType) {
        case 'module':
          setModules(modules.filter(m => m.id !== deleteItemId));
          showNotification('success', 'Module deleted successfully');
          if (activeModule === deleteItemId) {
            setActiveModule(null);
            setActiveExercise(null);
          }
          break;
        case 'exercise':
          if (!activeModule) break;
          
          const moduleIndex = modules.findIndex(m => m.id === activeModule);
          if (moduleIndex === -1) break;
          
          const updatedModules = [...modules];
          const module = { ...updatedModules[moduleIndex] };
          module.exercises = module.exercises.filter(e => e.id !== deleteItemId);
          updatedModules[moduleIndex] = module;
          
          setModules(updatedModules);
          showNotification('success', 'Exercise deleted successfully');
          
          if (activeExercise === deleteItemId) {
            setActiveExercise(null);
          }
          break;
        case 'labExercise':
          // In a real app, you would call an API to delete the lab exercise
          const updatedLabExercises = { ...labExercises };
          delete updatedLabExercises[deleteItemId];
          setLabExercises(updatedLabExercises);
          showNotification('success', 'Lab exercise deleted successfully');
          break;
        case 'quizExercise':
          // In a real app, you would call an API to delete the quiz exercise
          const updatedQuizExercises = { ...quizExercises };
          delete updatedQuizExercises[deleteItemId];
          setQuizExercises(updatedQuizExercises);
          showNotification('success', 'Quiz deleted successfully');
          break;
      }
    } catch (err) {
      showNotification('error', 'Failed to delete item');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Helper function to format cleanup policy display
  const formatCleanupPolicy = (policy?: CleanupPolicy): string => {
    if (!policy || !policy.enabled) return 'No cleanup policy';
    
    switch (policy.type) {
      case 'auto':
        return `Auto delete after ${policy.duration} ${policy.durationUnit}`;
      case 'scheduled':
        return `Scheduled deletion at ${new Date(policy.scheduledTime || '').toLocaleString()}`;
      case 'inactivity':
        return `Delete after ${policy.inactivityTimeout} ${policy.inactivityTimeoutUnit} of inactivity`;
      case 'manual':
        return 'Manual cleanup only';
      default:
        return 'Custom cleanup policy';
    }
  };

  const renderExerciseContent = () => {
    const exercise = getActiveExercise();
    if (!exercise) return null;

    if (exercise.type === 'lab') {
      const labExercise = labExercises[exercise.id];
      if (!labExercise) {
        if (isLoadingLabExercises) {
          return (
            <div className="flex justify-center items-center h-64">
              <Loader className="h-8 w-8 text-primary-400 animate-spin" />
            </div>
          );
        }
        return (
          <div className="p-6 bg-dark-300/50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertCircle className="h-5 w-5" />
                <p>Lab exercise content not found</p>
              </div>
              <button
                onClick={() => handleEditLabExercise(exercise.id)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Lab Content
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Lab Content</h3>
            <button
              onClick={() => handleEditLabExercise(exercise.id)}
              className="btn-secondary"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Lab Content
            </button>
          </div>

          <div className="p-6 bg-dark-300/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Instructions</h3>
            <p className="text-gray-300">{labExercise.instructions}</p>
          </div>

          {/* Cleanup Policy Section */}
          <div className="p-6 bg-dark-300/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Cleanup Policy</h3>
            {labExercise.cleanupPolicy?.enabled ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-dark-400/50 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    labExercise.cleanupPolicy.type === 'auto' ? 'bg-primary-500/20' :
                    labExercise.cleanupPolicy.type === 'scheduled' ? 'bg-secondary-500/20' :
                    labExercise.cleanupPolicy.type === 'inactivity' ? 'bg-accent-500/20' :
                    'bg-gray-500/20'
                  }`}>
                    {labExercise.cleanupPolicy.type === 'auto' ? (
                      <ClockIcon className="h-5 w-5 text-primary-400" />
                    ) : labExercise.cleanupPolicy.type === 'scheduled' ? (
                      <Calendar className="h-5 w-5 text-secondary-400" />
                    ) : labExercise.cleanupPolicy.type === 'inactivity' ? (
                      <Clock className="h-5 w-5 text-accent-400" />
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-200">
                      {labExercise.cleanupPolicy.type === 'auto' ? 'Auto Delete' :
                       labExercise.cleanupPolicy.type === 'scheduled' ? 'Scheduled Deletion' :
                       labExercise.cleanupPolicy.type === 'inactivity' ? 'Inactivity Timeout' :
                       'Manual Cleanup'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatCleanupPolicy(labExercise.cleanupPolicy)}
                    </p>
                  </div>
                </div>
                
                {labExercise.cleanupPolicy.type === 'auto' && (
                  <div className="flex items-center justify-between p-3 bg-dark-400/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-primary-400" />
                      <span className="text-sm text-gray-300">Duration:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-200">
                      {labExercise.cleanupPolicy.duration} {labExercise.cleanupPolicy.durationUnit}
                    </span>
                  </div>
                )}
                
                {labExercise.cleanupPolicy.type === 'scheduled' && (
                  <div className="flex items-center justify-between p-3 bg-dark-400/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-secondary-400" />
                      <span className="text-sm text-gray-300">Scheduled Time:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-200">
                      {new Date(labExercise.cleanupPolicy.scheduledTime || '').toLocaleString()}
                    </span>
                  </div>
                )}
                
                {labExercise.cleanupPolicy.type === 'inactivity' && (
                  <div className="flex items-center justify-between p-3 bg-dark-400/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-accent-400" />
                      <span className="text-sm text-gray-300">Inactivity Timeout:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-200">
                      {labExercise.cleanupPolicy.inactivityTimeout} {labExercise.cleanupPolicy.inactivityTimeoutUnit}
                    </span>
                  </div>
                )}
                
                {labExercise.cleanupPolicy.type === 'manual' && (
                  <div className="flex items-center p-3 bg-dark-400/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-400 mr-2" />
                    <span className="text-sm text-gray-300">
                      Resources will need to be manually cleaned up by the user or administrator.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center p-3 bg-dark-400/30 rounded-lg">
                <Info className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-300">No cleanup policy configured</span>
              </div>
            )}
          </div>

          <div className="p-6 bg-dark-300/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {labExercise.resources?.map((resource, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-primary-400" />
                  <a href={resource} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
                    {resource}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Section */}
          <div className="p-6 bg-dark-300/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">AWS Services</h3>
            {labExercise.services && labExercise.services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {labExercise.services.map((service, index) => (
                  <div key={index} className="px-3 py-1.5 bg-primary-500/10 text-primary-300 rounded-full flex items-center">
                    <Cloud className="h-4 w-4 mr-2" />
                    {service}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No services configured for this lab</p>
            )}
          </div>

          {/* Credentials Section */}
          <div className="p-6 bg-dark-300/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">AWS Console Credentials</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dark-400/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Key className="h-5 w-5 text-primary-400" />
                  <div>
                    <p className="text-sm text-gray-400">Access Key ID</p>
                    <p className="font-mono text-gray-300">{labExercise.credentials.accessKeyId}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-dark-400/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-primary-400" />
                  <div>
                    <p className="text-sm text-gray-400">Username</p>
                    <p className="font-mono text-gray-300">{labExercise.credentials.username}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-dark-400/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-primary-400" />
                  <div>
                    <p className="text-sm text-gray-400">Password</p>
                    <p className="font-mono text-gray-300">••••••••••••</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleEditLabExercise(exercise.id)}
                  className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                >
                  <Pencil className="h-4 w-4 text-primary-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (exercise.type === 'quiz') {
      const quizExercise = quizExercises[exercise.id];
      if (!quizExercise) {
        if (isLoadingQuizExercises) {
          return (
            <div className="flex justify-center items-center h-64">
              <Loader className="h-8 w-8 text-primary-400 animate-spin" />
            </div>
          );
        }
        return (
          <div className="p-6 bg-dark-300/50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertCircle className="h-5 w-5" />
                <p>Quiz content not found</p>
              </div>
              <button
                onClick={() => handleEditQuizExercise(exercise.id)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Quiz Content</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{quizExercise.duration} minutes</span>
              </div>
              <button
                onClick={() => handleEditQuizExercise(exercise.id)}
                className="btn-secondary"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Quiz
              </button>
            </div>
          </div>

          {quizExercise.questions?.map((question, qIndex) => (
            <div key={question.id} className="p-6 bg-dark-300/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Question {qIndex + 1}</h3>
              <p className="text-gray-300 mb-4">{question.text}</p>
              
              <div className="space-y-3">
                {question.options?.map((option) => (
                  <div key={option.id} className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        className="h-5 w-5 border-gray-500 text-primary-500 focus:ring-primary-500"
                        defaultChecked={option.isCorrect}
                      />
                    </div>
                    <p className={`text-gray-300 ${option.isCorrect ? 'font-medium' : ''}`}>
                      {option.text}
                      {option.isCorrect && (
                        <span className="ml-2 text-xs text-emerald-400">(Correct Answer)</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button className="btn-primary">
              Submit Answers
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // Main loading state
  if (isLoadingModules) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 text-primary-400 animate-spin mr-3" />
        <span className="text-gray-300 text-lg">Loading modules...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass-panel">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-200 mb-2">
          {error}
        </h2>
        <p className="text-gray-400 text-center max-w-md">
          There was a problem loading the module content. Please try again later or contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/20 text-emerald-300' : 
          'bg-red-500/20 border border-red-500/20 text-red-300'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold">
          <GradientText>Learning Modules</GradientText>
        </h1>
        <button 
          onClick={handleAddModule}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Modules Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-panel">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText>Module List</GradientText>
            </h2>
            <div className="space-y-2">
              {modules.length === 0 ? (
                <div className="p-4 bg-dark-300/50 rounded-lg text-center">
                  <p className="text-gray-400">No modules available</p>
                  <button 
                    onClick={handleAddModule}
                    className="mt-2 text-primary-400 hover:text-primary-300 flex items-center justify-center mx-auto"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add your first module
                  </button>
                </div>
              ) : (
                modules.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleModuleClick(module.id)}
                        className={`flex-1 flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                          activeModule === module.id
                            ? 'bg-primary-500/20 text-primary-300'
                            : 'bg-dark-300/50 text-gray-300 hover:bg-dark-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Layers className="h-5 w-5" />
                          <span className="font-medium">{module.title}</span>
                        </div>
                        {activeModule === module.id ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditModule(module);
                          }}
                          className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4 text-primary-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(module.id);
                          }}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {activeModule === module.id && module.exercises && (
                      <div className="ml-6 space-y-1">
                        {module.exercises.map((exercise) => (
                          <div key={exercise.id} className="flex items-center">
                            <button
                              onClick={() => handleExerciseClick(exercise.id)}
                              className={`flex-1 flex items-center space-x-2 p-2 rounded-lg text-left text-sm transition-colors ${
                                activeExercise === exercise.id
                                  ? 'bg-primary-500/10 text-primary-300'
                                  : 'text-gray-400 hover:bg-dark-300/70 hover:text-gray-300'
                              }`}
                            >
                              {exercise.type === 'lab' ? (
                                <BookOpen className="h-4 w-4 flex-shrink-0" />
                              ) : (
                                <Award className="h-4 w-4 flex-shrink-0" />
                              )}
                              <span className="truncate">{exercise.title}</span>
                            </button>
                            <div className="flex ml-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditExercise(module.id, exercise);
                                }}
                                className="p-1.5 hover:bg-primary-500/10 rounded-lg transition-colors"
                              >
                                <Pencil className="h-3 w-3 text-primary-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteExercise(module.id, exercise.id);
                                }}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAddExercise(module.id)}
                          className="w-full flex items-center justify-center p-2 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-500/5 rounded-lg transition-colors"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Exercise
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeExercise ? (
            <div className="glass-panel">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  <GradientText>
                    {getActiveExercise()?.title || 'Exercise'}
                  </GradientText>
                </h2>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{getActiveExercise()?.duration || 0} minutes</span>
                </div>
              </div>

              {renderExerciseContent()}
            </div>
          ) : activeModule ? (
            <div className="glass-panel">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  <GradientText>
                    {getActiveModule()?.title || 'Module Overview'}
                  </GradientText>
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{getActiveModule()?.duration || 0} minutes</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditModule(getActiveModule()!)}
                      className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                    >
                      <Pencil className="h-4 w-4 text-primary-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(activeModule)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-dark-300/50 rounded-lg">
                  <p className="text-gray-300">{getActiveModule()?.description}</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Exercises</h3>
                    <button
                      onClick={() => handleAddExercise(activeModule)}
                      className="btn-secondary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercise
                    </button>
                  </div>
                  <div className="space-y-4">
                    {getActiveModule()?.exercises?.length === 0 ? (
                      <div className="p-6 bg-dark-300/50 rounded-lg text-center">
                        <FileText className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400">No exercises available for this module</p>
                        <button
                          onClick={() => handleAddExercise(activeModule)}
                          className="mt-2 text-primary-400 hover:text-primary-300 flex items-center justify-center mx-auto"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add your first exercise
                        </button>
                      </div>
                    ) : (
                      getActiveModule()?.exercises?.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="p-4 bg-dark-300/50 rounded-lg hover:bg-dark-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center space-x-3 flex-1 cursor-pointer"
                              onClick={() => handleExerciseClick(exercise.id)}
                            >
                              {exercise.type === 'lab' ? (
                                <BookOpen className="h-5 w-5 text-primary-400" />
                              ) : (
                                <Award className="h-5 w-5 text-primary-400" />
                              )}
                              <div>
                                <h4 className="font-medium text-gray-200">{exercise.title}</h4>
                                <p className="text-sm text-gray-400">{exercise.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1 text-gray-400">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">{exercise.duration} min</span>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditExercise(activeModule, exercise)}
                                  className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                                >
                                  <Pencil className="h-4 w-4 text-primary-400" />
                                </button>
                                <button
                                  onClick={() => handleDeleteExercise(activeModule, exercise.id)}
                                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4 text-red-400" />
                                </button>
                                <button
                                  onClick={() => handleExerciseClick(exercise.id)}
                                  className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                                >
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel flex flex-col items-center justify-center py-12">
              <Layers className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-200 mb-2">
                {modules.length === 0 ? 'No Modules Available' : 'Select a Module'}
              </h2>
              <p className="text-gray-400 text-center max-w-md mb-6">
                {modules.length === 0 
                  ? 'This cloud slice doesn\'t have any learning modules yet. Click the button below to create your first module.'
                  : 'Choose a module from the sidebar to view its content and exercises.'}
              </p>
              {modules.length === 0 && (
                <button 
                  onClick={handleAddModule}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Module
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CRUD Modals */}
      <EditModuleModal
        isOpen={isEditModuleModalOpen}
        onClose={() => setIsEditModuleModalOpen(false)}
        module={selectedModule}
        onSave={handleSaveModule}
      />

      <EditExerciseModal
        isOpen={isEditExerciseModalOpen}
        onClose={() => setIsEditExerciseModalOpen(false)}
        moduleId={activeModule || ''}
        exercise={selectedExercise}
        onSave={handleSaveExercise}
      />

      <EditLabExerciseModal
        isOpen={isEditLabExerciseModalOpen}
        onClose={() => setIsEditLabExerciseModalOpen(false)}
        exerciseId={activeExercise || ''}
        labExercise={selectedLabExercise}
        onSave={handleSaveLabExercise}
      />

      <EditQuizExerciseModal
        isOpen={isEditQuizExerciseModalOpen}
        onClose={() => setIsEditQuizExerciseModalOpen(false)}
        exerciseId={activeExercise || ''}
        quizExercise={selectedQuizExercise}
        onSave={handleSaveQuizExercise}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteType === 'module' ? 'Module' : 
                deleteType === 'exercise' ? 'Exercise' : 
                deleteType === 'labExercise' ? 'Lab Content' : 'Quiz'}`}
        message={`Are you sure you want to delete this ${deleteType === 'module' ? 'module' : 
                deleteType === 'exercise' ? 'exercise' : 
                deleteType === 'labExercise' ? 'lab content' : 'quiz'}? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
};