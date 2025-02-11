import React from 'react';
import { 
  Star, 
  Cpu, 
  Users,
  Tag,
  HardDrive,
  Server
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { Lab } from '../../types';

interface OrgAdminCatalogueCardProps {
  lab: Lab;
  onAssignUsers: (lab: Lab) => void;
}

export const OrgAdminCatalogueCard: React.FC<OrgAdminCatalogueCardProps> = ({ 
  lab,
  onAssignUsers
}) => {
  return (
    <div className="flex flex-col min-h-[320px] sm:h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                    hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                    transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                    hover:translate-y-[-2px] group relative">
      <div className="p-3 sm:p-4 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex justify-between items-start gap-2 sm:gap-4 mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold mb-1 truncate">
              <GradientText>{lab.title}</GradientText>
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{lab.description}</p>
          </div>
          <div className="flex items-center text-amber-400 flex-shrink-0">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 fill-current" />
            <span className="text-xs sm:text-sm">{lab.rating || 4.5}</span>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-4">
          <div className="flex items-center text-xs sm:text-sm text-gray-400">
            <Cpu className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">4 vCPU</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-400">
            <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">8GB RAM</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-400">
            <Server className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">t2.large</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-400">
            <HardDrive className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">100GB Storage</span>
          </div>
        </div>

        {/* Technologies Section */}
        <div className="mb-2 sm:mb-4 flex-grow">
          <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Technologies:</h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {lab.technologies.map((tech, index) => (
              <span 
                key={index} 
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium 
                         rounded-full bg-primary-500/20 text-primary-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Button Section */}
        <div className="mt-auto pt-2 sm:pt-3 border-t border-primary-500/10">
          <button
            onClick={() => onAssignUsers(lab)}
            className="w-full h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium
                     bg-gradient-to-r from-primary-500 to-secondary-500
                     hover:from-primary-400 hover:to-secondary-400
                     transform hover:scale-105 transition-all duration-300
                     text-white shadow-lg shadow-primary-500/20
                     flex items-center justify-center"
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Assign Users
          </button>
        </div>
      </div>
    </div>
  );
};