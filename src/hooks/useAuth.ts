import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { getCurrentUser } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        if (token) {
          await dispatch(getCurrentUser()).unwrap().catch(() => {});
        }
      } finally {
        if (mounted) setInitialized(true);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [dispatch, token]);

  return { initialized };
};
