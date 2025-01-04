import { Lab } from '../types/assignLab';

export const availableLabs: Lab[] = [
  {
    id: '1',
    title: 'Advanced Cloud Architecture',
    description: 'Design and implement scalable cloud solutions',
    duration: 180,
    technologies: ['AWS', 'Azure', 'GCP']
  },
  {
    id: '2',
    title: 'Kubernetes in Production',
    description: 'Deploy and manage production-grade Kubernetes clusters',
    duration: 240,
    technologies: ['Kubernetes', 'Docker', 'Helm']
  },
  {
    id: '3',
    title: 'CI/CD Pipeline Implementation',
    description: 'Build automated deployment pipelines',
    duration: 120,
    technologies: ['Jenkins', 'GitLab', 'GitHub Actions']
  }
];