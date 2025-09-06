// frontend/src/pages/AuthError.tsx - ENHANCED VERSION
import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  Container,
  Stack,
  Fade
} from '@mui/material';
import { Google as GoogleIcon, Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AuthError: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleRetry = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

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
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 4,
                p: 4,
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                border: '1px solid #fecaca',
                '& .MuiAlert-icon': {
                  fontSize: '2rem'
                }
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Authentication Failed
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                We encountered an error while trying to sign you in with Google. 
                This could be due to a temporary issue or if you denied access to your Google account.
              </Typography>
            </Alert>
            
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
              <Button 
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleRetry}
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Try Again with Google
              </Button>
              <Button 
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/', { replace: true })}
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Go Home
              </Button>
            </Stack>

            <Typography 
              variant="body2" 
              sx={{ 
                mt: 3,
                color: '#64748b',
                fontStyle: 'italic'
              }}
            >
              Need help? Contact our support team for assistance.
            </Typography>
          </Box>
        </Fade>
      </Box>
    </Container>
  );
};

export default AuthError;