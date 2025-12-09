import React, { useState, useEffect } from 'react';
import VoiceService from '../services/api';
import { useAuth } from '../components/AuthContext';
import { UserEdit, AdminAnalytics } from '../types';
import { Users, ChevronRight, ArrowLeft, Search, CheckCircle, Activity, Flag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Type for the user summary from analytics
type AnalyticsUser = AdminAnalytics['users_performance'][0];

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  
  // Navigation State
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedUser, setSelectedUser] = useState<AnalyticsUser | null>(null);
  
  // Data State
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [userEdits, setUserEdits] = useState<UserEdit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Analytics on mount
  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (user) {
          const data = await VoiceService.getAdminAnalytics(user.id);
          setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to load analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (analyticsUser: AnalyticsUser) => {
    setSelectedUser(analyticsUser);
    setView('detail');
    setUserEdits([]); // Clear previous
    setLoading(true);
    try {
        const edits = await VoiceService.getUserEdits(analyticsUser.id);
        setUserEdits(edits);
    } catch (error) {
        console.error("Failed to load user edits", error);
    } finally {
        setLoading(false);
    }
  };

  const handleBack = () => {
    setView('list');
    setSelectedUser(null);
  };

  const filteredUsers = analytics?.users_performance.filter(u => 
    u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 animate-fade-in" dir={i18n.dir()}>
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-700 pb-5">
        <div className="flex items-center gap-4">
           {view === 'detail' && (
               <button onClick={handleBack} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                   <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300"/>
               </button>
           )}
           <div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                 {view === 'list' ? t('users_mgmt') : `${selectedUser?.first_name} ${selectedUser?.last_name}`}
             </h2>
             <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                 {view === 'list' ? t('admin_analytics') : `User ID: ${selectedUser?.id}`}
             </p>
           </div>
        </div>
      </div>

      {view === 'list' ? (
        <div className="space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-primary">
                            <Activity size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Total System Tasks</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.total_tasks_done || 0}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600">
                            <Users size={20} />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Active Users</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.users_performance.length || 0}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-shadow"
                />
            </div>

            {/* User List Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4 text-center">Tasks Done</th>
                            <th className="px-6 py-4 text-center">Corrections</th>
                            <th className="px-6 py-4 text-center">Flags</th>
                            <th className="px-6 py-4 text-center">Score</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
                        ) : (
                            filteredUsers.map((u) => (
                                <tr 
                                    key={u.id} 
                                    onClick={() => handleUserClick(u)}
                                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-primary font-bold text-xs">
                                                {u.first_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{u.first_name} {u.last_name}</p>
                                                <p className="text-xs text-gray-400">ID: {u.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium text-gray-700 dark:text-gray-300">
                                        {u.total_actions}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-500">
                                        {u.corrections}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-500">
                                        {u.flags > 0 ? <span className="text-red-500 font-bold">{u.flags}</span> : 0}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-primary dark:text-indigo-400">
                                        {u.total_actions * 10}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors inline-block" />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      ) : (
        <div className="space-y-6">
            {/* User Detail View */}
            
            {/* Top Cards for this User */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                     <p className="text-xs text-gray-500 uppercase">Tasks</p>
                     <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser?.total_actions}</p>
                 </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                     <p className="text-xs text-gray-500 uppercase">Corrections</p>
                     <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser?.corrections}</p>
                 </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                     <p className="text-xs text-gray-500 uppercase">Flags</p>
                     <p className="text-xl font-bold text-red-500">{selectedUser?.flags}</p>
                 </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                     <p className="text-xs text-gray-500 uppercase">Score</p>
                     <p className="text-xl font-bold text-primary dark:text-indigo-400">{(selectedUser?.total_actions || 0) * 10}</p>
                 </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
                    <h3 className="font-bold text-gray-900 dark:text-white">Detailed Task History</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="text-xs uppercase text-gray-500 bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-3">Task ID</th>
                            <th className="px-6 py-3 text-right">Submitted Text</th>
                            <th className="px-6 py-3">Flag</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                        {loading ? (
                             <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading history...</td></tr>
                        ) : userEdits.length === 0 ? (
                             <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No tasks history found for this user.</td></tr>
                        ) : (
                            userEdits.map((edit) => (
                                <tr key={edit.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-3 font-mono text-xs text-gray-500">#{edit.task_id}</td>
                                    <td className="px-6 py-3 text-right font-arabic text-gray-800 dark:text-gray-200" dir="rtl">
                                        {edit.word_after_edit}
                                    </td>
                                    <td className="px-6 py-3">
                                        {edit.selected_flag && edit.selected_flag !== 'NONE' ? (
                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold flex items-center w-fit gap-1"><Flag size={10}/> {edit.selected_flag}</span>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3">
                                        {edit.is_approved ? (
                                            <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle size={14}/> Approved</span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">Pending</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-right text-xs text-gray-400">
                                        {new Date(edit.created_at || Date.now()).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;