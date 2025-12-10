import React, { useEffect, useState } from 'react';
import VoiceService from '../services/api';
import { useAuth } from '../components/AuthContext';
import { UserStats, VoiceTask } from '../types';
import { MOCK_LEADERBOARD } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trophy, Activity, CheckCircle, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * @component Dashboard
 * @description The user dashboard, which displays stats, recent tasks, and a leaderboard preview.
 * @returns {JSX.Element} The rendered component.
 */
const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<VoiceTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
      return;
    }

    const fetchData = async () => {
      if (user) {
        try {
          // Fetch user specific stats
          const statsData = await VoiceService.getUserStats(user.id);
          setStats(statsData);

          // Fetch recent tasks available
          const tasksData = await VoiceService.getTasks(0, 3);
          setRecentTasks(tasksData);
        } catch (error) {
          console.error("Failed to fetch dashboard data", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user, isAdmin, navigate]);

  if (loading) return <div className="flex justify-center items-center h-64 text-primary">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}!</h2>
        <p className="text-gray-500 dark:text-gray-400">Here is your activity overview.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Edits</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_edits || 0}</h3>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Approved</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.approved_edits || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Score</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{(stats?.approved_edits || 0) * 10}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Last Active</p>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {stats?.last_activity ? new Date(stats.last_activity).toLocaleDateString() : 'Never'}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Voice Queue / Tasks */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Voice Queue</h3>
            <Link to="/task" className="text-sm text-primary dark:text-indigo-400 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No new tasks available.</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600 hover:border-primary transition-colors">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">Task #{task.id}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] font-arabic">{task.word}</p>
                  </div>
                  <Link 
                    to={`/task?id=${task.id}`} 
                    className="px-3 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Start
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            Top Editors
          </h3>
          <div className="space-y-2">
            {MOCK_LEADERBOARD.slice(0, 5).map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-200 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-gray-300'}`}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{entry.name}</span>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold text-primary dark:text-indigo-400">{entry.score} pts</span>
                  <span className="text-xs text-gray-400">{entry.edits} edits</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;