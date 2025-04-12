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
  X,
  ExternalLink,
  List,
  FileText
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CloudSlice {
  labid: string;
  title: string;
  description: string;
  provider: 'aws' | 'azure' | 'gcp' | 'oracle' | 'ibm' | 'alibaba';
  region: string;
  services: string[];
  status: 'active' | 'inactive' | 'pending' | 'expired';
  startdate: string;
  enddate: string;
  cleanupPolicy: string;
  credits: number;
  modules: 'without-modules' | 'with-modules';
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
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleLaunch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLaunching(true);
    setNotification(null);

    try {
      // Call the API endpoint to get lab details
      const response = await axios.post(`http://localhost:3000/api/v1/cloud_slice_ms/getCloudSliceDetails/${slice.labid}`);
      
      if (response.data.success) {
        // Navigate to the appropriate page based on labType
        if (slice.modules === 'without-modules') {
          navigate(`/dashboard/labs/cloud-slices/${slice.labid}/lab`, { 
            state: { 
              sliceDetails: response.data.data,
              modules: 'without-modules'
            } 
          });
        } else {
          navigate(`/dashboard/labs/cloud-slices/${slice.labid}/modules`, { 
            state: { 
              sliceDetails: response.data.data,
              modules: 'with-modules'
            } 
          });
        }
      } else {
        throw new Error(response.data.message || 'Failed to launch cloud slice');
      }
    } catch (error: any) {
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to launch cloud slice' 
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setIsLaunching(false);
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

  // Fixed the checkbox selection handler to properly stop propagation
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(slice.labid);
    }
  };

  // Get the appropriate icon based on lab type
  const getLabTypeIcon = () => {
    if (slice.modules === 'without-modules') {
      return <Server className="h-3.5 w-3.5 mr-1 text-primary-400 flex-shrink-0" />;
    } else {
      return <List className="h-3.5 w-3.5 mr-1 text-primary-400 flex-shrink-0" />;
    }
  };

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
          <div className="flex items-start">
            {onSelect && (
              <div className="flex-shrink-0 mt-1 mr-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (onSelect) {
                      onSelect(slice.labid);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="form-checkbox h-4 w-4 text-primary-500 rounded border-gray-500/20"
                />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-base font-semibold mb-1 truncate">
                <GradientText>{slice.title}</GradientText>
              </h3>
              <p className="text-xs text-gray-400 line-clamp-1">{slice.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(slice);
              }}
              className="p-1.5 hover:bg-dark-300/50 rounded-lg transition-colors"
            >
              <Pencil className="h-3.5 w-3.5 text-primary-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(slice.id);
              }}
              className="p-1.5 hover:bg-dark-300/50 rounded-lg transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
            </button>
            <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
              slice.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
              slice.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
              slice.status === 'expired' ? 'bg-gray-500/20 text-gray-300' :
              'bg-amber-500/20 text-amber-300'
            }`}>
              {slice.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="flex items-center text-xs text-gray-400">
            <Cloud className="h-3.5 w-3.5 mr-1 text-primary-400 flex-shrink-0" />
            <span className="truncate">{slice.provider.toUpperCase()}</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <MapPin className="h-3.5 w-3.5 mr-1 text-primary-400 flex-shrink-0" />
            <span className="truncate">{slice.region}</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5 mr-1 text-primary-400 flex-shrink-0" />
            <span className="truncate">Start: {formatDateTime(slice.startdate)}</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5 mr-1 text-primary-400 flex-shrink-0" />
            <span className="truncate">End: {formatDateTime(slice.enddate)}</span>
          </div>
        </div>

        <div className="flex items-center text-xs text-gray-400 mb-2">
          {getLabTypeIcon()}
          <span className="truncate">
            {slice.modules === 'without-modules' ? 'Standard Lab' : 'Modular Lab'}
          </span>
        </div>

        <div className="mb-2 overflow-y-auto max-h-[60px]">
          <h4 className="text-xs font-medium text-gray-400 mb-1">Services:</h4>
          <div className="flex flex-wrap gap-1.5">
            {slice.services.map((service, index) => (
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