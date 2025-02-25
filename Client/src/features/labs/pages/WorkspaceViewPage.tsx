import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { FileText, Calendar, Tag, Activity, Download, Pencil } from 'lucide-react';
import axios from 'axios';

interface Workspace {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive' | 'pending';
  documents: { name: string; url: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export const WorkspaceViewPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await axios.get(`/api/workspaces/${workspaceId}`);
        setWorkspace(response.data);
      } catch (error) {
        console.error('Failed to fetch workspace:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-300">Workspace not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold">
            <GradientText>{workspace.name}</GradientText>
          </h1>
          <p className="mt-2 text-gray-400">{workspace.description}</p>
        </div>
        <button
          onClick={() => navigate(`/dashboard/labs/workspace/${workspaceId}/edit`)}
          className="btn-secondary"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel">
          <h2 className="text-xl font-semibold mb-6">
            <GradientText>Workspace Details</GradientText>
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-400">
                <Tag className="h-4 w-4" />
                <span>Type:</span>
              </div>
              <span className="text-gray-200">{workspace.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-400">
                <Activity className="h-4 w-4" />
                <span>Status:</span>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                workspace.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                workspace.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
                'bg-amber-500/20 text-amber-300'
              }`}>
                {workspace.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Created:</span>
              </div>
              <span className="text-gray-200">
                {new Date(workspace.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Last Updated:</span>
              </div>
              <span className="text-gray-200">
                {new Date(workspace.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <h2 className="text-xl font-semibold mb-6">
            <GradientText>Documents</GradientText>
          </h2>
          {workspace.documents.length > 0 ? (
            <div className="space-y-4">
              {workspace.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-dark-300/50 rounded-lg hover:bg-dark-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-primary-400" />
                    <span className="text-gray-200">{doc.name}</span>
                  </div>
                  <a
                    href={doc.url}
                    download
                    className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4 text-primary-400" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No documents uploaded</p>
          )}
        </div>
      </div>
    </div>
  );
};