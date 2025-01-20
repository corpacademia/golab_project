import React, { useState } from 'react';
import { CatalogueCard } from './CatalogueCard';
import { RecommendedLabs } from './RecommendedLabs';
import { Lab } from '../../types';
import axios from 'axios';

interface CatalogueGridProps {
  labs: Lab[];
  isLoading?: boolean;
}

export const CatalogueGrid: React.FC<CatalogueGridProps> = ({ labs, isLoading }) => {
//  const [awsInstanceDetails,setAwsInstanceDetails] = useState();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-[420px] bg-dark-300/50 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  // Get recommended labs (you can implement your own logic here)
  const recommendedLabs = labs.slice(0, 2);
  const remainingLabs = labs.slice(2);

//   const fetch = async()=>{ 
//     try {
//     const result = await axios.get('http://localhost:3000/api/v1/awsCreateInstanceDetails')
    
//     if(result.data.success){
//       setAwsInstanceDetails(result.data.result)
//     }
//   } catch (error) {
//     console.error("Error fetching aws instance details:", error);
//   }}
//  //get aws instance details
//  fetch()


  return (
    <div className="space-y-8">
      <RecommendedLabs labs={recommendedLabs} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {remainingLabs.map(lab => (
          <CatalogueCard key={lab.id} lab={lab} />
        ))}
      </div>
    </div>
  );
};