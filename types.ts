
export enum VoiceFlag {
  NONE = 'NONE',
  DISTORTED = 'DISTORTED',
  MUSIC = 'MUSIC',
  MULTISPEAKER = 'MULTISPEAKER'
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  client_id: string;
  role?: 'USER' | 'ADMIN'; 
}

export interface VoiceTask {
  id: number;
  admin_name?: string;
  voice_name: string; // URL/Path to file
  word: string;
  original_word?: string; // For review comparison
  is_review_mode?: boolean; // New Logic
  flag?: VoiceFlag;
  upload_date?: string;
  voice_url?: string; // Computed URL for frontend
  edits?: UserEdit[]; // For Admin Review
}

export interface TaskResponse {
  status: 'success' | 'limit_reached' | 'no_tasks';
  message?: string;
  task?: VoiceTask;
}

export interface UserEdit {
  id: number;
  word_after_edit: string;
  is_approved: boolean;
  selected_flag?: VoiceFlag; 
  update_date: string;
  created_at: string;
  user_id: number;
  task_id: number;
  user?: User; 
  task?: VoiceTask; 
}

export interface UserStats {
  id: number;
  name: string;
  score: number;
  total_edits?: number;
  approved_edits?: number;
  last_activity?: string;
  today_edits?: number; // New field for progress bar
  daily_limit?: number; // New field for progress bar
}

export interface MyStats {
  total_done: number;
  corrections_received: number;
  final_score: number;
}

export interface LoginResponse {
  message: string;
  user_id?: number; // Standard user ID
  admin_id?: number; // Admin ID from backend
  "user Id"?: number; // Legacy support
  name: string;
  role: string; // 'ADMIN' | 'USER'
}

export interface CurrentUser {
  id: number;
  name: string;
  is_admin: boolean;
  role: string;
}

export interface LoginData {
  client_id: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  client_id: string;
  password: string;
}

export interface AdminAnalytics {
  total_tasks_done: number;
  users_performance: {
    id: number;
    first_name: string;
    last_name: string;
    is_blocked: boolean;
    total_actions: number;
    corrections: number;
    flags: number;
  }[];
}