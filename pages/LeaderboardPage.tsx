import React, { useEffect, useState } from 'react';
import VoiceService from '../services/api';
import { useAuth } from '../components/AuthContext';
import { Trophy, Medal, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LeaderboardEntry {
  id: number;
  name: string;
  score: number;
  edits?: number;
}

/**
 * @component LeaderboardPage
 * @description The leaderboard page, which displays a ranked list of users by score.
 * @returns {JSX.Element} The rendered component.
 */
const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
        VoiceService.getLeaderboard(user.id)
            .then(data => {
                // Backend returns { leaderboard: [...], my_stats: {...} }
                if (data && data.leaderboard && Array.isArray(data.leaderboard)) {
                    setLeaders(data.leaderboard);
                } else if (Array.isArray(data)) {
                    // Fallback for direct array
                    setLeaders(data);
                } else {
                    setLeaders([]);
                }
            })
            .catch(err => {
                console.error("Leaderboard error", err);
                setError("Failed to load leaderboard.");
            })
            .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className="text-center py-10">{t('loading')}</div>;

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('leaderboard')}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Top contributors adding voice to text.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded text-center mb-4">
            {error}
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        {leaders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                No data available yet.
            </div>
        ) : (
            leaders.map((user, index) => (
            <div 
                key={user.id || index} 
                className={`flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${index < 3 ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
            >
                <div className="flex items-center gap-6">
                <div className="flex-shrink-0 w-12 text-center">
                    {index === 0 ? (
                    <Medal className="w-8 h-8 text-yellow-500 mx-auto" />
                    ) : index === 1 ? (
                    <Medal className="w-8 h-8 text-gray-400 mx-auto" />
                    ) : index === 2 ? (
                    <Medal className="w-8 h-8 text-orange-400 mx-auto" />
                    ) : (
                    <span className="text-xl font-bold text-gray-400">#{index + 1}</span>
                    )}
                </div>
                
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-indigo-400'}`}>
                    {user.name ? user.name.charAt(0) : '?'}
                    </div>
                    <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</h3>
                    {user.edits !== undefined && <p className="text-sm text-gray-500 dark:text-gray-400">{user.edits} corrections</p>}
                    </div>
                </div>
                </div>

                <div className="text-right">
                <div className="text-2xl font-black text-primary dark:text-indigo-400">{user.score}</div>
                <div className="text-xs uppercase tracking-wider text-gray-400 font-bold">Points</div>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;