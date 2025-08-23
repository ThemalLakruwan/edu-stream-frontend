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
  _id?: string;
  userId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planType: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  createdAt?: string;
  updatedAt?: string;
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
    console.log('Plans API response:', res.data); // Debug log
    
    // Handle both array and object responses
    let plansData = res.data;
    
    // If response is an object with plans property, extract it
    if (plansData && typeof plansData === 'object' && !Array.isArray(plansData)) {
      if (plansData.plans && Array.isArray(plansData.plans)) {
        plansData = plansData.plans;
      } else {
        // Convert object to array format
        plansData = Object.entries(plansData).map(([key, value]: [string, any]) => ({
          id: key,
          planType: key,
          name: value.name || `${key} Plan`,
          price: value.price || 0,
          currency: value.currency || 'usd',
          interval: value.interval || 'month',
          features: value.features || []
        }));
      }
    }
    
    // Ensure it's an array
    if (!Array.isArray(plansData)) {
      console.error('Plans data is not an array:', plansData);
      return [];
    }
    
    return plansData as Plan[];
  } catch (e: any) {
    console.error('Fetch plans error:', e);
    return rejectWithValue(e.response?.data?.error || e.message);
  }
});

export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const res = await subscriptionAPI.getCurrentSubscription();
      console.log('Current subscription response:', res.data); // Debug log
      
      // Handle both wrapped and direct responses
      let subscriptionData = res.data;
      
      // If response has a subscription property, extract it
      if (subscriptionData && subscriptionData.subscription !== undefined) {
        subscriptionData = subscriptionData.subscription;
      }
      
      return subscriptionData as CurrentSubscription | null;
    } catch (e: any) {
      console.error('Fetch current subscription error:', e);
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
      console.error('Create subscription error:', e);
      return rejectWithValue(e.response?.data?.error || e.message);
    }
  }
);

export const cancelSubscription = createAsyncThunk('subscription/cancel', async (_, { rejectWithValue }) => {
  try {
    const res = await subscriptionAPI.cancelSubscription();
    return res.data;
  } catch (e: any) {
    console.error('Cancel subscription error:', e);
    return rejectWithValue(e.response?.data?.error || e.message);
  }
});

export const resumeSubscription = createAsyncThunk('subscription/resume', async (_, { rejectWithValue }) => {
  try {
    const res = await subscriptionAPI.resumeSubscription();
    return res.data;
  } catch (e: any) {
    console.error('Resume subscription error:', e);
    return rejectWithValue(e.response?.data?.error || e.message);
  }
});

export const changePlan = createAsyncThunk('subscription/changePlan', async (planType: string, { rejectWithValue }) => {
  try {
    const res = await subscriptionAPI.changePlan(planType);
    return res.data;
  } catch (e: any) {
    console.error('Change plan error:', e);
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
        // Ensure we always have an array
        s.plans = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchPlans.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
        // Set empty array on error to prevent map error
        s.plans = [];
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
          s.current.cancelAtPeriodEnd = true;
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