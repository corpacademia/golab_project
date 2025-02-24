import React, { useState } from 'react';
import { GradientText } from '../../../components/ui/GradientText';
import { WorkspaceFilters } from '../components/workspace/WorkspaceFilters';
import { WorkspaceList } from '../components/workspace/WorkspaceList';
import { CreateWorkspaceForm } from '../components/workspace/CreateWorkspaceForm';
import { Plus, Trash2 } from 'lucide-react';

// Mock data - Replace with actual API integration
const mockWorkspaces = [
  {
    id: '1',
    name: 'AWS Cloud Architecture Lab',
    description: 'Hands-on lab for learning AWS cloud architecture patterns',
    type: 'single-vm',
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '2',
    name: 'Kubernetes Cluster Lab',
    description: 'Multi-node Kubernetes cluster setup and management',
    type: 'vm-cluster',
    createdAt: new Date('2024-03-05'),
  },
];

export const WorkspacePage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([]);
  const [workspaces, setWorkspaces] = useState(mockWorkspaces);

  const handleFilterChange = (filters: any) => {
    // Implement filtering logic
    console.log('Filters:', filters);
  };

  const handleSelect = (id: string) => {
    setSelectedWorkspaces(prev =>
      prev.includes(id)
        ? prev.filter(wId => wId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedWorkspaces(
      selected ? workspaces.map(w => w.id) : []
    );
  };

  const handleDelete = (ids: string[]) => {
    setWorkspaces(prev =>
      prev.filter(workspace => !ids.includes(workspace.id))
    );
    setSelectedWorkspaces(prev =>
      prev.filter(id => !ids.includes(id))
    );
  };

  const handleCreateWorkspace = (data: any) => {
    const newWorkspace = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date(data.createdAt),
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {isCreating ? (
        <CreateWorkspaceForm
          onSubmit={handleCreateWorkspace}
          onCancel={() => setIsCreating(false)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-display font-bold">
                <GradientText>Workspaces</GradientText>
              </h1>
              <p className="mt-2 text-gray-400">
                Manage your lab workspaces and environments
              </p>
            </div>
            <div className="flex space-x-4">
              {selectedWorkspaces.length > 0 && (
                <button
                  onClick={() => handleDelete(selectedWorkspaces)}
                  className="btn-secondary text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </button>
              )}
              <button
                onClick={() => setIsCreating(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </button>
            </div>
          </div>

          <WorkspaceFilters onFilterChange={handleFilterChange} />
          
          <WorkspaceList
            workspaces={workspaces}
            selectedWorkspaces={selectedWorkspaces}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
};