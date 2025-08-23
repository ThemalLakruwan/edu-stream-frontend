import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { subscriptionAPI } from '../../services/api';

export interface Plan {
  id: string;
  name: string;
  planType: 'basic' | 'premium' | 'enterprise' | string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | string;
  features?: string[];
}

export interface CurrentSubscription {
  planType: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionState {
  plans: Plan[];
  current: CurrentSubscription | null;
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
    const res = await subscriptionAPI.getPlans();
    return res.data as Plan[];
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || e.message);
  }
});

export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const res = await subscriptionAPI.getCurrentSubscription();
      return res.data as CurrentSubscription | null;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.error || e.message);
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscription/create',
  async (planType: string, { rejectWithValue }) => {
    try {
      const res = await subscriptionAPI.createSubscription({ planType });
      // If backend returns a checkout URL, redirect immediately
      const url = (res.data?.checkoutUrl || res.data?.url) as string | undefined;
      if (url) {
        window.location.href = url;
      }
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.error || e.message);
    }
  }
);

export const cancelSubscription = createAsyncThunk('subscription/cancel', async (_, { rejectWithValue }) => {
  try {
    const res = await subscriptionAPI.cancelSubscription();
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || e.message);
  }
});

export const resumeSubscription = createAsyncThunk('subscription/resume', async (_, { rejectWithValue }) => {
  try {
    const res = await subscriptionAPI.resumeSubscription();
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || e.message);
  }
});

export const changePlan = createAsyncThunk('subscription/changePlan', async (planType: string, { rejectWithValue }) => {
  try {
    const res = await subscriptionAPI.changePlan(planType);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || e.message);
  }
});

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    setPlans: (state, action: PayloadAction<Plan[]>) => {
      state.plans = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchPlans.fulfilled, (s, a) => {
        s.loading = false;
        s.plans = a.payload;
      })
      .addCase(fetchPlans.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })
      .addCase(fetchCurrentSubscription.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
      })
      .addCase(fetchCurrentSubscription.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })
      .addCase(cancelSubscription.fulfilled, (s) => {
        if (s.current) {
          s.current.status = 'canceled';
        }
      })
      .addCase(resumeSubscription.fulfilled, (s) => {
        if (s.current) {
          s.current.status = 'active';
          s.current.cancelAtPeriodEnd = false;
        }
      })
      .addCase(changePlan.fulfilled, (s, a) => {
        if (s.current && a.payload?.planType) {
          s.current.planType = a.payload.planType;
        }
      });
  },
});

export const { clearSubscriptionError, setPlans } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
