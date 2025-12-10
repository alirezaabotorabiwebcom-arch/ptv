import React, { useEffect, useState } from 'react';
import VoiceService from '../services/api';
import { useAuth } from '../components/AuthContext';
import { UserEdit, VoiceFlag } from '../types';
import { CheckCircle, Clock, Download, AlertTriangle, Music, Users } from 'lucide-react';

/**
 * @component Profile
 * @description The user profile page, which displays the user's information and edit history.
 * @returns {JSX.Element | null} The rendered component, or null if no user is authenticated.
 */
const Profile: React.FC = () => {
  const { user } = useAuth();
  const [edits, setEdits] = useState<UserEdit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      VoiceService.getUserEdits(user.id)
        .then(setEdits)
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleDownloadTxt = (word: string, id: number) => {
     const element = document.createElement("a");
     const file = new Blob([word], {type: 'text/plain;charset=utf-8'});
     element.href = URL.createObjectURL(file);
     element.download = `edit_${id}.txt`;
     document.body.appendChild(element);
     element.click();
     document.body.removeChild(element);
  };

  const renderFlagBadge = (flag?: VoiceFlag) => {
    if (!flag || flag === VoiceFlag.NONE) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-bold uppercase">NONE</span>;
    }
    if (flag === VoiceFlag.DISTORTED) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold uppercase"><AlertTriangle size={12}/> Distorted</span>;
    }
    if (flag === VoiceFlag.MUSIC) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold uppercase"><Music size={12}/> Music</span>;
    }
    if (flag === VoiceFlag.MULTISPEAKER) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold uppercase"><Users size={12}/> Multi-Speaker</span>;
    }
    return <span className="text-xs bg-gray-100 px-2 py-1 rounded">{flag}</span>;
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      
      {/* Identity Card */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-2xl font-bold text-primary dark:text-indigo-200">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Client ID: {user.id}</p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden border border-gray-100 dark:border-slate-700">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Edit History
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            A list of all your submitted voice transcriptions.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/30">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Task ID
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Content (Your Edit)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Report Flag
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Loading history...</td>
                </tr>
              ) : edits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No edits found. Start playing!</td>
                </tr>
              ) : (
                edits.map((edit) => (
                  <tr key={edit.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                      #{edit.task_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right font-arabic" dir="rtl">
                      {edit.word_after_edit || <span className="text-gray-300 italic">Empty</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       {renderFlagBadge(edit.selected_flag)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {edit.is_approved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                          <CheckCircle size={12} className="mr-1" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                          <Clock size={12} className="mr-1" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-2">
                       <button 
                         onClick={() => handleDownloadTxt(edit.word_after_edit, edit.task_id)}
                         className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-indigo-300" 
                         title="Download TXT"
                       >
                         <Download size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Profile;