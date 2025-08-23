// frontend/src/components/Auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAppSelector((s) => s.auth);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const location = useLocation();

  if (loading) return <div />;

  if (!isAuthenticated && !token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
