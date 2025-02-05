import React, { useState } from 'react';
import { GradientText } from '../../../../../components/ui/GradientText';
import { Loader, AlertCircle, Check, Key } from 'lucide-react';
import axios from 'axios';

interface CloudProviderSelectorProps {
  onSelect: (provider: string) => void;
}

interface AwsCredentials {
  accessKey: string;
  secretKey: string;
}

export const CloudProviderSelector: React.FC<CloudProviderSelectorProps> = ({ onSelect }) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [showAwsConfig, setShowAwsConfig] = useState(false);
  const [awsCredentials, setAwsCredentials] = useState<AwsCredentials>({
    accessKey: '',
    secretKey: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCorpAwsConnect = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.get('http://localhost:3000/api/v1/connectCorpAws');
      
      if (response.data.success) {
        setSuccess('Successfully connected to Corporate AWS');
        setTimeout(() => {
          onSelect('aws');
          handleData('aws');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to connect to Corporate AWS');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to connect to Corporate AWS');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrgAwsConnect = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/connectOrgAws', {
        aws_access_key: awsCredentials.accessKey,
        aws_secret_key: awsCredentials.secretKey,
      });
      
      if (response.data.success) {
        setSuccess('Successfully connected to Organization AWS');
        setTimeout(() => {
          onSelect('aws');
          handleData('aws');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to connect to Organization AWS');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to connect to Organization AWS');
    } finally {
      setIsLoading(false);
    }
  };

  const handleData = (provider: string) => {
    const storedData = JSON.parse(localStorage.getItem('formData') || '{}');
    const updatedData = { ...storedData, provider };
    localStorage.setItem('formData', JSON.stringify(updatedData));
  };

  const providers = [
    {
      id: 'aws',
      name: 'Amazon Web Services',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
      regions: 25,
      services: 200
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg',
      regions: 60,
      services: 180
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-semibold">
        <GradientText>Select Cloud Provider</GradientText>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => {
              setSelectedProvider(provider.id);
              if (provider.id === 'aws') {
                setShowAwsConfig(true);
              } else {
                onSelect(provider.id);
                handleData(provider.id);
              }
            }}
            className="glass-panel hover:scale-[1.02] transition-transform text-left"
          >
            <div className="flex items-center space-x-4 p-4">
              <img 
                src={provider.logo} 
                alt={provider.name} 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-200">
                  {provider.name}
                </h3>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                  <span>{provider.regions} Regions</span>
                  <span>•</span>
                  <span>{provider.services}+ Services</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {showAwsConfig && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-200 rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                <GradientText>AWS Account Configuration</GradientText>
              </h2>
              <button 
                onClick={() => {
                  setShowAwsConfig(false);
                  setSelectedProvider('');
                  setError(null);
                  setSuccess(null);
                }}
                className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
              >
                <Key className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col space-y-4">
                <button
                  onClick={handleCorpAwsConnect}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Connecting...
                    </span>
                  ) : (
                    'Connect with Corporate AWS'
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-dark-200 text-gray-400">Or use organization account</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      AWS Access Key
                    </label>
                    <input
                      type="text"
                      value={awsCredentials.accessKey}
                      onChange={(e) => setAwsCredentials(prev => ({ ...prev, accessKey: e.target.value }))}
                      className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                               text-gray-300 focus:border-primary-500/40 focus:outline-none"
                      placeholder="Enter AWS Access Key"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      AWS Secret Key
                    </label>
                    <input
                      type="password"
                      value={awsCredentials.secretKey}
                      onChange={(e) => setAwsCredentials(prev => ({ ...prev, secretKey: e.target.value }))}
                      className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                               text-gray-300 focus:border-primary-500/40 focus:outline-none"
                      placeholder="Enter AWS Secret Key"
                    />
                  </div>

                  <button
                    onClick={handleOrgAwsConnect}
                    disabled={isLoading || !awsCredentials.accessKey || !awsCredentials.secretKey}
                    className="btn-primary w-full"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Connecting...
                      </span>
                    ) : (
                      'Configure Organization AWS'
                    )}
                  </button>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};