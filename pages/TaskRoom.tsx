import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import VoiceService from '../services/api';
import { useAuth } from '../components/AuthContext';
import { VoiceTask, VoiceFlag } from '../types';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, SkipForward, AlertCircle, X, CheckCircle, ArrowRight, RefreshCw, Upload, Flag, ThumbsUp, Pencil, Check, WifiOff } from 'lucide-react';
import confetti from 'canvas-confetti';

const DIACRITICS = {
  FATHA: '\u064E', // َ
  DAMMA: '\u064F', // ُ
  KASRA: '\u0650', // ِ
};

const isDiacritic = (char: string) => Object.values(DIACRITICS).includes(char);

interface CharData {
  id: string; 
  letter: string;
  diacritic: string | null;
  isSpace: boolean;
  originalIndex: number;
}

interface WordGroup {
  id: string;
  chars: CharData[];
}

const TaskRoom: React.FC = () => {
  const [searchParams] = useSearchParams();
  const taskIdParam = searchParams.get('id');
  const { t, i18n } = useTranslation();
  
  const { user } = useAuth();
  const [currentTask, setCurrentTask] = useState<VoiceTask | null>(null);
  
  const [taskStatus, setTaskStatus] = useState<'loading' | 'active' | 'no_tasks' | 'limit_reached' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [reviewMode, setReviewMode] = useState(false);
  
  // Custom Editor State
  const [chars, setChars] = useState<CharData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // UI State
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  // --- Parser Logic ---
  const parseTextToChars = (text: string): CharData[] => {
    const result: CharData[] = [];
    let currentId = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (isDiacritic(char)) {
        if (result.length > 0) result[result.length - 1].diacritic = char;
      } else {
        result.push({
          id: `char-${currentId++}`,
          letter: char,
          diacritic: null,
          isSpace: char === ' ',
          originalIndex: result.length
        });
      }
    }
    return result.map((c, idx) => ({ ...c, originalIndex: idx }));
  };

  const getWordGroups = (chars: CharData[]): WordGroup[] => {
    const groups: WordGroup[] = [];
    let currentWordChars: CharData[] = [];
    chars.forEach((char) => {
      if (char.isSpace) {
        if (currentWordChars.length > 0) {
          groups.push({ id: `word-${groups.length}`, chars: [...currentWordChars] });
          currentWordChars = [];
        }
        groups.push({ id: `space-${groups.length}`, chars: [char] });
      } else {
        currentWordChars.push(char);
      }
    });
    if (currentWordChars.length > 0) {
      groups.push({ id: `word-${groups.length}`, chars: [...currentWordChars] });
    }
    return groups;
  };

  const getFullText = () => chars.map(c => c.letter + (c.diacritic || '')).join('');

  // Save task to storage
  const persistTask = (task: VoiceTask) => {
      localStorage.setItem('vtg_active_task', JSON.stringify(task));
  };
  
  const clearPersistedTask = () => {
      localStorage.removeItem('vtg_active_task');
  };

  const loadTask = async (requestMore = false) => {
    if (!user) return;
    setTaskStatus('loading');
    setMessage(null);
    setIsSubmitted(false);
    setIsPlaying(false);
    setErrorMessage('');
    
    // Check for persisted task FIRST (unless we explicitly requested more)
    if (!requestMore) {
        const savedTaskStr = localStorage.getItem('vtg_active_task');
        if (savedTaskStr) {
            try {
                const savedTask = JSON.parse(savedTaskStr);
                // Validate if it has valid data
                if (savedTask && savedTask.id) {
                    setTaskStatus('active');
                    setCurrentTask(savedTask);
                    setReviewMode(savedTask.is_review_mode || false);
                    setChars(parseTextToChars(savedTask.word));
                    setSelectedIndex(0);
                    return; // EXIT EARLY, do not fetch
                }
            } catch (e) {
                console.error("Invalid saved task", e);
                clearPersistedTask();
            }
        }
    }

    // Fetch from API
    try {
      const response = await VoiceService.getNextTask(user.id, requestMore);
      
      if (response.status === 'no_tasks') {
          setTaskStatus('no_tasks');
          setCurrentTask(null);
          clearPersistedTask();
      } else if (response.status === 'limit_reached') {
          setTaskStatus('limit_reached');
          setCurrentTask(null);
          clearPersistedTask();
      } else if (response.task) {
          setTaskStatus('active');
          setCurrentTask(response.task);
          persistTask(response.task); // Save to storage
          
          const isReview = response.task.is_review_mode || false;
          setReviewMode(isReview);
          
          setChars(parseTextToChars(response.task.word));
          setSelectedIndex(0);
      }

    } catch (error: any) {
      console.error("Error loading task", error);
      setTaskStatus('error');
      setErrorMessage(error.message || 'Connection failed');
    }
  };

  useEffect(() => {
    // Only load if we haven't already loaded (to prevent double fetch in strict mode)
    // But since we have persistence check inside loadTask, it is safe to call.
    if (user) loadTask();
  }, [user]);

  // --- Editor Inputs ---
  const handleSelectChar = (index: number) => {
    if (chars[index].isSpace) return;
    setSelectedIndex(index);
    editorContainerRef.current?.focus();
  };

  const applyDiacritic = (diacritic: string | null) => {
    if (chars.length === 0 || chars[selectedIndex].isSpace) return;
    const newChars = [...chars];
    newChars[selectedIndex].diacritic = diacritic;
    setChars(newChars);
    
    setSelectedIndex(prev => {
        let next = prev + 1;
        while (next < chars.length && chars[next].isSpace) next++;
        return next < chars.length ? next : prev;
    });
    editorContainerRef.current?.focus();
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (chars.length === 0) return;
    const isRTL = i18n.dir() === 'rtl';
    const nextKey = isRTL ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = isRTL ? 'ArrowRight' : 'ArrowLeft';

    if (e.key === nextKey) {
      e.preventDefault();
      setSelectedIndex(prev => {
        let next = prev + 1;
        while (next < chars.length && chars[next].isSpace) next++;
        return next < chars.length ? next : prev;
      });
    } else if (e.key === prevKey) {
      e.preventDefault();
      setSelectedIndex(prev => {
        let next = prev - 1;
        while (next >= 0 && chars[next].isSpace) next--;
        return next >= 0 ? next : prev;
      });
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      applyDiacritic(null);
    } else if (['Enter', ' '].includes(e.key)) {
       e.preventDefault();
       togglePlay();
    }
  }, [chars, selectedIndex, i18n.language]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#22C55E', '#FBBF24', '#EF4444']
    });
  };

  const submitTask = async (flag: VoiceFlag, isConfirmation = false) => {
    if (!currentTask || !user) return;
    
    const finalText = getFullText();
    // If user clicked "Confirm Correct", we send the text as is.
    
    try {
        await VoiceService.submitEdit(user.id, currentTask.id, finalText, flag);
        setMessage({ type: 'success', text: t('saved') });
        setIsSubmitted(true);
        setShowReportModal(false);
        clearPersistedTask(); // Clear saved task on success
        triggerConfetti(); 
        
        // Auto Advance
        setTimeout(() => {
          // Pass true to bypass persistence check and fetch NEW task
          loadTask(true); 
        }, 1500);

    } catch (error) {
        setMessage({ type: 'error', text: 'Failed to submit.' });
    }
  };

  const handleNextTask = () => {
      clearPersistedTask(); // Clear current so we fetch next
      loadTask(true);
  };

  if (taskStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
      </div>
    );
  }

  if (taskStatus === 'error') {
      return (
        <div className="flex flex-col items-center justify-center mt-20 text-center dark:text-gray-200">
           <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-xl border border-red-100 dark:border-red-900/30 max-w-md">
               <WifiOff size={40} className="mx-auto text-red-500 mb-4" />
               <h3 className="text-xl font-bold mb-2 text-red-600 dark:text-red-400">Connection Error</h3>
               <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">{errorMessage}</p>
               <button onClick={() => loadTask(true)} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Retry
               </button>
           </div>
        </div>
      );
  }

  if (taskStatus === 'limit_reached') {
      return (
        <div className="flex flex-col items-center justify-center mt-20 text-center dark:text-gray-200">
           <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 max-w-md">
               <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <CheckCircle size={32} />
               </div>
               <h3 className="text-xl font-bold mb-2">{t('limit_reached')}</h3>
               <p className="text-gray-500 mb-6">{t('limit_msg')}</p>
               <button 
                  onClick={() => loadTask(true)}
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
               >
                  {t('request_more')}
               </button>
           </div>
        </div>
      );
  }

  if (taskStatus === 'no_tasks' || !currentTask) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 text-center dark:text-gray-200">
        <h3 className="text-xl font-medium mb-2">{t('no_tasks')}</h3>
        <p className="text-sm text-gray-400 mb-6 max-w-xs">There are no new voice tasks available in the queue right now.</p>
        <div className="flex gap-3">
          <button onClick={() => loadTask(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 transition-colors">
            <RefreshCw size={16}/> {t('check_again')}
          </button>
        </div>
      </div>
    );
  }

  const audioSrc = currentTask.voice_url || currentTask.voice_name;
  const wordGroups = getWordGroups(chars);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header Info */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
           <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="bg-indigo-100 dark:bg-indigo-900 text-primary dark:text-indigo-300 px-2 py-1 rounded text-xs">#{currentTask.id}</span>
              {reviewMode ? <span className="text-orange-500 flex items-center gap-1 text-sm"><AlertCircle size={14}/> {t('review_mode')}</span> : t('voice_task')}
           </h2>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowReportModal(true)}
                className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
            >
                <Flag size={14} /> {t('report_issue')}
            </button>
            <button 
            onClick={handleNextTask}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors font-medium"
            >
            {t('skip')} <SkipForward size={16} />
            </button>
        </div>
      </div>

      {reviewMode && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 rounded-lg flex items-center gap-2 text-orange-800 dark:text-orange-200 text-sm">
              <AlertCircle size={18} />
              {t('review_instruction')}
          </div>
      )}

      {message && (
        <div className={`p-4 rounded-lg flex items-center justify-between gap-2 animate-fade-in ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-900' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20} />}
            {message.text}
          </div>
          {isSubmitted && (
             <span className="text-sm font-bold text-green-700 dark:text-green-300">
               Auto-loading next...
             </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Audio Player */}
        <div className="lg:col-span-4 space-y-4">
           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-900 dark:to-purple-900 rounded-3xl p-6 text-white shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[200px]">
              <div className="mb-4 text-indigo-100 text-sm font-medium tracking-wide uppercase">{t('listen_carefully')}</div>
              <div className="relative mb-6 group">
                <div className={`absolute inset-0 bg-white/20 rounded-full blur-xl ${isPlaying ? 'animate-pulse' : ''}`}></div>
                <button 
                  onClick={togglePlay}
                  className="relative w-20 h-20 bg-white text-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg z-10"
                >
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
              </div>
              <div className="flex gap-4">
                 <button 
                    onClick={() => { if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); setIsPlaying(true); } }}
                    className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                  >
                   <RotateCcw size={14} /> {t('replay')}
                 </button>
              </div>
              <audio ref={audioRef} src={audioSrc} onEnded={() => setIsPlaying(false)} onError={(e) => console.log("Audio load error", e)}/>
           </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col h-full min-h-[500px]">
                <div className="bg-gray-50/80 dark:bg-slate-700/50 px-6 py-3 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center backdrop-blur-sm">
                   <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                   </div>
                   <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider">{t('text_editor')}</span>
                </div>

                <div 
                  className="flex-1 p-8 bg-white dark:bg-slate-800 outline-none overflow-y-auto"
                  tabIndex={0}
                  ref={editorContainerRef}
                  onKeyDown={handleKeyDown}
                  dir="rtl" // Editor always RTL for Persian
                >
                    <div className="text-center">
                       {/* 
                          UPDATED EDITOR STYLE FOR CONNECTED LETTERS:
                          1. We use a simple <div> container with rtl direction.
                          2. We map characters as `inline` spans.
                          3. We do NOT use flexbox wrapping around individual words, 
                             we allow natural text flow to preserve ligatures where possible.
                          4. WordGroups logic is used just to inject spaces correctly.
                        */}
                       <div className="text-5xl font-arabic leading-[5rem] text-gray-800 dark:text-gray-200 tracking-normal" style={{ fontVariantLigatures: 'normal' }}>
                          {wordGroups.map((group, groupIndex) => (
                             <React.Fragment key={group.id}>
                                {group.chars.map((char) => {
                                  if (char.isSpace) return <span key={char.id} className="inline w-4"> </span>;
                                  const isActive = char.originalIndex === selectedIndex;
                                  return (
                                    <span 
                                       key={char.id}
                                       onClick={() => handleSelectChar(char.originalIndex)}
                                       className={`inline cursor-pointer select-none transition-colors duration-150 ${
                                           isActive 
                                           ? 'text-primary dark:text-indigo-400 font-bold' 
                                           : 'text-gray-800 dark:text-gray-200'
                                       }`}
                                    >
                                       {char.letter}{char.diacritic}
                                    </span>
                                  );
                                })}
                                {/* Add a zero-width space or regular space if needed, 
                                    but WordGroup logic handles spaces via `char.isSpace`. 
                                    Just rendering sequential spans here. */}
                             </React.Fragment>
                          ))}
                       </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-900 p-6 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                           <button onClick={() => applyDiacritic(null)} className="flex flex-col items-center justify-center w-16 h-16 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-500 rounded-2xl transition-all border-2 border-transparent hover:border-red-200">
                                <X size={24} /><span className="text-[10px] font-bold mt-1 uppercase opacity-70">{t('clear')}</span>
                            </button>
                            <div className="w-px h-12 bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                            {/* Diacritic Buttons */}
                            {[DIACRITICS.DAMMA, DIACRITICS.KASRA, DIACRITICS.FATHA].map((d, i) => (
                                <button key={i} onClick={() => applyDiacritic(d)} className="flex flex-col items-center justify-center w-16 h-16 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-2xl shadow-sm border-2 border-gray-200 dark:border-slate-600 hover:border-primary transition-all">
                                    <span className="text-3xl font-bold mb-1">{d}</span>
                                </button>
                            ))}
                        </div>

                        {/* Submit Actions */}
                        <div className="w-full sm:w-auto flex gap-3">
                            {!isSubmitted ? (
                                reviewMode ? (
                                    <>
                                        {/* Review Mode Buttons */}
                                        <button onClick={() => submitTask(VoiceFlag.NONE, true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg text-sm">
                                            <Check size={18} /> تایید صحت
                                        </button>
                                        <button onClick={() => submitTask(VoiceFlag.NONE, false)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg text-sm">
                                            <Pencil size={18} /> ثبت ویرایش
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => submitTask(VoiceFlag.NONE)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-success hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all text-sm sm:text-base">
                                        <CheckCircle size={20} /> <span>{t('submit')}</span>
                                    </button>
                                )
                            ) : (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-6 py-4 rounded-xl">
                                    <CheckCircle size={20}/> {t('saved')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in" dir={i18n.dir()}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('report_issue')}</h3>
                <div className="space-y-2">
                    <button onClick={() => submitTask(VoiceFlag.DISTORTED)} className="w-full p-3 text-start border rounded hover:bg-red-50 hover:border-red-200 dark:border-slate-600 dark:hover:bg-red-900/20">
                        <span className="font-bold text-red-500 block text-sm">{t('distorted')}</span>
                    </button>
                    <button onClick={() => submitTask(VoiceFlag.MUSIC)} className="w-full p-3 text-start border rounded hover:bg-yellow-50 hover:border-yellow-200 dark:border-slate-600 dark:hover:bg-yellow-900/20">
                        <span className="font-bold text-yellow-600 block text-sm">{t('music')}</span>
                    </button>
                    <button onClick={() => submitTask(VoiceFlag.MULTISPEAKER)} className="w-full p-3 text-start border rounded hover:bg-orange-50 hover:border-orange-200 dark:border-slate-600 dark:hover:bg-orange-900/20">
                        <span className="font-bold text-orange-600 block text-sm">{t('multispeaker')}</span>
                    </button>
                </div>
                <button onClick={() => setShowReportModal(false)} className="mt-4 w-full py-2 text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default TaskRoom;