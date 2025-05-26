import React, { useRef, useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';

interface DocumentUploaderProps {
  onDocumentsChange: (documents: File[]) => void;
  onUserGuidesChange: (guides: File[]) => void;
  onNext?: () => void; // Added onNext prop
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onDocumentsChange,
  onUserGuidesChange,
  onNext
}) => {
  const [documents, setDocuments] = useState<File[]>([]);
  const [userGuides, setUserGuides] = useState<File[]>([]);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const guideInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, type: 'document' | 'guide') => {
    e.preventDefault();
    e.stopPropagation();
    setDocumentError(null);
    
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    
    const files = Array.from(e.dataTransfer.files);
    
    // Validate file types
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setDocumentError('Only PDF and Word documents are allowed');
      setTimeout(() => setDocumentError(null), 5000);
      return;
    }
    
    // Validate file sizes (1GB limit)
    const oversizedFiles = files.filter(file => file.size > 1 * 1024 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setDocumentError('Files must be smaller than 1GB');
      setTimeout(() => setDocumentError(null), 5000);
      return;
    }
    
    if (type === 'document') {
      const updatedDocs = [...documents, ...files];
      setDocuments(updatedDocs);
      onDocumentsChange(updatedDocs);
    } else {
      const updatedGuides = [...userGuides, ...files];
      setUserGuides(updatedGuides);
      onUserGuidesChange(updatedGuides);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'guide') => {
    setDocumentError(null);
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    // Validate file types
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setDocumentError('Only PDF and Word documents are allowed');
      setTimeout(() => setDocumentError(null), 5000);
      return;
    }
    
    // Validate file sizes (1GB limit)
    const oversizedFiles = files.filter(file => file.size > 1 * 1024 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setDocumentError('Files must be smaller than 1GB');
      setTimeout(() => setDocumentError(null), 5000);
      return;
    }
    
    if (type === 'document') {
      const updatedDocs = [...documents, ...files];
      localStorage.setItem('lab_documents', JSON.stringify(updatedDocs));
      setDocuments(updatedDocs);
      onDocumentsChange(updatedDocs);
    } else {
      const updatedGuides = [...userGuides, ...files];
      localStorage.setItem('lab_user_guides', JSON.stringify(updatedGuides));
      setUserGuides(updatedGuides);
      onUserGuidesChange(updatedGuides);
    }
  };

  const handleRemoveDocument = (index: number, type: 'document' | 'guide') => {
    if (type === 'document') {
      const updatedDocs = documents.filter((_, i) => i !== index);
      setDocuments(updatedDocs);
      onDocumentsChange(updatedDocs);
    } else {
      const updatedGuides = userGuides.filter((_, i) => i !== index);
      setUserGuides(updatedGuides);
      onUserGuidesChange(updatedGuides);
    }
  };

  const handleContinue = () => {
    if (onNext) {
      onNext();
    }
  };

  const renderDocumentUploader = (type: 'document' | 'guide') => {
    const files = type === 'document' ? documents : userGuides;
    const inputRef = type === 'document' ? fileInputRef : guideInputRef;
    const title = type === 'document' ? 'Lab Documents' : 'User Guides';
    const description = type === 'document' 
      ? 'Upload lab materials, exercises, and reference documents' 
      : 'Upload user guides and instructions for lab participants';

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-400 mb-3">{title}</h3>
        <div 
          className="border-2 border-dashed border-primary-500/20 rounded-lg p-6 mb-4 hover:border-primary-500/40 transition-colors"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, type)}
        >
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-primary-400/50 mb-4" />
            <input
              type="file"
              ref={inputRef}
              onChange={(e) => handleFileSelect(e, type)}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              Upload files
            </button>
            <p className="mt-2 text-sm text-gray-400">
              or drag and drop
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {description}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PDF, DOC, DOCX up to 1GB
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-400">Uploaded files:</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-300/50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-primary-400 mr-2" />
                  <span className="text-sm text-gray-300 truncate max-w-md">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({(file.size / (1024 * 1024) ).toFixed(1)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDocument(index, type)}
                  className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-400 mb-6">Lab Documents</h2>
      <p className="text-gray-400 mb-6">
        Upload documents and guides for your lab environment. These will be available to users during the lab session.
      </p>
      
      {documentError && (
        <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-200" />
            <span className="text-white-600">{documentError}</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {renderDocumentUploader('document')}
        </div>
        <div className="space-y-4">
          {renderDocumentUploader('guide')}
        </div>
      </div>

      {/* Continue button */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          className="btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  );
};