// frontend/src/store/slices/subscriptionSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionAPI } from '../../services/api';

interface Plan {
  id: string;
  planType: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
}

interface Subscription {
  _id: string;
  userId: string;
  planType: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: string;
}

interface SubscriptionState {
  plans: Plan[];
  current: Subscription | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  plans: [],
  current: null,
  loading: false,
  error: null,
};

export const fetchPlans = createAsyncThunk('subscription/fetchPlans', async (_, { rejectWithValue }) => {
  try {
    const { data } = await subscriptionAPI.getPlans();
    return data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || 'Failed to fetch plans');
  }
});

export const fetchCurrentSubscription = createAsyncThunk('subscription/fetchCurrent', async (_, { rejectWithValue }) => {
  try {
    const { data } = await subscriptionAPI.getCurrentSubscription();
    return data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || 'Failed to fetch subscription');
  }
});

export const cancelSubscription = createAsyncThunk('subscription/cancel', async (_, { rejectWithValue }) => {
  try {
    const { data } = await subscriptionAPI.cancelSubscription();
    return data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || 'Failed to cancel subscription');
  }
});

export const resumeSubscription = createAsyncThunk('subscription/resume', async (_, { rejectWithValue }) => {
  try {
    const { data } = await subscriptionAPI.resumeSubscription();
    return data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || 'Failed to resume subscription');
  }
});

export const changePlan = createAsyncThunk('subscription/changePlan', async (planType: string, { rejectWithValue }) => {
  try {
    const { data } = await subscriptionAPI.changePlan(planType);
    return data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || 'Failed to change plan');
  }
});

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchPlans.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPlans.fulfilled, (s, a) => { s.loading = false; s.plans = Array.isArray(a.payload) ? a.payload : []; })
      .addCase(fetchPlans.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(fetchCurrentSubscription.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCurrentSubscription.fulfilled, (s, a) => { s.loading = false; s.current = a.payload || null; })
      .addCase(fetchCurrentSubscription.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(cancelSubscription.fulfilled, (s) => { if (s.current) s.current.cancelAtPeriodEnd = true; })
      .addCase(resumeSubscription.fulfilled, (s) => { if (s.current) s.current.cancelAtPeriodEnd = false; });
  },
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
