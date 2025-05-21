export type CleanupPolicyType = 'auto' | 'scheduled' | 'inactivity' | 'manual';

export interface CleanupPolicy {
  enabled: boolean;
  type: CleanupPolicyType;
  duration?: number;
  durationUnit?: 'seconds' | 'minutes' | 'hours';
  scheduledTime?: string;
  inactivityTimeout?: number;
  inactivityTimeoutUnit?: 'minutes' | 'hours';
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  title: string;
  type: 'lab' | 'questions';
  description: string;
  order: number;
  duration: number;
}

export interface LabExercise {
  id: string;
  exercise_id: string;
  instructions: string;
  files?: string[];
  services: string[];
  credentials: {
    username: string;
    password: string;
  };
  cleanupPolicy?: CleanupPolicy;
}

export interface QuizExercise {
  id: string;
  exerciseId: string;
  duration: number;
  questions: {
    id: string;
    text: string;
    description: string;
    options: {
      id: string;
      text: string;
      is_correct: boolean;
    }[];
  }[];
}

export interface Service {
  name: string;
  category: string;
  description: string;
}