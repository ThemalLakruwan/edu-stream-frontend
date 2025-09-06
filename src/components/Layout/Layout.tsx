// frontend/src/components/Layout/Layout.tsx - ENHANCED VERSION WITH LOGO
import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  Avatar, 
  Menu, 
  MenuItem,
  IconButton,
  useScrollTrigger,
  Slide
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';

interface LayoutProps {
  children: React.ReactNode;
}

function HideOnScroll(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <HideOnScroll>
        <AppBar position="fixed" elevation={0}>
          <Container maxWidth="lg">
            <Toolbar sx={{ px: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    padding: '4px', // Add padding for the logo
                  }}
                >
                  <img
                    src="/logo.png" // Path to your logo in the public folder
                    alt="EduStream Logo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain', // Ensures the logo maintains aspect ratio
                      borderRadius: '50%', // Makes the image circular if needed
                    }}
                    onError={(e) => {
                      // Fallback to text if logo fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>E</Typography>';
                    }}
                  />
                </Box>
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  EduStream
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button 
                  color="inherit" 
                  href="/"
                  sx={{ 
                    borderRadius: '50px',
                    px: 3,
                    '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.1)' }
                  }}
                >
                  Home
                </Button>
                <Button 
                  color="inherit" 
                  href="/courses"
                  sx={{ 
                    borderRadius: '50px',
                    px: 3,
                    '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.1)' }
                  }}
                >
                  Courses
                </Button>
                
                {isAuthenticated ? (
                  <>
                    <Button 
                      color="inherit" 
                      href="/dashboard"
                      sx={{ 
                        borderRadius: '50px',
                        px: 3,
                        '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.1)' }
                      }}
                    >
                      {user?.role === 'admin' ? 'Dashboard' : 'My Courses'}
                    </Button>
                    <Button 
                      color="inherit" 
                      href="/subscription"
                      sx={{ 
                        borderRadius: '50px',
                        px: 3,
                        '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.1)' }
                      }}
                    >
                      Subscription
                    </Button>
                    <Avatar
                      src={user?.avatar}
                      alt={user?.name}
                      sx={{ 
                        ml: 2, 
                        cursor: 'pointer',
                        width: 36,
                        height: 36,
                        border: '2px solid #e2e8f0',
                        '&:hover': { borderColor: '#2563eb' }
                      }}
                      onClick={handleMenuClick}
                    >
                      {user?.name?.[0]}
                    </Avatar>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      PaperProps={{
                        sx: { borderRadius: 0.5, mt: 1.5 }
                      }}
                    >
                      <MenuItem onClick={handleMenuClose} sx={{ borderRadius: 2, mx: 1 }}>
                        Profile
                      </MenuItem>
                      <MenuItem onClick={handleLogout} sx={{ borderRadius: 2, mx: 1 }}>
                        Logout
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button 
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleLogin}
                    sx={{
                      borderRadius: '50px',
                      px: 4,
                      py: 1.5,
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Sign in with Google
                  </Button>
                )}
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>
      
      <Box sx={{ pt: { xs: 8, sm: 10 } }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;