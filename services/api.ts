import axios from 'axios';
import { VoiceTask, UserEdit, UserStats, VoiceFlag, LoginData, LoginResponse, RegisterData, TaskResponse, AdminAnalytics } from '../types';
import config from '../config';

// ============================================================
// 1. Settings (Server Address)
// ============================================================
// Read from config.ts
const DEFAULT_API_URL = config.API_BASE_URL; 
const SAVED_API_URL = localStorage.getItem('vtg_api_url');
const API_URL = SAVED_API_URL || DEFAULT_API_URL;

/**
 * Axios instance for making API requests.
 * Configured with the base URL and necessary headers.
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // Essential for ngrok free tier
  },
  timeout: 10000, 
});

/**
 * Sets the API URL in local storage and reloads the page.
 * @param {string} url - The new API URL.
 */
export const setApiUrl = (url: string) => {
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `http://${cleanUrl}`;
  }
  cleanUrl = cleanUrl.replace(/\/$/, ''); 
  localStorage.setItem('vtg_api_url', cleanUrl);
  window.location.reload(); 
};

/**
 * Gets the current API URL.
 * @returns {string} The current API URL.
 */
export const getApiUrl = () => API_URL;

/**
 * Checks for a mixed content error, which occurs when an HTTPS page
 * tries to load content from an HTTP source.
 * @returns {boolean} True if a mixed content error is detected, false otherwise.
 */
export const isMixedContentError = () => {
  return window.location.protocol === 'https:' && API_URL.startsWith('http:');
};

/**
 * Formats the URL for a voice file, handling different environments.
 * @param {string} path - The path to the voice file.
 * @returns {string} The formatted URL.
 */
// Helper for MinIO URLs
const formatVoiceUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith("http")) return path;
    
    // If using ngrok, we cannot access port 9000 directly. 
    // We assume the backend might proxy it or it's unavailable.
    // We'll try to append to API_URL which is the only accessible endpoint.
    if (API_URL.includes("ngrok")) {
         const cleanPath = path.replace(/^\//, '');
         return `${API_URL}/${cleanPath}`;
    }
    
    // Default behavior for local development (MinIO on port 9000)
    const baseUrl = new URL(API_URL);
    const host = baseUrl.hostname;
    const protocol = baseUrl.protocol;
    
    return `${protocol}//${host}:9000/${path.replace(/^\//, '')}`;
};

/**
 * Service object for interacting with the voice API.
 */
