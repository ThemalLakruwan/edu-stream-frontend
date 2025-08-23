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

// Auth API
export const authAPI = {
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Courses API
export const coursesAPI = {
  getCourses: (params?: any) => api.get('/courses', { params }),
  getCourseById: (id: string) => api.get(`/courses/${id}`),
  getCourseContent: (id: string) => api.get(`/courses/${id}/content`),
  getCategories: () => api.get('/categories'),
};

// Subscription API
export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrentSubscription: () => api.get('/subscriptions/current'),
  createSubscription: (data: any) => api.post('/subscriptions/create', data),
  cancelSubscription: () => api.post('/subscriptions/cancel'),
  resumeSubscription: () => api.post('/subscriptions/resume'),
  changePlan: (planType: string) => api.post('/subscriptions/change-plan', { planType }),
};

// Payment API
export const paymentAPI = {
  getPaymentHistory: (params?: any) => api.get('/payments/history', { params }),
};