import React from 'react';
import { Lab } from '../../../types';
import { Clock, Tag, BookOpen } from 'lucide-react';
import { GradientText } from '../../../components/ui/GradientText';

interface LabCardProps {
  lab: Lab;
  onSelect?: (lab: Lab) => void;
}

export const LabCard: React.FC<LabCardProps> = ({ lab, onSelect }) => {
  return (
    <div 
      className="p-6 hover:transform hover:scale-[1.02] transition-all duration-300 cursor-pointer" 
      onClick={() => onSelect?.(lab)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            <GradientText>{lab.title}</GradientText>
          </h3>
          <p className="text-sm text-gray-400 mb-4">{lab.description}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          lab.status === 'available' ? 'bg-primary-500/20 text-primary-300' :
          lab.status === 'in-progress' ? 'bg-accent-500/20 text-accent-300' :
          'bg-secondary-500/20 text-secondary-300'
        }`}>
          {lab.status}
        </span>
      </div>
      
      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1 text-primary-400" />
          {lab.duration} mins
        </div>
        <div className="flex items-center">
          <Tag className="h-4 w-4 mr-1 text-primary-400" />
          {lab.type}
        </div>
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 mr-1 text-primary-400" />
          {lab.prerequisites?.length || 0} prerequisites
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {lab.technologies.map((tech) => (
            <span key={tech} className="px-2 py-1 text-xs font-medium bg-dark-300/50 text-primary-300 rounded-full">
              {tech}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-primary-500/10">
        <span className="text-lg font-bold">
          <GradientText>${lab.price}</GradientText>
        </span>
        <button className="btn-primary">
          Start Lab
        </button>
      </div>
    </div>
  );
};