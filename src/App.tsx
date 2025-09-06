// frontend/src/App.tsx - ENHANCED VERSION
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/store';
import { theme } from './theme/theme'; // Updated theme import
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Dashboard from './pages/Dashboard';
import Subscription from './pages/Subscription';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const AuthSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token stored:', token);
      navigate('/dashboard');
    } else {
      console.error('No token received');
      navigate('/');
    }
  }, [location, navigate]);

  return <div>Processing authentication...</div>;
};

const AppContent: React.FC = () => {
  const { initialized } = useAuth();

  if (!initialized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: 600,
      }}>
        Loading EduStream...
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/auth/success" element={<AuthCallback />} />
          <Route path="/auth/error" element={<AuthError />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;