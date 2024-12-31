import React from 'react';
import { Brain, Check, DollarSign, Globe } from 'lucide-react';
import { GradientText } from '../../../../../components/ui/GradientText';
import axios from 'axios';

interface AIRecommendationsProps {
  config: any;
  onConfirm: (region: string) => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ config, onConfirm }) => {
  // Mock AI recommendations
  const recommendations = {
    instances: [
      {
        type: 't3.large',
        provider: 'AWS',
        region: 'us-east-1',
        cost: 0.0832,
        specs: {
          cpu: '2 vCPU',
          ram: '8 GB',
          network: 'Up to 5 Gbps'
        }
      },
      {
        type: 't3.xlarge',
        provider: 'AWS',
        region: 'us-west-2',
        cost: 0.1664,
        specs: {
          cpu: '4 vCPU',
          ram: '16 GB',
          network: 'Up to 5 Gbps'
        }
      }
    ],
    regions: [
      {
        name: 'us-east-1',
        location: 'N. Virginia',
        latency: '45ms',
        cost: 1.0
      },
      {
        name: 'us-west-2',
        location: 'Oregon',
        latency: '85ms',
        cost: 0.95
      }
    ]
  };
  const handleData=async (instance)=>{
    const storedData = JSON.parse(localStorage.getItem('formData'))|| {}
    const updatedData = {...storedData,instance}
    localStorage.setItem('formData',JSON.stringify(updatedData))
    const data = JSON.parse(localStorage.getItem('formData')) || {}
    const user = JSON.parse(localStorage.getItem('auth')).result || {}

    try{
      const response = await axios.post('http://localhost:3000/api/v1/labconfig',{
        data:data,
        user:user,
      })
      localStorage.removeItem('formData');
    }
    catch(error){
      console.log(error)
    }
   

  }
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-semibold">
        <GradientText>AI Recommendations</GradientText>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-5 w-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-gray-200">
              Recommended Instances
            </h3>
          </div>

          <div className="space-y-4">
            {recommendations.instances.map((instance, index) => (
              <div 
                key={instance.type}
                className="p-4 bg-dark-300/50 rounded-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-200">{instance.type}</h4>
                    <p className="text-sm text-gray-400">{instance.provider} • {instance.region}</p>
                  </div>
                  <div className="flex items-center text-emerald-400">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>${instance.cost}/hour</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-400">CPU</span>
                    <span className="text-gray-200">{instance.specs.cpu}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Memory</span>
                    <span className="text-gray-200">{instance.specs.ram}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Network</span>
                    <span className="text-gray-200">{instance.specs.network}</span>
                  </div>
                </div>

                <button
                  onClick={() => {onConfirm(instance.region)
                    handleData(instance.type)
                  }}
                  className="mt-4 w-full btn-primary"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Select Instance
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="h-5 w-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-gray-200">
              Recommended Regions
            </h3>
          </div>

          <div className="space-y-4">
            {recommendations.regions.map((region) => (
              <div 
                key={region.name}
                className="p-4 bg-dark-300/50 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-200">{region.location}</h4>
                    <p className="text-sm text-gray-400">{region.name}</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    Cost Index: {region.cost}x
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  Average Latency: {region.latency}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};