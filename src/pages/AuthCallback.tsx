// frontend/src/pages/AuthCallback.tsx - FIXED VERSION
import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';
import { setToken, getCurrentUser } from '../store/slices/authSlice';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const errorParam = params.get('error');
        
        if (errorParam) {
          setError('Authentication failed. Please try again.');
          setTimeout(() => navigate('/', { replace: true }), 3000);
          return;
        }
        
        if (token) {
          console.log('Token received:', token.substring(0, 20) + '...');
          
          // Set token in Redux store and localStorage
          dispatch(setToken(token));
          
          // Get user data
          try {
            await dispatch(getCurrentUser()).unwrap();
            console.log('User data retrieved successfully');
            navigate('/dashboard', { replace: true });
          } catch (userError) {
            console.error('Failed to get user data:', userError);
            setError('Failed to retrieve user information. Please try signing in again.');
            setTimeout(() => navigate('/', { replace: true }), 3000);
          }
        } else {
          console.log('No token found in callback URL');
          setError('No authentication token received. Please try again.');
          setTimeout(() => navigate('/', { replace: true }), 3000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/', { replace: true }), 3000);
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