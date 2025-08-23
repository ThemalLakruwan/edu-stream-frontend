// frontend/src/services/api.ts - FIXED VERSION
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API - FIXED endpoints to match API gateway routing
export const authAPI = {
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
};

// Courses API
export const coursesAPI = {
  getCourses: (params?: any) => api.get('/api/courses', { params }),
  getCourseById: (id: string) => api.get(`/api/courses/${id}`),
  getCourseContent: (id: string) => api.get(`/api/courses/${id}/content`),
  getCategories: () => api.get('/api/courses/categories'),
};

// Subscription API
export const subscriptionAPI = {
  getPlans: () => api.get('/api/payments/subscriptions/plans'),
  getCurrentSubscription: () => api.get('/api/payments/subscriptions/current'),
  createSubscription: (data: any) => api.post('/api/payments/subscriptions/create', data),
  cancelSubscription: () => api.post('/api/payments/subscriptions/cancel'),
  resumeSubscription: () => api.post('/api/payments/subscriptions/resume'),
  changePlan: (planType: string) => api.post('/api/payments/subscriptions/change-plan', { planType }),
};

// Payment API
export const paymentAPI = {
  getPaymentHistory: (params?: any) => api.get('/api/payments/history', { params }),
};