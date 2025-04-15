import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  ArrowLeft, 
  Cloud, 
  Server, 
  Key, 
  User, 
  ExternalLink, 
  Loader, 
  AlertCircle,
  Copy,
  Check,
  Database,
  Shield,
  Network,
  HardDrive,
  Cpu
} from 'lucide-react';
import axios from 'axios';

export const CloudSliceModulesPage: React.FC = () => {
  const location = useLocation();
  const { sliceId } = useParams();
  const navigate = useNavigate();
  
  const [sliceDetails, setSliceDetails] = useState<any>(location.state?.sliceDetails || null);
  const [isLoading, setIsLoading] = useState(!location.state?.sliceDetails);
  const [error, setError] = useState<string | null>(null);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch slice details if not provided in location state
  useEffect(() => {
    if (!sliceDetails && sliceId) {
      const fetchSliceDetails = async () => {
        setIsLoading(true);
        try {
          const response = await axios.post(`http://localhost:3000/api/v1/cloud_slice_ms/getCloudSliceDetails/${sliceId}`);
          if (response.data.success) {
            setSliceDetails(response.data.data);
          } else {
            setError('Failed to load cloud slice details');
          }
        } catch (err) {
          setError('Failed to load cloud slice details');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSliceDetails();
    }
  }, [sliceId, sliceDetails]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGoToConsole = () => {
    if (sliceDetails?.consoleUrl) {
      window.open(sliceDetails.consoleUrl, '_blank');
    } else {
      window.open('https://console.aws.amazon.com', '_blank');
    }
  };

  // Group services by category
  const serviceCategories = {
    'Compute': ['EC2', 'Lambda', 'ECS', 'EKS', 'Fargate'],
    'Storage': ['S3', 'EBS', 'EFS', 'Glacier'],
    'Database': ['RDS', 'DynamoDB', 'ElastiCache', 'Redshift'],
    'Networking': ['VPC', 'Route 53', 'CloudFront', 'API Gateway'],
    'Security': ['IAM', 'Cognito', 'KMS', 'WAF']
  };

  // Mock credentials - in a real app, these would come from the API
  const credentials = sliceDetails?.credentials || {
    username: 'lab-user-123',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    consoleUrl: 'https://console.aws.amazon.com'
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-200 mb-2">{error}</h2>
        <p className="text-gray-400 mb-6">Unable to load the cloud slice details.</p>
        <button 
          onClick={() => navigate('/dashboard/labs/cloud-slices')}
          className="btn-secondary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cloud Slices
        </button>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Compute': return <Cpu className="h-5 w-5" />;
      case 'Storage': return <HardDrive className="h-5 w-5" />;
      case 'Database': return <Database className="h-5 w-5" />;
      case 'Networking': return <Network className="h-5 w-5" />;
      case 'Security': return <Shield className="h-5 w-5" />;
      default: return <Cloud className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard/labs/cloud-slices')}
            className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold">
              <GradientText>{sliceDetails?.title || 'Cloud Slice Lab'}</GradientText>
            </h1>
            <p className="mt-1 text-gray-400">{sliceDetails?.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            sliceDetails?.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
            sliceDetails?.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
            'bg-amber-500/20 text-amber-300'
          }`}>
            {sliceDetails?.status}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
            {sliceDetails?.provider?.toUpperCase() || 'AWS'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - AWS Services */}
        <div className="lg:col-span-2">
          <div className="glass-panel">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                <GradientText>Available AWS Services</GradientText>
              </h2>
              <Cloud className="h-5 w-5 text-primary-400" />
            </div>

            <div className="space-y-6">
              {Object.entries(serviceCategories).map(([category, services]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-300 font-medium">
                    {getCategoryIcon(category)}
                    <h3>{category}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {services.map(service => {
                      const isAvailable = sliceDetails?.services?.includes(service) || true;
                      return (
                        <div 
                          key={service}
                          className={`p-3 rounded-lg border ${
                            isAvailable 
                              ? 'bg-dark-300/50 border-primary-500/20 hover:border-primary-500/40 cursor-pointer' 
                              : 'bg-dark-300/20 border-gray-500/20 opacity-50 cursor-not-allowed'
                          } transition-colors`}
                          onClick={() => isAvailable && setActiveService(service)}
                        >
                          <div className="flex items-center justify-between">
                            <span className={isAvailable ? 'text-gray-200' : 'text-gray-500'}>
                              {service}
                            </span>
                            {isAvailable && (
                              <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {activeService && (
              <div className="mt-6 p-4 bg-dark-300/50 rounded-lg border border-primary-500/20">
                <h3 className="text-lg font-medium text-gray-200 mb-3">{activeService} Service</h3>
                <p className="text-gray-400 mb-4">
                  This service is available in your cloud slice. You can access it through the AWS Management Console
                  or using the AWS CLI with the provided credentials.
                </p>
                <button
                  onClick={handleGoToConsole}
                  className="btn-primary"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in AWS Console
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Credentials & Access */}
        <div className="space-y-6">
          <div className="glass-panel">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText>AWS Console Credentials</GradientText>
            </h2>
            
            <div className="space-y-4">
              <div className="p-3 bg-dark-300/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Username</span>
                  <User className="h-4 w-4 text-primary-400" />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono bg-dark-400/50 p-2 rounded border border-primary-500/10 text-gray-300 flex-1 mr-2">
                    {credentials.username}
                  </p>
                  <button 
                    onClick={() => handleCopy(credentials.username, 'username')}
                    className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                  >
                    {copiedField === 'username' ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-primary-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-3 bg-dark-300/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Access Key ID</span>
                  <Key className="h-4 w-4 text-primary-400" />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono bg-dark-400/50 p-2 rounded border border-primary-500/10 text-gray-300 flex-1 mr-2">
                    {credentials.accessKeyId}
                  </p>
                  <button 
                    onClick={() => handleCopy(credentials.accessKeyId, 'accessKeyId')}
                    className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                  >
                    {copiedField === 'accessKeyId' ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-primary-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-3 bg-dark-300/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Secret Access Key</span>
                  <Key className="h-4 w-4 text-primary-400" />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono bg-dark-400/50 p-2 rounded border border-primary-500/10 text-gray-300 flex-1 mr-2">
                    {credentials.secretAccessKey}
                  </p>
                  <button 
                    onClick={() => handleCopy(credentials.secretAccessKey, 'secretAccessKey')}
                    className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                  >
                    {copiedField === 'secretAccessKey' ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-primary-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoToConsole}
                className="btn-primary w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Go to AWS Console
              </button>
            </div>
          </div>

          <div className="glass-panel">
            <h2 className="text-xl font-semibold mb-6">
              <GradientText>Lab Resources</GradientText>
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-dark-300/50 rounded-lg">
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-primary-400 mr-3" />
                  <span className="text-gray-300">Region</span>
                </div>
                <span className="text-gray-400">{sliceDetails?.region || 'us-east-1'}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-dark-300/50 rounded-lg">
                <div className="flex items-center">
                  <Cloud className="h-5 w-5 text-primary-400 mr-3" />
                  <span className="text-gray-300">Services</span>
                </div>
                <span className="text-gray-400">{sliceDetails?.services?.length || 0} Available</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-dark-300/50 rounded-lg">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-primary-400 mr-3" />
                  <span className="text-gray-300">IAM Permissions</span>
                </div>
                <span className="text-gray-400">Limited Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};