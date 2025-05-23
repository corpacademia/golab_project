import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Download,
  Loader,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  GripVertical,
  Power,
  Monitor,
  Key,
  ChevronDown,
  X,
  Expand,
  Shrink,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';

interface VMSessionPageProps {}

export const VMSessionPage: React.FC<VMSessionPageProps> = () => {
  const { vmId } = useParams<{ vmId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<string[]>([]);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [splitRatio, setSplitRatio] = useState(70); // Default 70% for VM, 30% for docs
  const containerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const [showDocuments, setShowDocuments] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showCredentials, setShowCredentials] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState('1280x720');
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false);

  // Get the guacUrl from location state
  const { guacUrl, vmTitle } = location.state || {};

  // Credentials for the VM
  const credentials = {
    username: 'admin',
    password: 'P@ssw0rd123'
  };

  // Available resolutions
  const resolutions = [
    '800x600',
    '1024x768',
    '1280x720',
    '1366x768',
    '1600x900',
    '1920x1080'
  ];

  useEffect(() => {
    // Check if we have the necessary data
    if (!guacUrl) {
      navigate('/dashboard/labs/cloud-vms');
    } else {
      setIsLoading(false);
    }
    
    // Fetch lab documents
    const fetchDocuments = async () => {
      try {
        // In a real implementation, you would fetch documents from your API
        // For now, we'll use mock data
        const mockDocuments = [
          'C:\\Users\\Admin\\Desktop\\microservice\\cloud-slice-service\\src\\public\\uploads\\1744211988810-edb_pem_agent.exe-20250407051848',
          'C:\\Users\\Admin\\Desktop\\microservice\\cloud-slice-service\\src\\public\\uploads\\ec2-ug.pdf',
          'C:\\Users\\Admin\\Desktop\\microservice\\cloud-slice-service\\src\\public\\uploads\\1744211988810-edb_pem_agent.exe-20250407051848'
        ];
        
        // In a real implementation, you would fetch documents for this specific VM
        // const response = await axios.get(`/api/labs/${vmId}/documents`);
        // setDocuments(response.data);
        
        setDocuments(mockDocuments);
        setIsLoadingDocs(false);
      } catch (error) {
        console.error('Failed to fetch lab documents:', error);
        setIsLoadingDocs(false);
      }
    };
    
    fetchDocuments();

    // Add event listener for escape key to exit fullscreen
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [guacUrl, vmId, navigate, isFullscreen]);

  // Function to extract the exact filename from the url
  function extractFileName(filePath: string) {
    const match = filePath.match(/[^\\\/]+$/);
    return match ? match[0] : null;
  }
  
  // Handle resizing functionality
  useEffect(() => {
    const resizer = resizerRef.current;
    const container = containerRef.current;
    
    if (!resizer || !container) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startX.current = e.clientX;
      
      // Get the initial width of the VM panel
      const vmPanel = container.firstElementChild as HTMLElement;
      if (vmPanel) {
        startWidth.current = vmPanel.offsetWidth;
      }
      
      // Add event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Change cursor and add active state
      document.body.style.cursor = 'col-resize';
      resizer.classList.add('bg-primary-500');
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !container) return;
      
      // Calculate the new width based on mouse movement
      const containerWidth = container.offsetWidth;
      const delta = e.clientX - startX.current;
      const newWidth = Math.min(Math.max(startWidth.current + delta, containerWidth * 0.3), containerWidth * 0.9);
      
      // Set the new ratio
      const newRatio = (newWidth / containerWidth) * 100;
      setSplitRatio(newRatio);
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      if (resizer) {
        resizer.classList.remove('bg-primary-500');
      }
    };
    
    // Add event listener to the resizer
    resizer.addEventListener('mousedown', handleMouseDown);
    
    // Cleanup
    return () => {
      resizer.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleNextDocument = () => {
    if (currentDocIndex < documents.length - 1) {
      setCurrentDocIndex(currentDocIndex + 1);
    }
  };

  const handlePrevDocument = () => {
    if (currentDocIndex > 0) {
      setCurrentDocIndex(currentDocIndex - 1);
    }
  };

  const handleResolutionChange = (resolution: string) => {
    setSelectedResolution(resolution);
    setIsControlsOpen(false);
    // In a real implementation, you would update the VM resolution
    // This could involve sending a message to the Guacamole server
  };

  const handlePowerAction = (action: 'restart' | 'shutdown') => {
    // In a real implementation, you would call an API to perform the action
    console.log(`Power action: ${action}`);
    setIsPowerMenuOpen(false);
  };

  const toggleDocumentsPanel = () => {
    setShowDocuments(!showDocuments);
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
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDocumentsPanel}
            className="btn-secondary"
          >
            {showDocuments ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Documents
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Documents
              </>
            )}
          </button>
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
      </div>

      {isFullscreen ? (
        // Fullscreen mode - only show VM
        <div className="glass-panel p-0 overflow-hidden h-[calc(100vh-120px)]">
          <div className="bg-dark-400 p-2 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setIsPowerMenuOpen(!isPowerMenuOpen)}
                  className="p-2 hover:bg-dark-300 rounded-lg transition-colors text-red-400"
                >
                  <Power className="h-5 w-5" />
                </button>
                {isPowerMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-dark-200 rounded-lg shadow-lg border border-primary-500/20 z-50">
                    <button
                      onClick={() => handlePowerAction('restart')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-dark-300/50 transition-colors"
                    >
                      Restart
                    </button>
                    <button
                      onClick={() => handlePowerAction('shutdown')}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Shutdown
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsControlsOpen(!isControlsOpen)}
                  className="p-2 hover:bg-dark-300 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Monitor className="h-5 w-5 text-primary-400" />
                  <span className="text-sm text-gray-300">{selectedResolution}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {isControlsOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-dark-200 rounded-lg shadow-lg border border-primary-500/20 z-50">
                    {resolutions.map(resolution => (
                      <button
                        key={resolution}
                        onClick={() => handleResolutionChange(resolution)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-dark-300/50 transition-colors ${
                          selectedResolution === resolution ? 'text-primary-400' : 'text-gray-300'
                        }`}
                      >
                        {resolution}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
                >
                  <Key className="h-5 w-5 text-primary-400" />
                </button>
                {showCredentials && (
                  <div className="absolute top-full left-0 mt-1 bg-dark-200 rounded-lg shadow-lg border border-primary-500/20 z-50 p-3 w-64">
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-400">Username</label>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{credentials.username}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(credentials.username)}
                            className="text-xs text-primary-400 hover:text-primary-300"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Password</label>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{credentials.password}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(credentials.password)}
                            className="text-xs text-primary-400 hover:text-primary-300"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
            >
              <Minimize2 className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <iframe 
            src={guacUrl} 
            className="w-full h-[calc(100%-40px)] border-0"
            title="VM Remote Access"
            allow="fullscreen"
          />
        </div>
      ) : (
        // Split view mode with resizable panels
        <div 
          ref={containerRef}
          className="glass-panel p-0 overflow-hidden h-[calc(100vh-120px)] flex relative"
        >
          {/* VM Panel */}
          <div 
            className="h-full overflow-hidden flex flex-col"
            style={{ width: `${splitRatio}%` }}
          >
            {/* VM Controls */}
            <div className="bg-dark-400 p-2 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setIsPowerMenuOpen(!isPowerMenuOpen)}
                    className="p-2 hover:bg-dark-300 rounded-lg transition-colors text-red-400"
                  >
                    <Power className="h-5 w-5" />
                  </button>
                  {isPowerMenuOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-dark-200 rounded-lg shadow-lg border border-primary-500/20 z-50">
                      <button
                        onClick={() => handlePowerAction('restart')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-dark-300/50 transition-colors"
                      >
                        Restart
                      </button>
                      <button
                        onClick={() => handlePowerAction('shutdown')}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Shutdown
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsControlsOpen(!isControlsOpen)}
                    className="p-2 hover:bg-dark-300 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Monitor className="h-5 w-5 text-primary-400" />
                    <span className="text-sm text-gray-300">{selectedResolution}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  {isControlsOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-dark-200 rounded-lg shadow-lg border border-primary-500/20 z-50">
                      {resolutions.map(resolution => (
                        <button
                          key={resolution}
                          onClick={() => handleResolutionChange(resolution)}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-dark-300/50 transition-colors ${
                            selectedResolution === resolution ? 'text-primary-400' : 'text-gray-300'
                          }`}
                        >
                          {resolution}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
                  >
                    <Key className="h-5 w-5 text-primary-400" />
                  </button>
                  {showCredentials && (
                    <div className="absolute top-full left-0 mt-1 bg-dark-200 rounded-lg shadow-lg border border-primary-500/20 z-50 p-3 w-64">
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-400">Username</label>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{credentials.username}</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(credentials.username)}
                              className="text-xs text-primary-400 hover:text-primary-300"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Password</label>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{credentials.password}</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(credentials.password)}
                              className="text-xs text-primary-400 hover:text-primary-300"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (splitRatio < 90) {
                      setSplitRatio(splitRatio + 10);
                    }
                  }}
                  className="p-1 hover:bg-dark-300 rounded-lg transition-colors"
                  title="Expand VM panel"
                >
                  <Expand className="h-4 w-4 text-gray-400" />
                </button>
                <button
                  onClick={() => {
                    if (splitRatio > 50) {
                      setSplitRatio(splitRatio - 10);
                    }
                  }}
                  className="p-1 hover:bg-dark-300 rounded-lg transition-colors"
                  title="Shrink VM panel"
                >
                  <Shrink className="h-4 w-4 text-gray-400" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-1 hover:bg-dark-300 rounded-lg transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
            <iframe 
              src={guacUrl} 
              className="w-full flex-1 border-0"
              title="VM Remote Access"
              allow="fullscreen"
            />
          </div>
          
          {/* Resizer */}
          <div 
            ref={resizerRef}
            className="absolute h-full w-4 bg-primary-500/20 hover:bg-primary-500/40 cursor-col-resize flex items-center justify-center z-10 transition-colors"
            style={{ left: `calc(${splitRatio}% - 8px)` }}
          >
            <GripVertical className="h-6 w-6 text-primary-500/50" />
          </div>
          
          {/* Documents Panel */}
          {showDocuments && (
            <div 
              className="h-full flex flex-col"
              style={{ width: `${100 - splitRatio}%` }}
            >
              <div className="flex justify-between items-center p-4 border-b border-primary-500/10">
                <h2 className="text-lg font-semibold">
                  <GradientText>Lab Documents</GradientText>
                </h2>
                <div className="flex items-center space-x-2">
                  {documents.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevDocument}
                        disabled={currentDocIndex === 0}
                        className={`p-1 rounded-lg ${currentDocIndex === 0 ? 'text-gray-500' : 'text-primary-400 hover:bg-primary-500/10'}`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="text-sm text-gray-400">
                        {currentDocIndex + 1} / {documents.length}
                      </span>
                      <button
                        onClick={handleNextDocument}
                        disabled={currentDocIndex === documents.length - 1}
                        className={`p-1 rounded-lg ${currentDocIndex === documents.length - 1 ? 'text-gray-500' : 'text-primary-400 hover:bg-primary-500/10'}`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => window.open(`http://localhost:3006/uploads/${extractFileName(documents[currentDocIndex])}`, '_blank')}
                    className="btn-secondary py-1 px-3 text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </button>
                  <button
                    onClick={toggleDocumentsPanel}
                    className="p-1 hover:bg-dark-300 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              {isLoadingDocs ? (
                <div className="flex justify-center items-center flex-grow">
                  <Loader className="h-6 w-6 text-primary-400 animate-spin mr-3" />
                  <span className="text-gray-300">Loading documents...</span>
                </div>
              ) : documents.length > 0 ? (
                <div className="flex-grow overflow-hidden">
                  <iframe
                    src={`http://localhost:3006/uploads/${extractFileName(documents[currentDocIndex])}`}
                    className="w-full h-full border-0"
                    title="Lab Document"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-grow">
                  <FileText className="h-12 w-12 text-gray-500 mb-4" />
                  <p className="text-gray-400 text-center">No documents available for this lab</p>
                </div>
              )}

              {/* Document List */}
              <div className="border-t border-primary-500/10 p-4 max-h-40 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-400 mb-2">All Documents</h3>
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div 
                      key={index}
                      onClick={() => setCurrentDocIndex(index)}
                      className={`p-2 rounded-lg flex items-center justify-between cursor-pointer ${
                        currentDocIndex === index 
                          ? 'bg-primary-500/20 text-primary-300' 
                          : 'bg-dark-300/50 text-gray-300 hover:bg-dark-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm truncate">{extractFileName(doc)}</span>
                      </div>
                      <Download 
                        className="h-4 w-4 text-primary-400 flex-shrink-0" 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`http://localhost:3006/uploads/${extractFileName(doc)}`, '_blank');
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};