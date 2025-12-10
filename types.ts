
/**
 * @file This file contains TypeScript type definitions used throughout the application.
 */

/**
 * Enum for voice task flags, indicating issues with the audio.
 */
export enum VoiceFlag {
  /** No flag. */
  NONE = 'NONE',
  /** The audio is distorted. */
  DISTORTED = 'DISTORTED',
  /** There is music in the background. */
  MUSIC = 'MUSIC',
  /** There are multiple speakers in the audio. */
  MULTISPEAKER = 'MULTISPEAKER'
}

/**
 * Represents a user of the application.
 */
export interface User {
  /** The unique identifier for the user. */
  id: number;
  /** The user's first name. */
  first_name: string;
  /** The user's last name. */
  last_name: string;
  /** The client ID assigned to the user. */
  client_id: string;
  /** The role of the user, can be 'USER' or 'ADMIN'. */
  role?: 'USER' | 'ADMIN'; 
}

/**
 * Represents a voice task to be transcribed.
 */
export interface VoiceTask {
  /** The unique identifier for the task. */
  id: number;
  /** The name of the admin who uploaded the task. */
  admin_name?: string;
  /** The URL or path to the voice file. */
  voice_name: string;
  /** The transcribed word for the voice file. */
  word: string;
  /** The original word for review comparison. */
  original_word?: string;
  /** Flag indicating if the task is in review mode. */
  is_review_mode?: boolean;
  /** Flag for any issues with the voice file. */
  flag?: VoiceFlag;
  /** The date the task was uploaded. */
  upload_date?: string;
  /** The computed URL for the voice file for frontend use. */
  voice_url?: string;
  /** A list of user edits for admin review. */
  edits?: UserEdit[];
}

/**
 * Represents the response from the server when requesting a task.
 */
export interface TaskResponse {
  /** The status of the task request. */
  status: 'success' | 'limit_reached' | 'no_tasks';
  /** An optional message from the server. */
  message?: string;
  /** The voice task object, if the request was successful. */
  task?: VoiceTask;
}

/**
 * Represents an edit made by a user on a task.
 */
export interface UserEdit {
  /** The unique identifier for the edit. */
  id: number;
  /** The word after the user's edit. */
  word_after_edit: string;
  /** Flag indicating if the edit was approved. */
  is_approved: boolean;
  /** The flag selected by the user for the task. */
  selected_flag?: VoiceFlag; 
  /** The date the edit was last updated. */
  update_date: string;
  /** The date the edit was created. */
  created_at: string;
  /** The ID of the user who made the edit. */
  user_id: number;
  /** The ID of the task that was edited. */
  task_id: number;
  /** The user who made the edit. */
  user?: User; 
  /** The task that was edited. */
  task?: VoiceTask; 
}

/**
 * Represents a user's statistics.
 */
export interface UserStats {
  /** The unique identifier for the user. */
  id: number;
  /** The name of the user. */
  name: string;
  /** The user's score. */
  score: number;
  /** The total number of edits made by the user. */
  total_edits?: number;
  /** The number of approved edits for the user. */
  approved_edits?: number;
  /** The timestamp of the user's last activity. */
  last_activity?: string;
  /** The number of edits made by the user today. */
  today_edits?: number;
  /** The user's daily task limit. */
  daily_limit?: number;
}

/**
 * Represents the current user's personal statistics.
 */
export interface MyStats {
  /** The total number of tasks completed by the user. */
  total_done: number;
  /** The number of corrections received by the user. */
  corrections_received: number;
  /** The user's final score. */
  final_score: number;
}

/**
 * Represents the response from the server after a login attempt.
 */
export interface LoginResponse {
  /** A message from the server. */
  message: string;
  /** The user's ID. */
  user_id?: number;
  /** The admin's ID (if logging in as an admin). */
  admin_id?: number;
  /** Legacy support for user ID. */
  "user Id"?: number;
  /** The name of the user. */
  name: string;
  /** The role of the user. */
  role: string;
}

/**
 * Represents the currently logged-in user.
 */
export interface CurrentUser {
  /** The unique identifier for the user. */
  id: number;
  /** The name of the user. */
  name: string;
  /** Flag indicating if the user is an admin. */
  is_admin: boolean;
  /** The role of the user. */
  role: string;
}

/**
 * Represents the data required for a login request.
 */
export interface LoginData {
  /** The user's client ID. */
  client_id: string;
  /** The user's password. */
  password: string;
}

/**
 * Represents the data required for a registration request.
 */
export interface RegisterData {
  /** The user's first name. */
  first_name: string;
  /** The user's last name. */
  last_name: string;
  /** The user's client ID. */
  client_id: string;
  /** The user's password. */
  password: string;
}

/**
 * Represents the analytics data for the admin panel.
 */
export interface AdminAnalytics {
  /** The total number of tasks done. */
  total_tasks_done: number;
  /** A list of users' performance data. */
  users_performance: {
    /** The unique identifier for the user. */
    id: number;
    /** The user's first name. */
    first_name: string;
    /** The user's last name. */
    last_name: string;
    /** Flag indicating if the user is blocked. */
    is_blocked: boolean;
    /** The total number of actions taken by the user. */
    total_actions: number;
    /** The number of corrections made by the user. */
    corrections: number;
    /** The number of flags raised by the user. */
    flags: number;
  }[];
}