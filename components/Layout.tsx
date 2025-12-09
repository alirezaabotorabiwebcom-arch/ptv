import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import VoiceService from '../services/api';
import { useTranslation } from 'react-i18next';
import { UserStats } from '../types';
import { 
  Mic, 
  History, 
  Shield, 
  LogOut, 
  Trophy,
  Moon,
  Sun,
  Keyboard,
  Globe
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);

  // Fetch stats and update when location changes (e.g. after a task is done)
  useEffect(() => {
    if (user && !user.is_admin) {
        VoiceService.getUserStats(user.id)
            .then(setStats)
            .catch(err => console.error("Failed to load stats for layout", err));
    }
  }, [user, location.pathname]); // Re-fetch on route change to update progress bar

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fa' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Progress Bar Calculations
  const radius = 20; // Slightly larger for better visibility
  const circumference = 2 * Math.PI * radius;
  const dailyLimit = stats?.daily_limit || 50;
  const todayCount = stats?.today_edits || 0;
  // Cap percent at 100
  const percent = Math.min((todayCount / dailyLimit) * 100, 100);
  const offset = circumference - (percent / 100) * circumference;
  
  // Color logic for the progress ring
  const isCapped = todayCount >= dailyLimit;
  const progressColor = isCapped ? '#10B981' : '#4F46E5'; // Green if done, Indigo if in progress

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden transition-colors" dir={i18n.language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 hidden md:flex flex-col transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-primary dark:text-indigo-400 flex items-center gap-2">
            <Mic className="w-8 h-8" />
            {t('app_name')}
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Crowdsource v2.0</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            
            {!user.is_admin && (
              <>
                <li>
                  <NavLink 
                    to="/task" 
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-indigo-50 dark:bg-slate-700 text-primary dark:text-indigo-300' 
                          : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Mic size={20} />
                    {t('voice_task')}
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/history" 
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-indigo-50 dark:bg-slate-700 text-primary dark:text-indigo-300' 
                          : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <History size={20} />
                    {t('my_history')}
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/leaderboard" 
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-indigo-50 dark:bg-slate-700 text-primary dark:text-indigo-300' 
                          : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Trophy size={20} />
                    {t('leaderboard')}
                  </NavLink>
                </li>
              </>
            )}

            {user.is_admin && (
              <>
                <li className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 mt-2">
                  Admin Controls
                </li>
                <li>
                  <NavLink 
                    to="/admin" 
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-indigo-50 dark:bg-slate-700 text-primary dark:text-indigo-300' 
                          : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Shield size={20} />
                    {t('users_mgmt')}
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
             <button
               onClick={toggleTheme}
               className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
               title={t('dark_mode')}
             >
               {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
             </button>
             
             <button
               onClick={toggleLanguage}
               className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 font-bold text-xs"
               title="Change Language"
             >
               <Globe size={18} /> {i18n.language.toUpperCase()}
             </button>

             <button
               onClick={() => setShowShortcuts(true)}
               className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
               title={t('shortcuts')}
             >
               <Keyboard size={18} />
             </button>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 p-2.5 rounded-xl border border-gray-100 dark:border-slate-700">
            {/* Avatar with Circular Progress for Daily Limit */}
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90 text-gray-200 dark:text-slate-600" viewBox="0 0 44 44">
                    <circle 
                        cx="22" cy="22" r={radius} 
                        fill="none" stroke="currentColor" strokeWidth="3"
                    />
                    <circle 
                        cx="22" cy="22" r={radius} 
                        fill="none" stroke={progressColor} strokeWidth="3"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-primary dark:text-indigo-200 font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
            </div>

            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <span className="opacity-80">ID: {user.id}</span>
                  {!user.is_admin && (
                      <span className={`font-mono font-bold ${isCapped ? 'text-green-600' : 'text-primary'}`}>
                          {todayCount}/{dailyLimit}
                      </span>
                  )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-900 transition-colors">
        <div className="md:hidden h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4">
           <span className="font-bold text-primary dark:text-indigo-400">{t('app_name')}</span>
           <div className="flex items-center gap-2">
             <button onClick={toggleLanguage} className="text-gray-500 dark:text-slate-400"><Globe size={20}/></button>
             <button onClick={handleLogout} className="text-gray-500 dark:text-slate-400"><LogOut size={20}/></button>
           </div>
        </div>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;