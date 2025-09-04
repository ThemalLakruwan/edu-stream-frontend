import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import coursesSlice from './slices/coursesSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import adminSlice from './slices/adminSlice';
import enrollmentSlice from './slices/enrollmentSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    courses: coursesSlice,
    subscription: subscriptionSlice,
    admin: adminSlice,            // <-- add
    enrollments: enrollmentSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;