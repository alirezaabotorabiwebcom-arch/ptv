
/**
 * @file types.ts
 * @description Custom types used throughout the application.
 */

/**
 * @enum {string} VoiceFlag
 * @description Represents the possible flags for a voice recording.
 */
export enum VoiceFlag {
  NONE = 'NONE',
  DISTORTED = 'DISTORTED',
  MUSIC = 'MUSIC',
  MULTISPEAKER = 'MULTISPEAKER'
}

/**
 * @interface User
 * @description Represents a user.
 */
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  client_id: string;
  role?: 'USER' | 'ADMIN'; 
}

/**
 * @interface VoiceTask
 * @description Represents a voice task.
 */
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

/**
 * @interface TaskResponse
 * @description Represents the response from the getNextTask API endpoint.
 */
export interface TaskResponse {
  status: 'success' | 'limit_reached' | 'no_tasks';
  message?: string;
  task?: VoiceTask;
}

/**
 * @interface UserEdit
 * @description Represents a user's edit of a voice task.
 */
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

/**
 * @interface UserStats
 * @description Represents a user's statistics.
 */
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

/**
 * @interface MyStats
 * @description Represents a user's own statistics.
 */
export interface MyStats {
  total_done: number;
  corrections_received: number;
  final_score: number;
}

/**
 * @interface LoginResponse
 * @description Represents the response from the login API endpoint.
 */
export interface LoginResponse {
  message: string;
  user_id?: number; // Standard user ID
  admin_id?: number; // Admin ID from backend
  "user Id"?: number; // Legacy support
  name: string;
  role: string; // 'ADMIN' | 'USER'
}

/**
 * @interface CurrentUser
 * @description Represents the currently logged in user.
 */
export interface CurrentUser {
  id: number;
  name: string;
  is_admin: boolean;
  role: string;
}

/**
 * @interface LoginData
 * @description Represents the data required for a login request.
 */
export interface LoginData {
  client_id: string;
  password: string;
}

/**
 * @interface RegisterData
 * @description Represents the data required for a registration request.
 */
export interface RegisterData {
  first_name: string;
  last_name: string;
  client_id: string;
  password: string;
}

/**
 * @interface AdminAnalytics
 * @description Represents the data returned from the admin analytics API endpoint.
 */
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