import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ThemeProvider } from './components/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import TaskRoom from './pages/TaskRoom';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import LeaderboardPage from './pages/LeaderboardPage';

/**
 * @component ProtectedRoute
 * @description A route guard that redirects unauthenticated users to the login page.
 * @param {{ children: React.ReactNode }} props The component's props.
 * @returns {JSX.Element} The rendered component, or a redirect to the login page.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

/**
 * @component AppRoutes
 * @description The main routing component for the application.
 * @returns {JSX.Element} The rendered component.
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signin" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/task" replace />} />
        <Route path="task" element={<TaskRoom />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="history" element={<Profile />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * @component App
 * @description The root component of the application.
 * @returns {JSX.Element} The rendered component.
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;