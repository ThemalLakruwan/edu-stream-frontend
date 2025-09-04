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

export const adminAPI = {
  listAdmins: (params?: any) => api.get('/api/auth/admins', { params }),
  grantAdmin: (email: string) => api.post('/api/auth/admins/grant', { email }),
  revokeAdmin: (userId: string) => api.post('/api/auth/admins/revoke', { userId }),
  listUsers: (params?: any) => api.get('/api/auth/users', { params }),
};

export const enrollmentAPI = {
  myEnrollments: () => api.get('/api/enrollments/me'),
  enroll: (courseId: string) => api.post(`/api/enrollments/${courseId}/enroll`),
  unenroll: (courseId: string) => api.delete(`/api/enrollments/${courseId}/enroll`),
  summary: () => api.get('/api/enrollments/summary'),
};

// For admin courses CRUD (already have Course routes, add helpers)
export const adminCoursesAPI = {
  listAll: (params?: any) => api.get('/api/courses/admin', { params }),
  create: (form: FormData) => api.post('/api/courses', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, body: any) => api.put(`/api/courses/${id}`, body),
  remove: (id: string) => api.delete(`/api/courses/${id}`),
  publish: (id: string) => api.post(`/api/courses/${id}/publish`),
  unpublish: (id: string) => api.post(`/api/courses/${id}/unpublish`),
};

export default api;