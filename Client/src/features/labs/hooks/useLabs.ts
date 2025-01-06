import { useState, useEffect } from 'react';
import { Lab } from '../types';
import axios from 'axios';

// Mock data - Replace with API call
const mockLabs: Lab[] = [
  {
    id: '1',
    title: 'AWS Solutions Architect Lab',
    description: 'Learn to design scalable cloud architectures',
    type: 'catalogue',
    duration: 120,
    price: 49.99,
    technologies: ['AWS', 'Cloud Architecture'],
    difficulty: 'intermediate',
    status: 'available',
    rating: 4.8,
    totalEnrollments: 1250
  },
  // Add more mock labs...
];

export const useLabs = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        // Simulate API call
        // await new Promise(resolve => setTimeout(resolve, 500));
        // setLabs(mockLabs);
        const catalogues = await axios.get("http://localhost:3000/api/v1/getCatalogues")
        setLabs(catalogues.data.data)

      } finally {
        setIsLoading(false);
      }
    };

    fetchLabs();
  }, []);

  return { labs, isLoading };
};