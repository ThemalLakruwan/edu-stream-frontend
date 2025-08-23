import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';
import { setToken, getCurrentUser } from '../store/slices/authSlice';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      dispatch(setToken(token));
      dispatch(getCurrentUser())
        .unwrap()
        .finally(() => navigate('/dashboard', { replace: true }));
    } else {
      // fallback: go home if no token present
      navigate('/', { replace: true });
    }
  }, [dispatch, location.search, navigate]);

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="50vh" flexDirection="column">
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Signing you in…</Typography>
    </Box>
  );
};

export default AuthCallback;
