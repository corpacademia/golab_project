import React from 'react';
import { Clock, Tag, BookOpen, Star, Cpu } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { TechnologyBadge } from './TechnologyBadge';
import { Lab } from '../../types';

interface CatalogueCardProps {
  lab: Lab;
}

export const CatalogueCard: React.FC<CatalogueCardProps> = ({ lab }) => {
  const user = JSON.parse(localStorage.getItem('auth')) || {}
  return (
    <div className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                    hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                    transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                    hover:translate-y-[-2px] group">
      <div className="p-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              <GradientText>{lab.title}</GradientText>
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{lab.description}</p>
          </div>
          <div className="flex items-center text-amber-400">
            <Star className="h-4 w-4 mr-1 fill-current" />
            <span className="text-sm">{lab.rating || 4.5}</span>
          </div>
        </div>

        {/* Technologies Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-4 w-4 text-primary-400" />
            <span className="text-sm font-medium text-gray-300">Cloud</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* {lab.technologies.map(tech => ( */}
              <TechnologyBadge key={lab.provider} name={lab.provider} />
            {/* ))} */}
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
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
            {lab.prerequisites?.length || 0} Prerequisites
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-primary-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">
              <GradientText>${lab.price}</GradientText>
            </span>
            <button className="px-4 py-2 rounded-lg text-sm font-medium
                           bg-gradient-to-r from-primary-500 to-secondary-500
                           hover:from-primary-400 hover:to-secondary-400
                           transform hover:scale-105 transition-all duration-300
                           text-white shadow-lg shadow-primary-500/20">
              {user?.result?.role ==='user' ? 'Buy Lab' : 'Preview'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};