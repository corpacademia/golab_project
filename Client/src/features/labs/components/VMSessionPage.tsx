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
  GripVertical
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

  // Get the guacUrl from location state
  const { guacUrl, vmTitle } = location.state || {};

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
          'C:\\Users\\Admin\\Desktop\\microservice\\cloud-slice-service\\src\public\\uploads\\ec2-ug.pdf',
          'C:\\Users\\Admin\\Desktop\\microservice\\cloud-slice-service\\src\\public\\uploads\\1744211988810-edb_pem_agent.exe-20250407051848',
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
  }, [guacUrl, vmId, navigate]);

   // Function to extract the exact filename from the url
  function extractFile_Name(filePath: string) {
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
      startWidth.current = vmPanel.offsetWidth;
      
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
      resizer.classList.remove('bg-primary-500');
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

  // Function to view document in the same container
  const handleViewDocument = (url: string) => {
    // Instead of opening in a new tab, we'll just set this as the current document
    const docIndex = documents.indexOf(url);
    if (docIndex !== -1) {
      setCurrentDocIndex(docIndex);
    }
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

      {isFullscreen ? (
        // Fullscreen mode - only show VM
        <div className="glass-panel p-0 overflow-hidden h-[calc(100vh-120px)]">
          <iframe 
            src={guacUrl} 
            className="w-full h-full border-0"
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
            className="h-full overflow-hidden"
            style={{ width: `${splitRatio}%` }}
          >
            <iframe 
              src={guacUrl} 
              className="w-full h-full border-0"
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
                  onClick={() => handleViewDocument(documents[currentDocIndex])}
                  className="btn-secondary py-1 px-3 text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
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
              src={`http://localhost:3006/uploads/${extractFile_Name(documents[currentDocIndex])}`}
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
          </div>
        </div>
      )}
    </div>
  );
};