// frontend/src/store/slices/enrollmentSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { enrollmentAPI } from '../../services/api';

interface EnrolledItem {
  enrolledAt: string;
  course: { _id: string; title: string; thumbnail: string; category: string; difficulty: string; duration: number; instructor: { name: string } };
}
interface EnrollmentState {
  mine: EnrolledItem[];
  summary: Array<{ courseId: string; title: string; count: number; category: string; difficulty: string }>;
  loading: boolean;
}
const initial: EnrollmentState = { mine: [], summary: [], loading: false };

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
    b.addCase(fetchMyEnrollments.pending, s=>{s.loading=true;})
     .addCase(fetchMyEnrollments.fulfilled, (s,a)=>{s.loading=false; s.mine=a.payload;})
     .addCase(fetchEnrollmentSummary.fulfilled, (s,a)=>{s.summary=a.payload;});
  }
});
export default slice.reducer;
