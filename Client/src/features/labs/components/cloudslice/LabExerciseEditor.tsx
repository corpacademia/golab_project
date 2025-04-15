import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Loader, 
  Check, 
  AlertCircle, 
  ChevronDown, 
  Search,
  Plus,
  Trash2,
  Key,
  User,
  Lock,
  Cloud
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import axios from 'axios';

interface Service {
  name: string;
  category: string;
  description: string;
}

interface LabExerciseEditorProps {
  exercise: any;
  moduleId: string;
  sliceId: string;
  onUpdate: (exerciseId: string, updatedData: any) => Promise<void>;
  onDelete: (exerciseId: string) => Promise<void>;
}

// Mock AWS service categories
const mockServiceCategories: Record<string, Service[]> = {
  'Compute': [
    { name: 'EC2', category: 'Compute', description: 'Elastic Compute Cloud - Virtual servers in the cloud' },
    { name: 'Lambda', category: 'Compute', description: 'Run code without provisioning servers' },
    { name: 'ECS', category: 'Compute', description: 'Elastic Container Service for Docker containers' }
  ],
  'Storage': [
    { name: 'S3', category: 'Storage', description: 'Simple Storage Service - Object storage' },
    { name: 'EBS', category: 'Storage', description: 'Elastic Block Store - Block storage for EC2' },
    { name: 'EFS', category: 'Storage', description: 'Elastic File System - Fully managed file system' }
  ],
  'Database': [
    { name: 'RDS', category: 'Database', description: 'Relational Database Service' },
    { name: 'DynamoDB', category: 'Database', description: 'Managed NoSQL database' },
    { name: 'ElastiCache', category: 'Database', description: 'In-memory caching service' }
  ],
  'Networking': [
    { name: 'VPC', category: 'Networking', description: 'Virtual Private Cloud - Isolated cloud resources' },
    { name: 'Route 53', category: 'Networking', description: 'Scalable DNS and domain registration' },
    { name: 'CloudFront', category: 'Networking', description: 'Global content delivery network' }
  ],
  'Security': [
    { name: 'IAM', category: 'Security', description: 'Identity and Access Management' },
    { name: 'KMS', category: 'Security', description: 'Key Management Service - Managed encryption keys' },
    { name: 'WAF', category: 'Security', description: 'Web Application Firewall' }
  ]
};

