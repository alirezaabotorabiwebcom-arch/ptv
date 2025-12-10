import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import VoiceService, { setApiUrl, getApiUrl, isMixedContentError } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Mic, Settings, Wifi, WifiOff, AlertCircle, ShieldAlert, Globe } from 'lucide-react';

/**
 * Login component for user and admin authentication.
 * @returns {JSX.Element} The login component.
 */
const Login: React.FC = () => {
  const [clientId, setClientId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Toggle for Admin vs User
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrl, setServerUrl] = useState(getApiUrl());
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  const { login, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (user) {
      if (isAdmin) navigate('/admin');
      else navigate('/task');
    }
  }, [user, isAdmin, navigate]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fa' : 'en';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'fa' ? 'rtl' : 'ltr';
  };

  const handleServerSave = () => setApiUrl(serverUrl);

  const checkConnection = async () => {
    setConnectionStatus('unknown');
    const isAlive = await VoiceService.checkHealth();
    setConnectionStatus(isAlive ? 'connected' : 'error');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const authFn = isAdminLogin ? VoiceService.loginAdmin : VoiceService.loginUser;
      
      const response = await authFn({
        client_id: clientId,
        password: password
      });
      
      // Use standard user_id or fallback to legacy/admin fields
      const userId = response.user_id || response.admin_id || response["user Id"];
      
      if (!userId) throw new Error("Missing User ID in response");

      login(userId, response.name, clientId, response.role);
      
      if (response.role === 'ADMIN') navigate('/admin');
      else navigate('/task');
      
    } catch (err: any) {
      console.error(err);
      setShowServerConfig(true); 
      const status = err.response?.status;
      if (status === 404 || status === 400 || status === 403) {
         setError(err.response?.data?.detail || 'Invalid credentials.');
      } else {
         setError('Login failed. Check connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" dir={i18n.dir()}>
      <div className="absolute top-4 right-4">
        <button onClick={toggleLanguage} className="p-2 bg-white rounded-full shadow text-gray-500 hover:text-primary">
            <Globe size={20} />
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Mic className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('login_title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
           {t('dont_have_account')}{' '}
          <Link to="/register" className="font-medium text-primary hover:text-indigo-500">
            {t('register')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <div className="flex justify-center mb-6 bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setIsAdminLogin(false)}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${!isAdminLogin ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
              >
                  {t('user_login')}
              </button>
              <button 
                onClick={() => setIsAdminLogin(true)}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${isAdminLogin ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
              >
                  {t('admin_login')}
              </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('client_id')}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="text-red-500 mt-1"><AlertCircle size={20} /></div>
                  <div className="flex-1">
                    <p className="text-xs text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? t('loading') : t('signin')}
              </button>
            </div>
          </form>

          {/* Connection Settings */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button 
              onClick={() => setShowServerConfig(!showServerConfig)}
              className="flex items-center text-xs text-gray-500 hover:text-gray-700 gap-1 mx-auto"
            >
              <Settings size={14} /> {t('server_config')}
            </button>
            
            {showServerConfig && (
              <div className="mt-3 bg-gray-50 p-3 rounded-md animate-fade-in">
                <label className="block text-xs font-medium text-gray-700 mb-1">API Base URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={serverUrl} 
                    onChange={(e) => setServerUrl(e.target.value)}
                    className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 ltr"
                    dir="ltr"
                  />
                  <button onClick={handleServerSave} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">Save</button>
                  <button onClick={checkConnection}>
                     {connectionStatus === 'connected' && <Wifi size={14} className="text-green-500"/>}
                     {connectionStatus === 'error' && <WifiOff size={14} className="text-red-500"/>}
                     {connectionStatus === 'unknown' && <div className="w-3 h-3 bg-gray-300 rounded-full"/>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;