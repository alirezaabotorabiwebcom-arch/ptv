
/**
 * @file This file contains mock data and constants used throughout the application.
 */

/**
 * Mock leaderboard data for development and testing.
 * @type {Array<Object>}
 * @property {number} id - The unique identifier for the user.
 * @property {string} name - The name of the user.
 * @property {number} score - The user's score.
 * @property {number} edits - The number of edits the user has made.
 */
// Mock Leaderboard Data (since backend endpoint wasn't explicitly provided for full leaderboard)
export const MOCK_LEADERBOARD = [
  { id: 1, name: "Ali Reza", score: 150, edits: 45 },
  { id: 2, name: "Sara Kimia", score: 120, edits: 38 },
  { id: 3, name: "Omid V", score: 95, edits: 30 },
  { id: 4, name: "Neda B", score: 80, edits: 25 },
  { id: 5, name: "Kaveh T", score: 65, edits: 20 },
];
