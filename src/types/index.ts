export interface User {
  id: string;
  email: string;
  full_name?: string;
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
  interests?: string[];
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  image_url: string;
  duration: number; // in minutes
  created_at: string;
}

export interface UserProgress {
  user_id: string;
  course_id: string;
  progress: number; // percentage
  completed: boolean;
  last_accessed: string;
  quiz_scores: Record<string, number>;
}

export interface Assessment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  passing_score: number;
  created_at: string;
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

export interface UserAssessment {
  id: string;
  user_id: string;
  assessment_id: string;
  score: number;
  completed_at: string;
  assigned_difficulty: 'beginner' | 'intermediate' | 'advanced';
}