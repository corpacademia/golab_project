import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GradientText } from '../../../components/ui/GradientText';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Save,
  Loader,
  Check,
  AlertCircle,
  FileText,
  Code,
  Image,
  Link,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X
} from 'lucide-react';
import axios from 'axios';

interface Module {
  id: string;
  title: string;
  content: string;
  order: number;
}

export const CreateModulesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [labConfig, setLabConfig] = useState<any>(location.state?.labConfig || null);
  const [modules, setModules] = useState<Module[]>([
    { id: '1', title: 'Introduction', content: '', order: 1 }
  ]);
  const [activeModuleId, setActiveModuleId] = useState<string>('1');
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!labConfig) {
      navigate('/dashboard/labs/create');
    }
    
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/user_ms/user_profile');
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchUserProfile();
  }, [labConfig, navigate]);

  const activeModule = modules.find(m => m.id === activeModuleId);

  const handleAddModule = () => {
    const newId = (Math.max(...modules.map(m => parseInt(m.id))) + 1).toString();
    const newOrder = Math.max(...modules.map(m => m.order)) + 1;
    const newModule = { id: newId, title: `Module ${newOrder}`, content: '', order: newOrder };
    setModules([...modules, newModule]);
    setActiveModuleId(newId);
  };

  const handleDeleteModule = (id: string) => {
    if (modules.length <= 1) {
      setNotification({ type: 'error', message: 'Cannot delete the only module' });
      return;
    }
    
    const updatedModules = modules.filter(m => m.id !== id);
    // Reorder remaining modules
    const reorderedModules = updatedModules.map((m, idx) => ({
      ...m,
      order: idx + 1
    }));
    
    setModules(reorderedModules);
    
    // Set active module to the first one if the active module was deleted
    if (id === activeModuleId) {
      setActiveModuleId(reorderedModules[0].id);
    }
  };

  const handleMoveModule = (id: string, direction: 'up' | 'down') => {
    const moduleIndex = modules.findIndex(m => m.id === id);
    if (
      (direction === 'up' && moduleIndex === 0) || 
      (direction === 'down' && moduleIndex === modules.length - 1)
    ) {
      return;
    }

    const newModules = [...modules];
    const targetIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
    
    // Swap order values
    const tempOrder = newModules[moduleIndex].order;
    newModules[moduleIndex].order = newModules[targetIndex].order;
    newModules[targetIndex].order = tempOrder;
    
    // Sort by order
    newModules.sort((a, b) => a.order - b.order);
    
    setModules(newModules);
  };

  const handleModuleChange = (id: string, field: 'title' | 'content', value: string) => {
    setModules(modules.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleEditorCommand = (command: string) => {
    if (!activeModule) return;
    
    const textarea = document.getElementById('module-content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    let newText = '';
    
    switch (command) {
      case 'h1':
        newText = `${beforeText}# ${selectedText}${afterText}`;
        break;
      case 'h2':
        newText = `${beforeText}## ${selectedText}${afterText}`;
        break;
      case 'h3':
        newText = `${beforeText}### ${selectedText}${afterText}`;
        break;
      case 'bold':
        newText = `${beforeText}**${selectedText}**${afterText}`;
        break;
      case 'italic':
        newText = `${beforeText}*${selectedText}*${afterText}`;
        break;
      case 'ul':
        newText = `${beforeText}\n- ${selectedText}${afterText}`;
        break;
      case 'ol':
        newText = `${beforeText}\n1. ${selectedText}${afterText}`;
        break;
      case 'link':
        newText = `${beforeText}[${selectedText || 'Link text'}](url)${afterText}`;
        break;
      case 'image':
        newText = `${beforeText}![${selectedText || 'Image alt text'}](image-url)${afterText}`;
        break;
      case 'code':
        newText = `${beforeText}\`\`\`\n${selectedText}\n\`\`\`${afterText}`;
        break;
      default:
        return;
    }
    
    handleModuleChange(activeModuleId, 'content', newText);
    
    // Set focus back to textarea and update selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSave = async () => {
    if (!labConfig) {
      setNotification({ type: 'error', message: 'Lab configuration is missing' });
      return;
    }
    
    setIsSaving(true);
    setNotification(null);
    
    try {
      const labData = {
        ...labConfig,
        modules: modules.map(({ id, title, content, order }) => ({ title, content, order }))
      };
      
      const response = await axios.post('http://localhost:3000/api/v1/cloud_slice_ms/createCloudSliceLab', {
        createdBy: user?.id,
        labData
      });
      
      if (response.data.success) {
        setNotification({ type: 'success', message: 'Lab with modules created successfully!' });
        setTimeout(() => {
          navigate('/dashboard/labs/cloud-slices');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to create lab');
      }
    } catch (error: any) {
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to create lab with modules' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard/labs/create')}
            className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <h1 className="text-3xl font-display font-bold">
            <GradientText>Create Lab Modules</GradientText>
          </h1>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary"
        >
          {isSaving ? (
            <span className="flex items-center">
              <Loader className="animate-spin h-4 w-4 mr-2" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Save Lab
            </span>
          )}
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-500/20 border border-emerald-500/20' 
            : 'bg-red-500/20 border border-red-500/20'
        }`}>
          {notification.type === 'success' ? (
            <Check className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
          <span className={`text-sm ${
            notification.type === 'success' ? 'text-emerald-300' : 'text-red-300'
          }`}>
            {notification.message}
          </span>
        </div>
      )}

      {/* Lab Info Summary */}
      {labConfig && (
        <div className="glass-panel max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">
            <GradientText>Lab Configuration</GradientText>
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Title:</span>
              <p className="text-gray-200">{labConfig.title}</p>
            </div>
            <div>
              <span className="text-gray-400">Cloud Provider:</span>
              <p className="text-gray-200">{labConfig.cloudProvider?.toUpperCase()}</p>
            </div>
            <div>
              <span className="text-gray-400">Region:</span>
              <p className="text-gray-200">{labConfig.region}</p>
            </div>
            <div>
              <span className="text-gray-400">Duration:</span>
              <p className="text-gray-200">
                {new Date(labConfig.startDate).toLocaleDateString()} to {new Date(labConfig.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Module List */}
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="glass-panel h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                <GradientText>Modules</GradientText>
              </h2>
              <button 
                onClick={handleAddModule}
                className="p-1.5 hover:bg-primary-500/10 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 text-primary-400" />
              </button>
            </div>
            
            <div className="space-y-2">
              {modules.map((module) => (
                <div 
                  key={module.id}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    activeModuleId === module.id 
                      ? 'bg-primary-500/15 border border-primary-500/20' 
                      : 'bg-dark-300/50 hover:bg-dark-300 border border-transparent'
                  } transition-colors cursor-pointer`}
                  onClick={() => setActiveModuleId(module.id)}
                >
                  <span className={`text-sm ${
                    activeModuleId === module.id ? 'text-primary-300' : 'text-gray-300'
                  }`}>
                    {module.title}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveModule(module.id, 'up');
                      }}
                      className="p-1 hover:bg-dark-200 rounded transition-colors"
                      disabled={module.order === 1}
                    >
                      <MoveUp className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveModule(module.id, 'down');
                      }}
                      className="p-1 hover:bg-dark-200 rounded transition-colors"
                      disabled={module.order === modules.length}
                    >
                      <MoveDown className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module.id);
                      }}
                      className="p-1 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module Editor */}
        {activeModule && (
          <div className="flex-1 glass-panel max-w-2xl">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Module Title
              </label>
              <input
                type="text"
                value={activeModule.title}
                onChange={(e) => handleModuleChange(activeModuleId, 'title', e.target.value)}
                className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
                placeholder="Enter module title"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Module Content (Markdown)
                </label>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditorCommand('h1')}
                    className="p-1.5 hover:bg-primary-500/10 rounded transition-colors"
                    title="Heading 1"
                  >
                    <Heading1 className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleEditorCommand('h2')}
                    className="p-1.5 hover:bg-primary-500/10 rounded transition-colors"
                    title="Heading 2"
                  >
                    <Heading2 className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleEditorCommand('h3')}
                    className="p-1.5 hover:bg-primary-500/10 rounded transition-colors"
                    title="Heading 3"
                  >
                    <Heading3 className="h-4 w-4 text-gray-400" />
                  </button>
                  <span className="w-px h-4 bg-gray-600 mx-1"></span>
                  <button
                    onClick={() => handleEditorCommand('bold')}
                    className="p-1.5 hover:bg-primary-500/10 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleEditorCommand('italic')}
                    className="p-1.5 hover:bg-primary-500/10 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="h-4 w-4 text-gray-400" />
                  </button>
                  <span className="w-px h-4 bg-gray-600 mx-1"></span>
                  <button
                    onClick={() => handleEditorCommand('ul')}
                    className="p-1.5 hover:bg-primary-500/10 rounded transition-colors"
                    title="Unordered List"
                  >
                    <List className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleEditorCommand('ol')}
                    className="p-1.5 hover:bg-primary-500/10 rounded transition-colors"
                    title="Ordered List"
                  >
                    <ListOrdered className="h-4 w-4 text-gray-400" />
                  </button>
                  <span className="w-px h-4 bg-gray-600 mx-1"></span>
                  <button
                    onClick={() => handleEditorCommand('link')}
                    className="p-1.5 hover:bg-primary-500/10 rounded transition-colors"
                    title="Link"
                  >
                    <Link className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleEditorCommand('image')}
                    className="p-1.5 hover:bg-primary-500/10 rounded transition-colors"
                    title="Image"
                  >
                    <Image className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleEditorCommand('code')}
                    className="p-1.5 hover:bg-primary-500/10 rounded transition-colors"
                    title="Code Block"
                  >
                    <Code className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className={`relative border ${
                isEditorFocused 
                  ? 'border-primary-500/40 ring-2 ring-primary-500/20' 
                  : 'border-primary-500/20'
              } rounded-lg transition-colors`}>
                <textarea
                  id="module-content"
                  value={activeModule.content}
                  onChange={(e) => handleModuleChange(activeModuleId, 'content', e.target.value)}
                  onFocus={() => setIsEditorFocused(true)}
                  onBlur={() => setIsEditorFocused(false)}
                  className="w-full h-96 px-4 py-3 bg-dark-400/50 rounded-lg
                           text-gray-300 font-mono text-sm focus:outline-none"
                  placeholder="Write your module content in Markdown format..."
                />
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                <span className="text-primary-400">Tip:</span> Use Markdown syntax for formatting. You can also use the toolbar above.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};