export const VoiceService = {

  // -------------------------
  // Auth
  // -------------------------

  /**
   * Registers a new user.
   * @param {RegisterData} data - The user's registration data.
   * @returns {Promise<any>} The response from the server.
   */
  async register(data: RegisterData) {
    const response = await api.post("/users/auth/register", data);
    return response.data;
  },

  /**
   * Logs in a user.
   * @param {LoginData} data - The user's login credentials.
   * @returns {Promise<LoginResponse>} The login response from the server.
   */
  async loginUser(data: LoginData): Promise<LoginResponse> {
    const response = await api.post("/users/auth/login", data);
    return { ...response.data, role: 'USER' };
  },

  /**
   * Logs in an admin.
   * @param {LoginData} data - The admin's login credentials.
   * @returns {Promise<LoginResponse>} The login response from the server.
   */
  async loginAdmin(data: LoginData): Promise<LoginResponse> {
    const response = await api.post("/admin/auth/login", data);
    // Backend returns 'admin_id', map it to standard 'user_id' for frontend compatibility
    return { 
        ...response.data, 
        user_id: response.data.admin_id, 
        role: 'ADMIN' 
    };
  },

  /**
   * Updates a user's profile information.
   * @param {number} user_id - The ID of the user to update.
   * @param {string} first_name - The user's new first name.
   * @param {string} last_name - The user's new last name.
   * @param {string} [password] - The user's new password (optional).
   * @returns {Promise<any>} The response from the server.
   */
  async updateUser(user_id: number, first_name: string, last_name: string, password?: string) {
    const data: any = { first_name, last_name };
    if (password) {
      data.password = password;
    }
    const response = await api.put(`/users/${user_id}`, data);
    return response.data;
  },

  // -------------------------
  // Tasks
  // -------------------------

  /**
   * Gets the next available task for a user.
   * @param {number} user_id - The ID of the user.
   * @param {boolean} [requestMore=false] - Flag to request more tasks if the limit is reached.
   * @returns {Promise<TaskResponse>} The task response from the server.
   */
  async getNextTask(user_id: number, requestMore: boolean = false): Promise<TaskResponse> {
    try {
      const response = await api.get<TaskResponse>("/users/tasks/next", {
        params: { user_id, request_more: requestMore }
      });
      
      const data = response.data;
      if (data.task) {
          data.task.voice_url = formatVoiceUrl(data.task.voice_name);
      }
      return data;

    } catch (error: any) {
       // If backend returns 404 for "no tasks", handle it gracefully
       if (error.response?.status === 404) {
         return { status: 'no_tasks' };
       }
       throw error;
    }
  },

  /**
   * Submits an edit for a task.
   * @param {number} user_id - The ID of the user.
   * @param {number} task_id - The ID of the task.
   * @param {string} word - The edited word.
   * @param {VoiceFlag} [flag=VoiceFlag.NONE] - An optional flag for the task.
   * @returns {Promise<any>} The response from the server.
   */
  async submitEdit(user_id: number, task_id: number, word: string, flag: VoiceFlag = VoiceFlag.NONE) {
    const payload = {
      user_id: user_id,
      task_id: task_id,
      word_after_edit: word,
      flag: flag
    };
    const response = await api.post("/users/tasks/submit", payload);
    return response.data;
  },

  /**
   * Gets a user's edit history.
   * @param {number} user_id - The ID of the user.
   * @returns {Promise<UserEdit[]>} A list of the user's edits.
   */
  async getMyHistory(user_id: number): Promise<UserEdit[]> {
    const response = await api.get<UserEdit[]>(`/users/history/${user_id}`);
    return response.data;
  },

  // -------------------------
  // Admin & Analytics
  // -------------------------
  
  /**
   * Gets a list of tasks for the admin panel.
   * @param {number} [skip=0] - The number of tasks to skip (for pagination).
   * @param {number} [take=10] - The number of tasks to take (for pagination).
   * @returns {Promise<VoiceTask[]>} A list of tasks.
   */
  async getTasks(skip: number = 0, take: number = 10): Promise<VoiceTask[]> {
    try {
        const response = await api.get<VoiceTask[]>("/admin/reports/all-edits", { params: { skip, take, admin_id: 1 } });
        return response.data.map(task => ({
            ...task,
            voice_url: formatVoiceUrl(task.voice_name)
        }));
    } catch (e) {
        return [];
    }
  },

  /**
   * Gets analytics data for the admin panel.
   * @param {number} admin_id - The ID of the admin.
   * @param {number} [days=7] - The number of days to get analytics for.
   * @returns {Promise<AdminAnalytics>} The admin analytics data.
   */
  async getAdminAnalytics(admin_id: number, days: number = 7): Promise<AdminAnalytics> {
     const response = await api.get<AdminAnalytics>("/admin/analytics", {
         params: { admin_id, days }
     });
     return response.data;
  },

  /**
   * Blocks a user.
   * @param {number} admin_id - The ID of the admin performing the action.
   * @param {number} target_user_id - The ID of the user to block.
   * @returns {Promise<any>} The response from the server.
   */
  async blockUser(admin_id: number, target_user_id: number) {
      const response = await api.post(`/admin/users/${target_user_id}/block`, null, {
          params: { admin_id }
      });
      return response.data;
  },

  /**
   * Uploads a new task.
   * @param {string} adminName - The name of the admin uploading the task.
   * @param {string} word - The word for the new task.
   * @param {File} file - The audio file for the task.
   * @param {number} adminId - The ID of the admin.
   * @returns {Promise<any>} The response from the server.
   */
  async uploadTask(adminName: string, word: string, file: File, adminId: number) {
    const formData = new FormData();
    formData.append('admin_id', adminId.toString());
    formData.append('word', word);
    formData.append('file', file);

    const response = await api.post("/admin/task/upload", formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Approves an edit.
   * @param {number} editId - The ID of the edit to approve.
   * @param {number} adminId - The ID of the admin.
   * @returns {Promise<any>} The response from the server.
   */
  async approveEdit(editId: number, adminId: number) {
    const response = await api.put(`/admin/approve-edit/${editId}`, null, {
        params: { admin_id: adminId }
    });
    return response.data;
  },
  
  /**
   * Updates an edit.
   * @param {number} edit_id - The ID of the edit to update.
   * @param {string} word - The new word for the edit.
   * @returns {Promise<any>} The response from the server.
   */
  async updateEdit(edit_id: number, word: string) {
      const response = await api.put(`/edits/${edit_id}`, { word_after_edit: word });
      return response.data;
  },

  // -------------------------
  // Statistics & Leaderboard
  // -------------------------

  /**
   * Gets a user's statistics.
   * @param {number} user_id - The ID of the user.
   * @returns {Promise<UserStats>} The user's statistics.
   */
  async getUserStats(user_id: number): Promise<UserStats> {
    const response = await api.get<UserStats>(`/users/stats/${user_id}`);
    const data = response.data;
    // Fallback/Mock for daily limits if backend doesn't send them yet
    if (data.daily_limit === undefined) data.daily_limit = 50;
    if (data.today_edits === undefined) {
        // Just for demo, assuming total_edits is all we have. 
        // In real scenario this should come from API.
        data.today_edits = (data.total_edits || 0); 
    }
    return data;
  },
  
  /**
   * Gets the leaderboard data.
   * @param {number} user_id - The ID of the user.
   * @returns {Promise<any>} The leaderboard data.
   */
  async getLeaderboard(user_id: number) {
    // GET /users/leaderboard?user_id=...
    const response = await api.get<any>("/users/leaderboard", {
        params: { user_id }
    });
    // If string, try parsing, otherwise return array/object
    if (typeof response.data === 'string') {
        try {
            return JSON.parse(response.data);
        } catch(e) {
            return [];
        }
    }
    return response.data;
  },
  
  /**
   * Legacy mapping for getUserEdits, now using getMyHistory.
   * @param {number} user_id - The ID of the user.
   * @returns {Promise<UserEdit[]>} A list of the user's edits.
   */
  // Legacy mapping
  async getUserEdits(user_id: number) {
      return this.getMyHistory(user_id);
  },

  /**
   * Checks the health of the API.
   * @returns {Promise<boolean>} True if the API is healthy, false otherwise.
   */
  async checkHealth() {
    try {
      const response = await api.get("/docs", { timeout: 5000 }); 
      return response.status >= 200 && response.status < 500;
    } catch (error) {
      return false;
    }
  }
};

export default VoiceService;