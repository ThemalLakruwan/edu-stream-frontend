import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar, Menu, MenuItem } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';

interface LayoutProps {
  children: React.ReactNode;
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
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EduStream
          </Typography>
          
          <Button color="inherit" href="/">
            Home
          </Button>
          <Button color="inherit" href="/courses">
            Courses
          </Button>
          
          {isAuthenticated ? (
            <>
              <Button color="inherit" href="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" href="/subscription">
                Subscription
              </Button>
              <Avatar
                src={user?.avatar}
                alt={user?.name}
                sx={{ ml: 2, cursor: 'pointer' }}
                onClick={handleMenuClick}
              >
                {user?.name?.[0]}
              </Avatar>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={handleGoogleLogin}>
              Sign In with Google
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;