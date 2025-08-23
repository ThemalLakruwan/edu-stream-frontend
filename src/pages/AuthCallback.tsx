// frontend/src/pages/AuthCallback.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';
import { setToken, getCurrentUser } from '../store/slices/authSlice';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false); // guard against double-invoke in React StrictMode

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const errorParam = params.get('error');

        // Clean the URL (avoid leaving token in the browser history)
        try {
          const cleanUrl = `${window.location.pathname}`;
          window.history.replaceState(null, '', cleanUrl);
        } catch {
          /* no-op */
        }

        if (errorParam) {
          setError('Authentication failed. Please try again.');
          setTimeout(() => navigate('/', { replace: true }), 2500);
          return;
        }

        if (!token) {
          setError('No authentication token received. Please try again.');
          setTimeout(() => navigate('/', { replace: true }), 2500);
          return;
        }

        // Persist token immediately to avoid race conditions
        try {
          localStorage.setItem('token', token);
        } catch {
          /* Fallback to Redux-only if storage is blocked */
        }

        // Set token in Redux (keeps app state consistent)
        dispatch(setToken(token));

        // Fetch the current user before navigating to protected routes
        await dispatch(getCurrentUser()).unwrap();
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/', { replace: true }), 2500);
      }
    };

    handleCallback();
  }, [dispatch, location.search, navigate]);

  if (error) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="50vh" flexDirection="column">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography>Redirecting you back to home page...</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="50vh" flexDirection="column">
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Signing you in…</Typography>
    </Box>
  );
};

export default AuthCallback;
