import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Loader, 
  Check, 
  AlertCircle,
  Clock,
  Plus,
  Trash2
} from 'lucide-react';
import { GradientText } from '../../../../components/ui/GradientText';

interface QuizExerciseEditorProps {
  exercise: any;
  moduleId: string;
  sliceId: string;
  onUpdate: (exerciseId: string, updatedData: any) => Promise<any>;
  onDelete: (exerciseId: string) => Promise<any>;
}

export const QuizExerciseEditor: React.FC<QuizExerciseEditorProps> = ({
  exercise,
  moduleId,
  sliceId,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(exercise.title || '');
  const [description, setDescription] = useState(exercise.description || '');
  const [duration, setDuration] = useState(exercise.duration || 15);
  const [questions, setQuestions] = useState(exercise.questions || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (duration <= 0) {
      setError('Duration must be greater than 0');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedExercise = {
        ...exercise,
        title,
        description,
        duration,
        questions
      };

      await onUpdate(exercise.id, updatedExercise);
      
      setSuccess('Exercise updated successfully');
      setIsEditing(false);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving quiz exercise:', err);
      setError(err.response?.data?.message || 'Failed to update exercise');
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onDelete(exercise.id);
    } catch (err: any) {
      console.error('Error deleting quiz exercise:', err);
      setError(err.response?.data?.message || 'Failed to delete exercise');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        text: '',
        options: [
          { id: `o-${Date.now()}-1`, text: '', isCorrect: false },
          { id: `o-${Date.now()}-2`, text: '', isCorrect: false }
        ]
      }
    ]);
  };

  const handleRemoveQuestion = (questionIndex: number) => {
    setQuestions(questions.filter((_, index) => index !== questionIndex));
  };

  const handleQuestionChange = (questionIndex: number, text: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].text = text;
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({
      id: `o-${Date.now()}-${updatedQuestions[questionIndex].options.length + 1}`,
      text: '',
      isCorrect: false
    });
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter(
      (_, index) => index !== optionIndex
    );
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, text: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex].text = text;
    setQuestions(updatedQuestions);
  };

  const handleCorrectOptionChange = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.map(
      (option, index) => ({
        ...option,
        isCorrect: index === optionIndex
      })
    );
    setQuestions(updatedQuestions);
  };

  return (
    <div className="glass-panel mb-4 relative">
      {/* Notification */}
      {error && (
        <div className="absolute top-2 right-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2 z-10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="absolute top-2 right-2 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center space-x-2 z-10">
          <Check className="h-4 w-4 text-emerald-400" />
          <span className="text-sm text-emerald-300">{success}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        {isEditing ? (
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-200 focus:border-primary-500/40 focus:outline-none mb-2"
              placeholder="Exercise Title"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                       text-gray-200 focus:border-primary-500/40 focus:outline-none"
              placeholder="Exercise Description"
              rows={3}
            />
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold">
              <GradientText>{title}</GradientText>
            </h3>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          </div>
        )}
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setTitle(exercise.title);
                  setDescription(exercise.description);
                  setDuration(exercise.duration || 15);
                  setQuestions(exercise.questions || []);
                }}
                className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
              <button
                onClick={handleSave}
                className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 text-primary-400 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 text-primary-400" />
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
              >
                <GradientText>Edit</GradientText>
              </button>
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <span className="text-red-400">Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Duration Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-300">Duration</h4>
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary-400" />
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-24 px-3 py-1 bg-dark-400/50 border border-primary-500/20 rounded-lg
                         text-gray-300 focus:border-primary-500/40 focus:outline-none"
              />
              <span className="text-sm text-gray-400">minutes</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary-400" />
              <span className="text-sm text-gray-300">{duration} minutes</span>
            </div>
          )}
        </div>
      </div>

      {/* Questions Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-4">Questions</h4>
        
        <div className="space-y-6">
          {questions && questions.length > 0 ? (
            questions.map((question, questionIndex) => (
              <div 
                key={question.id || questionIndex} 
                className="p-4 bg-dark-300/50 rounded-lg border border-primary-500/10"
              >
                {isEditing ? (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 mr-3">
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                          className="w-full px-4 py-2 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                   text-gray-200 focus:border-primary-500/40 focus:outline-none"
                          placeholder={`Question ${questionIndex + 1}`}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveQuestion(questionIndex)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      {question.options && question.options.map((option, optionIndex) => (
                        <div key={option.id || `option-${questionIndex}-${optionIndex}`} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            checked={option.isCorrect}
                            onChange={() => handleCorrectOptionChange(questionIndex, optionIndex)}
                            className="h-4 w-4 text-primary-500 focus:ring-primary-500"
                          />
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-dark-400/50 border border-primary-500/20 rounded-lg
                                     text-gray-200 focus:border-primary-500/40 focus:outline-none"
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <button
                            onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                            disabled={question.options.length <= 2}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => handleAddOption(questionIndex)}
                        className="flex items-center text-sm text-primary-400 hover:text-primary-300 mt-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-gray-200 mb-3">
                      {question.text || `Question ${questionIndex + 1}`}
                    </p>
                    <div className="space-y-2 ml-4">
                      {question.options && question.options.map((option, optionIndex) => (
                        <div key={option.id || `option-${questionIndex}-${optionIndex}`} className="flex items-center space-x-3">
                          <div className={`h-4 w-4 rounded-full ${
                            option.isCorrect ? 'bg-primary-500' : 'border border-gray-500'
                          }`} />
                          <span className="text-sm text-gray-300">{option.text}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 bg-dark-300/30 rounded-lg">
              <p className="text-gray-400">No questions added yet.</p>
              {isEditing && (
                <p className="text-sm text-gray-500 mt-1">Click "Add Question" below to create one.</p>
              )}
            </div>
          )}
          
          {isEditing && (
            <button
              onClick={handleAddQuestion}
              className="w-full py-2 border border-dashed border-primary-500/30 rounded-lg
                       text-primary-400 hover:text-primary-300 hover:border-primary-500/50
                       transition-colors flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
};