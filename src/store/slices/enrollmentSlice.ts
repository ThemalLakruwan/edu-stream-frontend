// frontend/src/store/slices/enrollmentSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { enrollmentAPI } from '../../services/api';

interface EnrolledItem {
  enrolledAt: string;
  course: { _id: string; title: string; thumbnail: string; category: string; difficulty: string; duration: number; instructor: { name: string } };
}
interface EnrollmentState {
  mine: EnrolledItem[];
  /** ✅ quick membership check (courseId list) */
  mineIds: string[];
  summary: Array<{ courseId: string; title: string; count: number; category: string; difficulty: string }>;
  loading: boolean;
  /** for enroll button spinner */
  enrolling: boolean;
}
const initial: EnrollmentState = { mine: [], mineIds: [], summary: [], loading: false, enrolling: false };

/** ✅ enroll */
export const enrollToCourse = createAsyncThunk(
  'enrollments/enroll',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const { data } = await enrollmentAPI.enroll(courseId);
      // backend returns enrollment doc or {message:'Already enrolled'}
      const enrolledAt = data?.enrolledAt || new Date().toISOString();
      const already = data?.message === 'Already enrolled';
      return { courseId, enrolledAt, already };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.error || 'Failed to enroll');
    }
  }
);

/** ✅ unenroll (not used on detail page, but handy) */
export const unenrollFromCourse = createAsyncThunk(
  'enrollments/unenroll',
  async (courseId: string, { rejectWithValue }) => {
    try {
      await enrollmentAPI.unenroll(courseId);
      return { courseId };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.error || 'Failed to unenroll');
    }
  }
);

export const fetchMyEnrollments = createAsyncThunk('enrollments/mine', async () => {
  const { data } = await enrollmentAPI.myEnrollments();
  return data as EnrolledItem[];
});
export const fetchEnrollmentSummary = createAsyncThunk('enrollments/summary', async () => {
  const { data } = await enrollmentAPI.summary();
  return data as EnrollmentState['summary'];
});

const slice = createSlice({
  name: 'enrollments',
  initialState: initial,
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchMyEnrollments.pending, s => { s.loading = true; })
     .addCase(fetchMyEnrollments.fulfilled, (s, a) => {
       s.loading = false;
       s.mine = a.payload;
       s.mineIds = a.payload.map(x => x.course._id);
     })
     .addCase(fetchEnrollmentSummary.fulfilled, (s, a) => { s.summary = a.payload; })

     // ✅ enroll button UX
     .addCase(enrollToCourse.pending, s => { s.enrolling = true; })
     .addCase(enrollToCourse.fulfilled, (s, a) => {
       s.enrolling = false;
       const id = a.payload.courseId;
       if (!s.mineIds.includes(id)) s.mineIds.unshift(id);
     })
     .addCase(enrollToCourse.rejected, s => { s.enrolling = false; })

     .addCase(unenrollFromCourse.fulfilled, (s, a) => {
       s.mine = s.mine.filter(e => e.course._id !== a.payload.courseId);
       s.mineIds = s.mineIds.filter(id => id !== a.payload.courseId);
     });
  }
});

export default slice.reducer;
