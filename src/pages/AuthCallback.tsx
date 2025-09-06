// frontend/src/pages/AuthCallback.tsx - ENHANCED VERSION
import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Alert,
  Fade,
  Container
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';
import { setToken, getCurrentUser } from '../store/slices/authSlice';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Connecting to Google...');
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const handleCallback = async () => {
      try {
        setStatus('Processing authentication...');
        
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const errorParam = params.get('error');

        // Clean the URL
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

        setStatus('Securing your session...');

        try {
          localStorage.setItem('token', token);
        } catch {
          /* Fallback to Redux-only if storage is blocked */
        }

        dispatch(setToken(token));

        setStatus('Loading your profile...');
        await dispatch(getCurrentUser()).unwrap();
        
        setStatus('Welcome aboard! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1000);
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
      <Container maxWidth="sm">
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="70vh" 
          flexDirection="column"
        >
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'center' }}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 4,
                  p: 3,
                  '& .MuiAlert-message': {
                    fontSize: '1.1rem'
                  }
                }}
              >
                {error}
              </Alert>
              <Typography variant="body1" sx={{ color: '#64748b' }}>
                Redirecting you back to home page...
              </Typography>
            </Box>
          </Fade>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="70vh" 
        flexDirection="column"
      >
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  opacity: 0.3,
                  animation: 'pulse 2s infinite',
                },
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)', opacity: 0.3 },
                  '50%': { transform: 'scale(1.2)', opacity: 0.1 },
                  '100%': { transform: 'scale(1)', opacity: 0.3 },
                },
              }}
            >
              <CircularProgress 
                sx={{ 
                  color: 'white',
                  position: 'relative',
                  zIndex: 1,
                }} 
              />
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: '#0f172a',
                mb: 2,
              }}
            >
              {status}
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Please wait while we prepare your learning experience
            </Typography>
          </Box>
        </Fade>
      </Box>
    </Container>
  );
};

export default AuthCallback;