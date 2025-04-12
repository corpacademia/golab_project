import React, { useState } from 'react';
import { 
  Cloud, 
  Pencil, 
  Trash2, 
  MapPin, 
  Calendar, 
  Server,
  Play,
  Loader,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import axios from 'axios';

interface CloudSlice {
  id: string;
  name: string;
  description: string;
  provider: 'aws' | 'azure' | 'gcp' | 'oracle' | 'ibm' | 'alibaba';
  region: string;
  services: string[];
  status: 'active' | 'inactive' | 'pending' | 'expired';
  startDate: string;
  endDate: string;
  cleanupPolicy: string;
  credits: number;
  labType: 'without-modules' | 'with-modules';
}

interface CloudSliceCardProps {
  slice: CloudSlice;
  onEdit: (slice: CloudSlice) => void;
  onDelete: (sliceId: string) => void;
  isSelected?: boolean;
  onSelect?: (sliceId: string) => void;
}

export const CloudSliceCard: React.FC<CloudSliceCardProps> = ({ 
  slice,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect
}) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleLaunch = async () => {
    setIsLaunching(true);
    setNotification(null);

    try {
      // Call the API endpoint to launch the cloud slice
      const response = await axios.post(`http://localhost:3000/api/v1/cloud_slice_ms/launchCloudSlice/${slice.id}`);
      
      if (response.data.success) {
        setNotification({ 
          type: 'success', 
          message: 'Cloud slice launched successfully' 
        });
        
        // If there's a URL to open, open it in a new tab
        if (response.data.consoleUrl) {
          window.open(response.data.consoleUrl, '_blank');
        }
      } else {
        throw new Error(response.data.message || 'Failed to launch cloud slice');
      }
    } catch (error: any) {
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to launch cloud slice' 
      });
    } finally {
      setIsLaunching(false);
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  function formatDateTime(dateString) {
    const date = new Date(dateString);
  
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
  
    let hours = date.getHours();
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    hours = hours % 12 || 12; // Convert 0 to 12 for 12AM
    hours = `${hours}`.padStart(1, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  }

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(slice.id);
    }
  };

  return (
    <div className="flex flex-col h-[320px] overflow-hidden rounded-xl border border-primary-500/10 
                  hover:border-primary-500/30 bg-dark-200/80 backdrop-blur-sm
                  transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 
                  hover:translate-y-[-2px] group relative">
      {notification && (
        <div className={`absolute top-2 right-2 px-4 py-2 rounded-lg flex items-center space-x-2 z-50 ${
          notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
        }`}>
          {notification.type === 'success' ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm">{notification.message}</span>
        </div>
      )}
      
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start gap-4 mb-3">
{/* <<<<<<< HEAD
          <div className={`flex-1 ${onSelect ? 'pl-8' : ''}`}>
            <h3 className="text-lg font-semibold mb-1">
              <GradientText>{slice.title}</GradientText>
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{slice.description}</p>
======= */}
          <div className="flex items-start">
            {onSelect && (
              <div className="flex-shrink-0 mt-1 mr-3" onClick={handleSelectClick}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="form-checkbox h-5 w-5 text-primary-500 rounded border-gray-500/20"
                />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold mb-1">
                <GradientText>{slice.title}</GradientText>
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">{slice.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => onEdit(slice)}
              className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
            >
              <Pencil className="h-4 w-4 text-primary-400" />
            </button>
            <button
              onClick={() => onDelete(slice.id)}
              className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </button>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              slice.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
              slice.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
              slice.status === 'expired' ? 'bg-gray-500/20 text-gray-300' :
              'bg-amber-500/20 text-amber-300'
            }`}>
              {slice.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <Cloud className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">{slice.provider.toUpperCase()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <MapPin className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">Region: {slice.region}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Calendar className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">Start: {formatDateTime(slice.startdate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Calendar className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
            <span className="truncate">End: {formatDateTime(slice.enddate)}</span>
          </div>
        </div>

        <div className="mb-4 overflow-y-auto max-h-[80px]">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Services:</h4>
          <div className="flex flex-wrap gap-2">
            {slice.services.map((service, index) => (
              <span key={index} className="px-2 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300 
                                          inline-block max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                {service}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-primary-500/10">
          <button
            onClick={handleLaunch}
            className="w-full h-9 px-4 rounded-lg text-sm font-medium
                     bg-gradient-to-r from-primary-500 to-secondary-500
                     hover:from-primary-400 hover:to-secondary-400
                     transform hover:scale-105 transition-all duration-300
                     text-white shadow-lg shadow-primary-500/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center"
          >
            {isLaunching ? (
              <Loader className="animate-spin h-4 w-4" />
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Launch Lab
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};