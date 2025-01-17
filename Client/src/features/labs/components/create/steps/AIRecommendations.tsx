import React, { useEffect, useState } from 'react';
import { Brain, Check, DollarSign, Globe } from 'lucide-react';
import { GradientText } from '../../../../../components/ui/GradientText';
import axios from 'axios';

interface AIRecommendationsProps {
  config: any;
  onConfirm: (region: string) => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ config, onConfirm }) => {
  // Mock AI recommendations
  // const recommendations = {
  //   instances: [
  //     {
  //       type: 't3.large',
  //       provider: 'AWS',
  //       region: 'us-east-1',
  //       cost: 0.0832,
  //       specs: {
  //         cpu: '2 vCPU',
  //         ram: '8 GB',
  //         network: 'Up to 5 Gbps'
  //       }
  //     },
  //     {
  //       type: 't3.xlarge',
  //       provider: 'AWS',
  //       region: 'us-west-2',
  //       cost: 0.1664,
  //       specs: {
  //         cpu: '4 vCPU',
  //         ram: '16 GB',
  //         network: 'Up to 5 Gbps'
  //       }
  //     }
  //   ],
  //   regions: [
  //     {
  //       name: 'us-east-1',
  //       location: 'N. Virginia',
  //       latency: '45ms',
  //       cost: 1.0
  //     },
  //     {
  //       name: 'us-west-2',
  //       location: 'Oregon',
  //       latency: '85ms',
  //       cost: 0.95
  //     }
  //   ]
  // };
  const [recommendations , setRecommendations] = useState([]);
  // const [selectedOS, setSelectedOS] = useState(''); 
  // setSelectedOS(config.vmSize.os)
  useEffect(()=>{
      const fetch = async()=>{
        const result = await axios.post('http://localhost:3000/api/v1/getInstances',{
          cloud:config.cloudProvider,
          cpu:config.vmSize.cpu,
          ram:config.vmSize.ram,
          storage:config.vmSize.storage,
        })
        console.log(result.data.result)
        setRecommendations(result.data.result)
      }
      fetch();
  },[])
  const handleData=async (instance)=>{
    console.log(instance)
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
      const terraform = await axios.post('http://localhost:3000/api/v1/python',{cloudPlatform :config.cloudProvider })
      const tf = await axios.get('http://localhost:3000/api/v1/pythontf')
      localStorage.removeItem('formData');
    }
    catch(error){
      console.log(error)
    }
   

  }

  // Function to get price based on OS
  const getPriceByOS = (instance) => {
    if(config.cloudProvider === 'aws'){
      switch (config.vmSize.os) {
        case 'linux':
          return instance.ondemand_linux_base_pricing;
        case 'windows':
          return instance.ondemand_windows_base_pricing;
        case 'ubuntu':
          return instance.ondemand_ubuntu_pro_base_pricing;
        case 'suse':
          return instance.ondemand_suse_base_pricing;
        case 'rhel':
          return instance.ondemand_rhel_base_pricing;
        default:
          return 0; // Fallback to Linux
      }
    }
    else if(config.cloudProvider === 'azure'){
      switch(config.vmSize.os.toLowerCase()){
        case 'windows':
          return instance.windows
        case 'linix':
          return instance.linux_vm_price
      }
    }
   
  };


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
            {recommendations.map((instance, index) => (
              <div 
              // key={config.cloud === 'aws' ? instance.instancename : instance.instance}
              key={index}
                className="p-4 bg-dark-300/50 rounded-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-200">{config.cloudProvider === 'aws' ? instance.instancename : instance.instance}</h4>
                    <p className="text-sm text-gray-400">{instance.provider} • {instance.region}</p>
                  </div>
                  <div className="flex items-center text-emerald-400">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>{getPriceByOS(instance)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-400">CPU</span>
                    <span className="text-gray-200">{instance.vcpu}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Memory</span>
                    <span className="text-gray-200">{instance.memory}</span>
                  </div>
                  {config.cloudProvider === 'aws' && (<div>
                    <span className="block text-gray-400">Network</span>
                    <span className="text-gray-200">{instance.networkperformance}</span>
                  </div>)}
                  
                </div>

                <button
                  onClick={() => {onConfirm(instance.region)
                    console.log(config.c)
                    if(config.cloudProvider ==='aws'){
                        handleData(instance.instancename)}
                    else if(config.cloudProvider ==='azure'){
                      handleData(instance.instance)}
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

          {/* <div className="space-y-4">
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
          </div> */}
        </div>
      </div>
    </div>
  );
};