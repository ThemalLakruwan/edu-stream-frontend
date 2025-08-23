// frontend/src/pages/AuthError.tsx
import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AuthError: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="50vh" flexDirection="column">
      <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
        <Typography variant="h6" gutterBottom>
          Authentication Failed
        </Typography>
        <Typography variant="body2">
          We encountered an error while trying to sign you in with Google. 
          This could be due to a temporary issue or if you denied access to your Google account.
        </Typography>
      </Alert>
      
      <Box display="flex" gap={2}>
        <Button 
          variant="contained" 
          onClick={() => navigate('/', { replace: true })}
        >
          Go Home
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`}
        >
          Try Again
        </Button>
      </Box>
    </Box>
  );
};

export default AuthError;