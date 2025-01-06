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
    <div className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                    hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                    transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                    hover:translate-y-[-2px] group">
      <div className="p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1.5">
              <GradientText>{lab.title}</GradientText>
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{lab.description}</p>
          </div>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
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

        {/* Technologies */}
        <Technologies technologies={lab.technologies} />

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-primary-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">
              <GradientText>${lab.price}</GradientText>
            </span>
            <button className="px-6 py-2 rounded-lg font-medium text-sm
                           bg-gradient-to-r from-primary-500 to-secondary-500
                           group-hover:from-primary-400 group-hover:to-secondary-400
                           transform group-hover:scale-105 transition-all duration-300
                           text-white shadow-lg shadow-primary-500/20">
              Start Lab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};