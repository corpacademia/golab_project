import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  MapPin, 
  Calendar, 
  Play,
  Loader,
  AlertCircle,
  Check,
  Layers,
  FileText,
  Trash2
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { useNavigate } from 'react-router-dom';

interface CloudSliceCardProps {
  lab: {
    id: string;
    title: string;
    description: string;
    provider: 'aws' | 'azure' | 'gcp' | 'oracle' | 'ibm' | 'alibaba';
    region: string;
    services: string[];
    status: 'active' | 'inactive' | 'pending' | 'expired';
    startdate: string;
    enddate: string;
    modules: 'without-modules' | 'with-modules';
  };
  onDelete: (labId: string) => void;
}

export const CloudSliceCard: React.FC<CloudSliceCardProps> = ({ lab, onDelete }) => {
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [user, setUser] = useState<any>({ id: 'user-123', name: 'Test User' });
  const [isDeleting, setIsDeleting] = useState(false);
  const handleLaunch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLaunching(true);
    setNotification(null);

    // Simulate API call
    setTimeout(() => {
      // Navigate to the appropriate page based on labType
      if (lab.modules === 'without-modules') {
        navigate(`/dashboard/my-labs/${lab.id}/standard`, { 
          state: { 
            labDetails: {
              ...lab,
              credentials: {
                username: 'lab-user-789',
                accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
                secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
              },
              consoleUrl: 'https://console.aws.amazon.com'
            }
          } 
        });
      } else {
        navigate(`/dashboard/my-labs/${lab.id}/modules`, { 
          state: { 
            labDetails: {
              ...lab,
              credentials: {
                username: 'lab-user-789',
                accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
                secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
              },
              consoleUrl: 'https://console.aws.amazon.com'
            }
          } 
        });
      }
      
      setIsLaunching(false);
    }, 1500);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsDeleting(true);
    
    // Simulate API call
    setTimeout(() => {
      onDelete(lab.id);
      setIsDeleting(false);
    }, 1000);
  };

  function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  return (
    <div className="flex flex-col h-[240px] overflow-hidden rounded-xl border border-primary-500/10 
                  hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                  transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                  hover:translate-y-[-2px] group relative">
      {notification && (
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-lg flex items-center space-x-1 z-50 ${
          notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
        }`}>
          {notification.type === 'success' ? (
            <Check className="h-3 w-3" />
          ) : (
            <AlertCircle className="h-3 w-3" />
          )}
          <span className="text-xs">{notification.message}</span>
        </div>
      )}
      
      <div className="p-3 flex flex-col h-full">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="text-base font-semibold mb-1 truncate">
              <GradientText>{lab.title}</GradientText>
            </h3>
            <p className="text-xs text-gray-400 line-clamp-1">{lab.description}</p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              lab.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
              lab.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
              lab.status === 'expired' ? 'bg-gray-500/20 text-gray-300' :
              'bg-amber-500/20 text-amber-300'
            }`}>
              {lab.status}
            </span>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              {isDeleting ? (
                <Loader className="h-4 w-4 text-red-400 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-red-400" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="flex items-center text-xs text-gray-400">
            <Cloud className="h-3.5 w-3.5 mr-1 text-primary-400 flex-shrink-0" />
            <span className="truncate">{lab.provider.toUpperCase()}</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <MapPin className="h-3.5 w-3.5 mr-1 text-primary-400 flex-shrink-0" />
            <span className="truncate">{lab.region}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-1 mb-2">
          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5 mr-1 text-primary-400 flex-shrink-0" />
            <span className="truncate">Start: {formatDateTime(lab.startdate)}</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5 mr-1 text-primary-400 flex-shrink-0" />
            <span className="truncate">End: {formatDateTime(lab.enddate)}</span>
          </div>
        </div>

        <div className="flex items-center text-xs text-gray-400 mb-2">
          {lab.modules === 'with-modules' ? (
            <Layers className="h-3.5 w-3.5 mr-1 text-primary-400 flex-shrink-0" />
          ) : (
            <FileText className="h-3.5 w-3.5 mr-1 text-primary-400 flex-shrink-0" />
          )}
          <span className="truncate">
            {lab.modules === 'with-modules' ? 'Modular Lab' : 'Standard Lab'}
          </span>
        </div>

        <div className="mb-2 overflow-y-auto max-h-[60px]">
          <h4 className="text-xs font-medium text-gray-400 mb-1">Services:</h4>
          <div className="flex flex-wrap gap-1.5">
            {lab.services.map((service, index) => (
              <span key={index} className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300 
                                          inline-block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                {service}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-2 border-t border-primary-500/10">
          <button
            onClick={handleLaunch}
            disabled={isLaunching}
            className="w-full h-8 px-3 rounded-lg text-xs font-medium
                     bg-gradient-to-r from-primary-500 to-secondary-500
                     hover:from-primary-400 hover:to-secondary-400
                     transform hover:scale-105 transition-all duration-300
                     text-white shadow-lg shadow-primary-500/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center"
          >
            {isLaunching ? (
              <Loader className="animate-spin h-3.5 w-3.5" />
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Launch Lab
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};