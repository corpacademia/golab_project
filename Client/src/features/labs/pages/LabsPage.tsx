import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { Plus, BookOpen } from 'lucide-react';
import { LabTypeCard } from '../components/LabTypeCard';
import { LabTypeOverview } from '../components/admin/LabTypeOverview';
import { LabManagementTabs } from '../components/admin/LabManagementTabs';
import { LabType } from '../types';
import axios from 'axios';

// const labMetrics = {
//   catalogue: {
//     activeUsers: 1245,
//     averageUsage: 78,
//     uptime: 99.9,
//     incidents: 0,
//     costTrend: 5
//   },
//   'cloud-vm': {
//     activeUsers: 856,
//     averageUsage: 82,
//     uptime: 99.8,
//     incidents: 2,
//     costTrend: 8
//   },
//   'dedicated-vm': {
//     activeUsers: 425,
//     averageUsage: 91,
//     uptime: 99.95,
//     incidents: 1,
//     costTrend: 3
//   },
//   cluster: {
//     activeUsers: 156,
//     averageUsage: 75,
//     uptime: 99.7,
//     incidents: 3,
//     costTrend: 12
//   },
//   'cloud-slice': {
//     activeUsers: 678,
//     averageUsage: 68,
//     uptime: 99.85,
//     incidents: 1,
//     costTrend: 15
//   },
//   emulator: {
//     activeUsers: 342,
//     averageUsage: 72,
//     uptime: 99.9,
//     incidents: 0,
//     costTrend: 4
//   }
// };

// const labCounts: Record<LabType, number> = {
//   catalogue: 245,
//   'cloud-vm': 128,
//   'dedicated-vm': 64,
//   cluster: 32,
//   'cloud-slice': 96,
//   emulator: 48
// };

export const LabsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<LabType | null>(null);
  const [activeTab, setActiveTab] = useState('settings');
  const [metrics, setMetrics] = useState({
    catalogue: {
      activeUsers: 1245,
      averageUsage: 78,
      uptime: 99.9,
      incidents: 0,
      costTrend: 5,
    },
    "cloud-vm": {
      activeUsers: 856,
      averageUsage: 82,
      uptime: 99.8,
      incidents: 2,
      costTrend: 8,
    },
    "dedicated-vm": {
      activeUsers: 425,
      averageUsage: 91,
      uptime: 99.95,
      incidents: 1,
      costTrend: 3,
    },
    cluster: {
      activeUsers: 156,
      averageUsage: 75,
      uptime: 99.7,
      incidents: 3,
      costTrend: 12,
    },
    "cloud-slice": {
      activeUsers: 678,
      averageUsage: 68,
      uptime: 99.85,
      incidents: 1,
      costTrend: 15,
    },
    emulator: {
      activeUsers: 342,
      averageUsage: 72,
      uptime: 99.9,
      incidents: 0,
      costTrend: 4,
    },
  });
  const [labCounts , setLabCounts] = useState({
    catalogue: 245,
      'cloud-vm': 128,
      'dedicated-vm': 64,
      cluster: 32,
      'cloud-slice': 96,
      emulator: 48
  })
  //update the labcounts
  const updateCount = async(updates)=>{
         setLabCounts((prev) => ({
            ...prev,
            ...updates
         }))
  }

   // Function to update a specific service's metric
   const updateMultipleMetrics = (updates) => {
    setMetrics((prevMetrics) => {
      const updatedMetrics = { ...prevMetrics };

      for (const [service, newValues] of Object.entries(updates)) {
        updatedMetrics[service] = {
          ...updatedMetrics[service],
          ...newValues,
        };
      }

      return updatedMetrics;
    });
  };

  useEffect(()=>{

    const data = async()=>{
    const response = await axios.get('http://localhost:3000/api/v1/allUsers')
    const activeUsers = response.data.data.filter((user)=>user.status === 'active').length

    //setstate
    const updates = {catalogue:{'activeUsers':activeUsers}}
    const updateCountData = {catalogue:4,'cloud-vm':2}
    updateMultipleMetrics(updates)
    updateCount(updateCountData)
    }
    data();
  },[])

  const handleTypeSelect = (type: LabType) => {
    if (type === 'catalogue') {
      navigate('/dashboard/labs/catalogue');
    } else {
      setSelectedType(type);
      setActiveTab('settings');
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">
            <GradientText>Lab Management</GradientText>
          </h1>
          <p className="mt-2 text-gray-400">
            Monitor and manage all lab environments
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={() => navigate('/dashboard/labs/catalogue')}
            className="btn-secondary"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Catalogue
          </button>
          <button 
            onClick={() => navigate('/dashboard/labs/create')}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Lab Environment
          </button>
        </div>
      </div>

      {selectedType && (
        <>
          <LabTypeOverview 
            type={selectedType}
            metrics={metrics[selectedType]}
          />
          <LabManagementTabs
            type={selectedType}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.keys(labCounts) as LabType[]).map(type => (
          <LabTypeCard
            key={type}
            type={type}
            count={labCounts[type]}
            onSelect={handleTypeSelect}
          />
        ))}
      </div>
    </div>
  );
};