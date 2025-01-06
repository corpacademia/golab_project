import React from 'react';
import { Clock, Tag, BookOpen, Star } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { Lab } from '../../types';

interface CatalogueCardProps {
  lab: Lab;
}

export const CatalogueCard: React.FC<CatalogueCardProps> = ({ lab }) => {
  return (
    <div className="flex flex-col h-[280px] overflow-hidden rounded-xl border border-primary-500/10 
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

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-3">
          {lab.technologies.slice(0, 3).map(tech => (
            <span key={tech} 
              className="px-2 py-1 text-xs font-medium bg-dark-300/50 
                       text-primary-300 rounded-full">
              {tech}
            </span>
          ))}
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
              Start Lab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};