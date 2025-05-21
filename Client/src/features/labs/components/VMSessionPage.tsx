import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Save,
  Loader
} from 'lucide-react';

interface VMSessionPageProps {}

export const VMSessionPage: React.FC<VMSessionPageProps> = () => {
  const { vmId } = useParams<{ vmId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get the guacUrl from location state
  const { guacUrl, vmTitle } = location.state || {};

  useEffect(() => {
    // Check if we have the necessary data
    if (!guacUrl) {
      navigate('/dashboard/labs/cloud-vms');
    } else {
      setIsLoading(false);
    }
    
    // Load any saved notes for this VM
    const savedNote = localStorage.getItem(`vm-note-${vmId}`);
    if (savedNote) {
      setNote(savedNote);
    }
  }, [guacUrl, vmId, navigate]);

  const handleSaveNote = () => {
    setIsSaving(true);
    // Save note to localStorage (in a real app, you'd save to a database)
    localStorage.setItem(`vm-note-${vmId}`, note);
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 text-primary-400 animate-spin mr-3" />
        <span className="text-gray-300">Loading VM session...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <h1 className="text-2xl font-display font-bold">
            <GradientText>{vmTitle || 'VM Session'}</GradientText>
          </h1>
        </div>
        <button
          onClick={toggleFullscreen}
          className="btn-secondary"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-4 w-4 mr-2" />
              Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4 mr-2" />
              Fullscreen
            </>
          )}
        </button>
      </div>

      <div className={`grid ${isFullscreen ? '' : 'grid-cols-1 lg:grid-cols-3'} gap-4`}>
        {/* Guacamole Frame */}
        <div className={`glass-panel p-0 overflow-hidden ${isFullscreen ? 'col-span-full h-[calc(100vh-120px)]' : 'lg:col-span-2 h-[600px]'}`}>
          <iframe 
            src={guacUrl} 
            className="w-full h-full border-0"
            title="VM Remote Access"
            allow="fullscreen"
          />
        </div>

        {/* Notes Section - Hide in fullscreen mode */}
        {!isFullscreen && (
          <div className="glass-panel">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                <GradientText>Lab Notes</GradientText>
              </h2>
              <button
                onClick={handleSaveNote}
                disabled={isSaving}
                className="btn-secondary py-1 px-3 text-sm"
              >
                {isSaving ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </button>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Take notes about your lab session here..."
              className="w-full h-[500px] px-4 py-3 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-300 focus:border-primary-500/40 focus:outline-none resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};