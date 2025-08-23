// frontend/src/store/slices/coursesSlice.ts - FIXED VERSION
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { coursesAPI } from '../../services/api';

// FIXED: Complete Course interface matching backend model
interface Lesson {
  id: string;
  title: string;
  videoUrl?: string;
  duration: number;
  order: number;
  description?: string;
  resources?: string[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  thumbnail: string;
  videoUrl?: string;
  materials?: string[];  // ADDED
  lessons?: Lesson[];    // FIXED: Made optional and added proper type
  requirements?: string[]; // ADDED
  tags: string[];
  rating: number;
  ratingCount: number;
  enrolledCount: number;
  price: number;
  isPublished?: boolean; // ADDED
  createdAt?: string;    // ADDED
  updatedAt?: string;    // ADDED
}

// FIXED: Category interface
interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  courseCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CoursesState {
  courses: Course[];
  currentCourse: Course | null;
  categories: Category[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: CoursesState = {
  courses: [],
  currentCourse: null,
  categories: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await coursesAPI.getCourses(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await coursesAPI.getCourseById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'courses/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await coursesAPI.getCategories();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { clearCurrentCourse, clearError } = coursesSlice.actions;
export default coursesSlice.reducer;

// Export types for use in other files
export type { Course, Category, Lesson };