// frontend/src/services/api.ts - FIXED VERSION
import axios from 'axios';

// FIXED: Use nginx proxy URL instead of direct service URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';

    if (status === 401) {
      // Only act if it’s a protected API (me, courses, payments, etc.)
      const isAuthMe = url.includes('/api/auth/me');
      const isProtected = /\/api\/(auth|courses|payments)/.test(url);

      if (isAuthMe || isProtected) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/') {
          window.location.replace('/');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API - FIXED endpoints to match API gateway routing
export const authAPI = {
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
};

// Courses API - FIXED endpoints
export const coursesAPI = {
  getCourses: (params?: any) => api.get('/api/courses', { params }),
  getCourseById: (id: string) => api.get(`/api/courses/${id}`),
  getCourseContent: (id: string) => api.get(`/api/courses/${id}/content`),
  getCategories: () => api.get('/api/categories'), // FIXED: correct endpoint
};

// Subscription API
export const subscriptionAPI = {
  getPlans: () => api.get('/api/subscriptions/plans'),
  getCurrentSubscription: () => api.get('/api/subscriptions/current'),
  createSubscription: (data: any) => api.post('/api/subscriptions/create', data),
  cancelSubscription: () => api.post('/api/subscriptions/cancel'),
  resumeSubscription: () => api.post('/api/subscriptions/resume'),
  changePlan: (planType: string) => api.post('/api/subscriptions/change-plan', { planType }),
};

// Payment API
export const paymentAPI = {
  getPaymentHistory: (params?: any) => api.get('/api/payments/history', { params }),
};

export default api;