export const LabExerciseEditor: React.FC<LabExerciseEditorProps> = ({
  exercise,
  moduleId,
  sliceId,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(exercise.title || '');
  const [description, setDescription] = useState(exercise.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Services state
  const [serviceCategories, setServiceCategories] = useState<Record<string, Service[]>>(mockServiceCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedServices, setSelectedServices] = useState<Service[]>(exercise.services || []);
  
  // Credentials state
  const [credentials, setCredentials] = useState({
    accessKeyId: exercise.credentials?.accessKeyId || '',
    username: exercise.credentials?.username || '',
    password: exercise.credentials?.password || '',
  });
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);

  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        // Uncomment this when API is ready
        // const response = await axios.get('http://localhost:3000/api/v1/cloud_slice_ms/getAwsServices');
        // if (response.data.success) {
        //   const categorizedServices = extractServiceCategories(response.data.data);
        //   setServiceCategories(categorizedServices);
        // }
        
        // Using mock data for now
        setServiceCategories(mockServiceCategories);
      } catch (err) {
        console.error('Failed to fetch service categories:', err);
        // Don't set error state here to avoid blocking the UI
      }
    };

    fetchServiceCategories();
  }, []);

  const extractServiceCategories = (services: any[]): Record<string, Service[]> => {
    const categories: Record<string, Service[]> = {};
    
    if (!Array.isArray(services)) {
      console.error('Expected services to be an array, got:', typeof services);
      return categories;
    }
    
    services.forEach((item) => {
      const { services: serviceName, description, category } = item;
      
      if (!category) {
        console.warn('Service missing category:', item);
        return;
      }
      
      if (!categories[category]) {
        categories[category] = [];
      }
      
      categories[category].push({
        name: serviceName,
        category,
        description: description || ''
      });
    });
    
    return categories;
  };

  const handleServiceToggle = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.name === service.name);
      if (exists) {
        return prev.filter(s => s.name !== service.name);
      }
      return [...prev, service];
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedExercise = {
        ...exercise,
        title,
        description,
        services: selectedServices,
        credentials
      };

      await onUpdate(exercise.id, updatedExercise);
      
      setSuccess('Exercise updated successfully');
      setIsEditing(false);
      setIsEditingCredentials(false);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving exercise:', err);
      setError(err.response?.data?.message || 'Failed to update exercise');
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onDelete(exercise.id);
    } catch (err: any) {
      console.error('Error deleting exercise:', err);
      setError(err.response?.data?.message || 'Failed to delete exercise');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter categories and services based on search
  const filteredCategories = Object.keys(serviceCategories).filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredServices = selectedCategory 
    ? serviceCategories[selectedCategory].filter(service =>
        service.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        service.description.toLowerCase().includes(serviceSearch.toLowerCase())
      )
    : [];

  return (
    <div className="glass-panel mb-4 relative">
      {/* Notification */}
      {error && (
        <div className="absolute top-2 right-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2 z-10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="absolute top-2 right-2 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center space-x-2 z-10">
          <Check className="h-4 w-4 text-emerald-400" />
          <span className="text-sm text-emerald-300">{success}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        {isEditing ? (
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-200 focus:border-primary-500/40 focus:outline-none mb-2"
              placeholder="Exercise Title"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-200 focus:border-primary-500/40 focus:outline-none"
              placeholder="Exercise Description"
              rows={3}
            />
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold">
              <GradientText>{title}</GradientText>
            </h3>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          </div>
        )}
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setTitle(exercise.title);
                  setDescription(exercise.description);
                }}
                className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
              <button
                onClick={handleSave}
                className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 text-primary-400 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 text-primary-400" />
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
              >
                <GradientText>Edit</GradientText>
              </button>
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <span className="text-red-400">Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Services Section */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-2">AWS Services</h4>
        
        {isEditing ? (
          <div className="space-y-4">
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
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map(category => (
                          <button
                            key={category}
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowCategoryDropdown(false);
                              setShowServiceDropdown(true);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-dark-300/50 transition-colors"
                          >
                            <p className="text-gray-200">{category}</p>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-400">
                          No categories found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service Selector */}
            {selectedCategory && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Services
                </label>
                <div className="relative">
                  <div 
                    className="w-full flex items-center justify-between p-3 bg-dark-400/50 
                             border border-primary-500/20 hover:border-primary-500/40 
                             rounded-lg cursor-pointer transition-colors"
                    onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                  >
                    <span className="text-gray-300">
                      {selectedServices.length > 0 
                        ? `${selectedServices.length} service(s) selected` 
                        : 'Select services'}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${
                      showServiceDropdown ? 'transform rotate-180' : ''
                    }`} />
                  </div>

                  {showServiceDropdown && (
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
                        {filteredServices.length > 0 ? (
                          filteredServices.map(service => (
                            <label
                              key={service.name}
                              className="flex items-center space-x-3 p-3 hover:bg-dark-300/50 
                                       cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedServices.some(s => s.name === service.name)}
                                onChange={() => handleServiceToggle(service)}
                                className="form-checkbox h-4 w-4 text-primary-500 rounded 
                                         border-gray-500/20 focus:ring-primary-500"
                              />
                              <div>
                                <p className="font-medium text-gray-200">{service.name}</p>
                                <p className="text-sm text-gray-400">{service.description}</p>
                              </div>
                            </label>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-400">
                            No services found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Services Display */}
            {selectedServices.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Selected Services:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map(service => (
                    <div
                      key={service.name}
                      className="flex items-center px-3 py-1 bg-primary-500/10 text-primary-300
                               rounded-full text-sm"
                    >
                      {service.name}
                      <button
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
        ) : (
          <div className="space-y-4">
            {selectedServices.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {selectedServices.map(service => (
                  <div 
                    key={service.name}
                    className="p-3 bg-dark-300/50 rounded-lg flex items-center space-x-2"
                  >
                    <Cloud className="h-4 w-4 text-primary-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300 truncate">{service.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                No services have been selected for this exercise.
              </p>
            )}
          </div>
        )}
      </div>

      {/* AWS Console Credentials Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">AWS Console Credentials</h4>
        
        {isEditingCredentials || isEditing ? (
          <div className="space-y-4 p-4 bg-dark-300/50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Access Key ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={credentials.accessKeyId}
                  onChange={(e) => setCredentials(prev => ({ ...prev, accessKeyId: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter access key ID"
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
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter username"
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
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                           text-gray-300 focus:border-primary-500/40 focus:outline-none"
                  placeholder="Enter password"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              </div>
            </div>
            
            {!isEditing && (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsEditingCredentials(false);
                    setCredentials({
                      accessKeyId: exercise.credentials?.accessKeyId || '',
                      username: exercise.credentials?.username || '',
                      password: exercise.credentials?.password || '',
                    });
                  }}
                  className="btn-secondary py-1.5 px-3 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary py-1.5 px-3 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Saving...
                    </span>
                  ) : (
                    'Save Credentials'
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-dark-300/50 rounded-lg">
            {credentials.accessKeyId || credentials.username || credentials.password ? (
              <>
                {credentials.accessKeyId && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Key className="h-4 w-4 text-primary-400" />
                      <span className="text-sm text-gray-300">Access Key ID:</span>
                    </div>
                    <span className="text-sm font-mono bg-dark-400/50 px-2 py-1 rounded">
                      {credentials.accessKeyId}
                    </span>
                  </div>
                )}
                
                {credentials.username && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-primary-400" />
                      <span className="text-sm text-gray-300">Username:</span>
                    </div>
                    <span className="text-sm font-mono bg-dark-400/50 px-2 py-1 rounded">
                      {credentials.username}
                    </span>
                  </div>
                )}
                
                {credentials.password && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-primary-400" />
                      <span className="text-sm text-gray-300">Password:</span>
                    </div>
                    <span className="text-sm font-mono bg-dark-400/50 px-2 py-1 rounded">
                      ••••••••
                    </span>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsEditingCredentials(true)}
                    className="btn-secondary py-1.5 px-3 text-sm"
                  >
                    Edit Credentials
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-gray-400 mb-3">No credentials have been set up yet.</p>
                <button
                  onClick={() => setIsEditingCredentials(true)}
                  className="btn-primary py-1.5 px-3 text-sm"
                >
                  Add Credentials
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};