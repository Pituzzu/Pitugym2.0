
export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  isHeader?: boolean;
}

export interface WorkoutDay {
  id: string;
  dayName: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  frequency: number;
  goal?: string;
  days: WorkoutDay[];
  createdAt: string;
  isPublic?: boolean; // Se visibile agli amici
}

export interface SetLog {
  weight: number;
  reps: number;
  rpe?: number; // Da 1 a 10
  type?: 'normal' | 'warmup' | 'dropset' | 'failure';
}

export interface ExerciseLog {
  name: string;
  sets: SetLog[];
  isPR?: boolean; // Se è un record personale
  notes?: string; // Note specifiche della sessione
}

export interface WorkoutLog {
  id: string;
  planId: string;
  planTitle: string;
  dayName: string;
  date: string;
  exercises: ExerciseLog[];
  totalVolume?: number;
}

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'training';
  isMutual: boolean;
  requestStatus?: 'sent' | 'received'; // Per distinguere chi ha inviato la richiesta
  logs: WorkoutLog[];
  plans: WorkoutPlan[];
  lastActive: string;
}

export interface PaymentLog {
  id: string;
  amount: number;
  date: string;
  expiryDate: string;
  method: string;
  notes?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  targetDate?: string;
  completed: boolean;
  category: 'strength' | 'weight' | 'endurance' | 'other';
}

export interface BodyMetric {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
}
