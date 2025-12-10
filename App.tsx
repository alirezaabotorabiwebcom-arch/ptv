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
 * A component that wraps protected routes, redirecting to the login page if the user is not authenticated.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render.
 * @returns {JSX.Element} The protected route component.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

/**
 * Defines the application's routes.
 * @returns {JSX.Element} The application routes.
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
 * The main application component.
 * @returns {JSX.Element} The main application component.
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