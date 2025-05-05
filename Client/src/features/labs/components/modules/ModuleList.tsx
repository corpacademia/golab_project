import React from 'react';
import { 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  Pencil, 
  Trash2, 
  BookOpen, 
  Award, 
  Plus 
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';
import { Module, Exercise } from '../../types/modules';

interface ModuleListProps {
  modules: Module[];
  activeModule: string | null;
  activeExercise: string | null;
  onModuleClick: (moduleId: string) => void;
  onExerciseClick: (exerciseId: string) => void;
  onAddModule: () => void;
  onEditModule: (module: Module) => void;
  onDeleteModule: (moduleId: string) => void;
  onAddExercise: (moduleId: string) => void;
  onEditExercise: (moduleId: string, exercise: Exercise) => void;
  onDeleteExercise: (moduleId: string, exerciseId: string) => void;
  canEdit: boolean;
}

export const ModuleList: React.FC<ModuleListProps> = ({
  modules,
  activeModule,
  activeExercise,
  onModuleClick,
  onExerciseClick,
  onAddModule,
  onEditModule,
  onDeleteModule,
  onAddExercise,
  onEditExercise,
  onDeleteExercise,
  canEdit
}) => {
  // Function to filter out duplicate exercises based on title
  const getUniqueExercises = (exercises: Exercise[]): Exercise[] => {
    const uniqueExercises = new Map<string, Exercise>();
    
    exercises.forEach(exercise => {
      // Use exercise ID as the key to ensure uniqueness
      if (!uniqueExercises.has(exercise.id)) {
        uniqueExercises.set(exercise.id, exercise);
      }
    });
    
    return Array.from(uniqueExercises.values());
  };

  return (
    <div className="glass-panel">
      <h2 className="text-xl font-semibold mb-6">
        <GradientText>Module List</GradientText>
      </h2>
      <div className="space-y-2">
        {modules.length === 0 ? (
          <div className="p-4 bg-dark-300/50 rounded-lg text-center">
            <p className="text-gray-400">No modules available</p>
            {canEdit && (
              <button 
                onClick={onAddModule}
                className="mt-2 text-primary-400 hover:text-primary-300 flex items-center justify-center mx-auto"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add your first module
              </button>
            )}
          </div>
        ) : (
          modules.map((module) => (
            <div key={module.id} className="space-y-2">
              <div className="flex items-center">
                <button
                  onClick={() => onModuleClick(module.id)}
                  className={`flex-1 flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    activeModule === module.id
                      ? 'bg-primary-500/20 text-primary-300'
                      : 'bg-dark-300/50 text-gray-300 hover:bg-dark-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Layers className="h-5 w-5" />
                    <span className="font-medium">{module.title}</span>
                  </div>
                  {activeModule === module.id ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
                {canEdit && (
                  <div className="flex ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditModule(module);
                      }}
                      className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                    >
                      <Pencil className="h-4 w-4 text-primary-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteModule(module.id);
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>

              {activeModule === module.id && module.exercises && (
                <div className="ml-6 space-y-1">
                  {/* Apply the getUniqueExercises function to filter out duplicates */}
                  {getUniqueExercises(module.exercises).map((exercise) => (
                    <div key={exercise.id} className="flex items-center">
                      <button
                        onClick={() => onExerciseClick(exercise.id)}
                        className={`flex-1 flex items-center space-x-2 p-2 rounded-lg text-left text-sm transition-colors ${
                          activeExercise === exercise.id
                            ? 'bg-primary-500/10 text-primary-300'
                            : 'text-gray-400 hover:bg-dark-300/70 hover:text-gray-300'
                        }`}
                      >
                        {exercise.type === 'lab' ? (
                          <BookOpen className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <Award className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="truncate">{exercise.title}</span>
                      </button>
                      {canEdit && (
                        <div className="flex ml-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditExercise(module.id, exercise);
                            }}
                            className="p-1.5 hover:bg-primary-500/10 rounded-lg transition-colors"
                          >
                            <Pencil className="h-3 w-3 text-primary-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteExercise(module.id, exercise.id);
                            }}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {canEdit && (
                    <button
                      onClick={() => onAddExercise(module.id)}
                      className="w-full flex items-center justify-center p-2 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-500/5 rounded-lg transition-colors"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Exercise
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};