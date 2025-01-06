import React from 'react';
import { Clock, Tag, BookOpen } from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { Lab } from '../../types';
import { CardMetrics } from './CardMetrics';
import { Prerequisites } from './Prerequisites';
import { Technologies } from './Technologies';

interface CatalogueCardProps {
  lab: Lab;
}

export const CatalogueCard: React.FC<CatalogueCardProps> = ({ lab }) => {
  return (
    <div className="flex flex-col h-[420px] overflow-hidden rounded-xl border border-primary-500/10 
                    hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                    transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                    hover:translate-y-[-2px]">
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">
              <GradientText>{lab.title}</GradientText>
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{lab.description}</p>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
            lab.status === 'available' ? 'bg-primary-500/20 text-primary-300' :
            lab.status === 'in-progress' ? 'bg-accent-500/20 text-accent-300' :
            'bg-secondary-500/20 text-secondary-300'
          }`}>
            {lab.status}
          </span>
        </div>

        {/* Metrics */}
        <CardMetrics 
          duration={lab.duration}
          type={lab.type}
          prerequisitesCount={lab.prerequisites?.length || 0}
        />

        {/* Prerequisites */}
        {lab.prerequisites && lab.prerequisites.length > 0 && (
          <Prerequisites prerequisites={lab.prerequisites} />
        )}

        {/* Technologies */}
        <Technologies technologies={lab.technologies} />

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-primary-500/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-2xl font-bold">
              <GradientText>${lab.price}</GradientText>
            </span>
            <button className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium
                           relative overflow-hidden
                           bg-gradient-to-r from-primary-500 to-secondary-500
                           hover:from-primary-400 hover:to-secondary-400
                           transform hover:scale-105 transition-all duration-300
                           text-white shadow-lg shadow-primary-500/20
                           before:absolute before:inset-0
                           before:bg-gradient-to-r before:from-transparent 
                           before:via-white/20 before:to-transparent
                           before:translate-x-[-200%] hover:before:animate-shimmer">
              Start Lab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};