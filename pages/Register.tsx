import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VoiceService, { setApiUrl, getApiUrl, isMixedContentError } from '../services/api';
import { Settings, Wifi, WifiOff, AlertCircle, ShieldAlert } from 'lucide-react';

/**
 * @component Register
 * @description The registration page, which allows new users to create an account.
 * @returns {JSX.Element} The rendered component.
 */
const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [clientId, setClientId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Settings toggle
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(getApiUrl());
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  useEffect(() => {
    setTempUrl(getApiUrl());
  }, []);

  const handleSaveSettings = () => {
    setApiUrl(tempUrl);
  };

  const testConnection = async () => {
    setConnectionStatus('idle');
    const isAlive = await VoiceService.checkHealth();
    setConnectionStatus(isAlive ? 'success' : 'fail');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Sends JSON payload now
      await VoiceService.register({
        first_name: firstName,
        last_name: lastName,
        client_id: clientId,
        password: password
      });
      // Successful registration
      navigate('/login');
    } catch (err: any) {
      console.error("Registration Error:", err);
      setShowSettings(true); 
      
      if (!err.response) {
        if (isMixedContentError()) {
            setError(`Security Error: Connection blocked. You are using HTTPS but trying to reach an insecure HTTP server (${getApiUrl()}).`);
        } else {
            setError(`Network Error: Cannot reach ${getApiUrl()}. Check connection.`);
        }
      } else {
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
            setError(detail.map((e: any) => e.msg).join(', '));
        } else {
            setError(detail || 'Registration failed.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-indigo-500">
            Sign In here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Client ID (Username)</label>
              <input
                type="text"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="text-red-500 mt-1">
                    {error.includes("Security") ? <ShieldAlert size={20}/> : <AlertCircle size={20} />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-red-800">Registration Failed</h3>
                    <p className="text-xs text-red-700 mt-1 font-mono break-all">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Creating...' : 'Register'}
            </button>
          </form>

          {/* Connection Settings */}
          <div className="mt-8 pt-6 border-t border-gray-100">
             <button 
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-500 hover:text-gray-700 flex items-center justify-center w-full gap-1 text-xs"
             >
                <Settings size={14} /> 
                {showSettings ? 'Hide Connection Settings' : 'Connection Problems?'}
             </button>
             
             {showSettings && (
               <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200 animate-fade-in">
                 <label className="text-xs text-gray-500 block mb-1 font-bold">Backend API URL:</label>
                 <div className="flex gap-2">
                   <input 
                      value={tempUrl} 
                      onChange={(e) => setTempUrl(e.target.value)}
                      className="flex-1 text-xs p-2 border rounded"
                      placeholder="http://192.168.x.x:8000"
                   />
                   <button 
                      onClick={handleSaveSettings}
                      className="text-xs bg-gray-200 px-3 rounded hover:bg-gray-300 font-medium"
                   >
                     Save
                   </button>
                 </div>
                 
                 <div className="mt-2 flex items-center justify-between">
                    <button 
                      type="button"
                      onClick={testConnection}
                      className="text-xs text-primary underline flex items-center gap-1"
                    >
                      Test Connection
                    </button>
                    {connectionStatus === 'success' && <span className="text-xs text-green-600 flex items-center gap-1"><Wifi size={12}/> Connected!</span>}
                    {connectionStatus === 'fail' && <span className="text-xs text-red-600 flex items-center gap-1"><WifiOff size={12}/> Failed</span>}
                 </div>
                 {isMixedContentError() && (
                    <p className="text-[10px] text-red-500 mt-2">
                        ⚠️ Warning: You are on HTTPS but accessing an HTTP server. This is blocked by browsers.
                    </p>
                )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;