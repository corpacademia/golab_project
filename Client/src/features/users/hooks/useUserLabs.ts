import { useState, useEffect } from 'react';
import { UserLab } from '../types';
import axios from 'axios';

export const useUserLabs = (userId: string) => {
  const [labs, setLabs] = useState([]);
  const [labStatus , setLabStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        // TODO: Replace with actual API call
        // Mock data for now
        // const mockLabs: UserLab[] = [
        //   {
        //     id: '1',
        //     title: 'Introduction to Cloud Computing',
        //     description: 'Learn the basics of cloud computing and infrastructure',
        //     type: 'cloud-vm',
        //     duration: 60,
        //     price: 49.99,
        //     technologies: ['AWS', 'Cloud'],
        //     status: 'completed',
        //     assignedAt: new Date('2024-02-01'),
        //     completedAt: new Date('2024-02-15'),
        //     progress: 100
        //   },
        //   {
        //     id: '2',
        //     title: 'Docker Fundamentals',
        //     description: 'Master containerization with Docker',
        //     type: 'dedicated-vm',
        //     duration: 90,
        //     price: 79.99,
        //     technologies: ['Docker', 'Containers'],
        //     status: 'in-progress',
        //     assignedAt: new Date('2024-03-01'),
        //     progress: 60
        //   }
        // ];
        const catalogues = await axios.get('http://localhost:3000/api/v1/getCatalogues')
        const labs = await axios.post('http://localhost:3000/api/v1/getlabonid',{
          userId:userId
        })
        const cats = catalogues.data.data
        const labss = labs.data.data
        const filteredCatalogues =  cats.filter((cat)=>{
          return labss.some((lab)=> lab.lab_id === cat.lab_id)
        })
        setLabs(filteredCatalogues);
        setLabStatus(labss)

      } finally {
        setIsLoading(false);
      }
    };

    fetchLabs();
  }, [userId]);

  return { labs,labStatus , isLoading };
};