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
  clientSecret: string | null;
  processingPayment: boolean;
}

const initialState: SubscriptionState = {
  plans: [],
  current: null,
  loading: false,
  error: null,
  clientSecret: null,
  processingPayment: false,
};

// Fetch available plans
export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.getPlans();
      console.log('Plans response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Fetch plans error:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch plans');
    }
  }
);

// Fetch current subscription
export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.getCurrentSubscription();
      console.log('Current subscription response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Fetch current subscription error:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch subscription');
    }
  }
);

// Create subscription - FIXED with proper error handling
export const createSubscription = createAsyncThunk(
  'subscription/create',
  async (planType: string, { rejectWithValue }) => {
    try {
      console.log('Creating subscription for plan:', planType);
     
      // First, create the subscription intent
      const response = await subscriptionAPI.createSubscription({
        planType,
        // We'll handle payment method separately
      });
     
      console.log('Create subscription response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Create subscription error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create subscription';
      return rejectWithValue(errorMessage);
    }
  }
);

// Cancel subscription
export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.cancelSubscription();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel subscription');
    }
  }
);

// Resume subscription
export const resumeSubscription = createAsyncThunk(
  'subscription/resume',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.resumeSubscription();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to resume subscription');
    }
  }
);

// Change plan
export const changePlan = createAsyncThunk(
  'subscription/changePlan',
  async (planType: string, { rejectWithValue }) => {
    try {
      const response = await subscriptionAPI.changePlan(planType);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to change plan');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setClientSecret: (state, action) => {
      state.clientSecret = action.payload;
    },
    clearClientSecret: (state) => {
      state.clientSecret = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch plans
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
     
      // Fetch current subscription
      .addCase(fetchCurrentSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload || null;
      })
      .addCase(fetchCurrentSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
     
      // Create subscription
      .addCase(createSubscription.pending, (state) => {
        state.processingPayment = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.processingPayment = false;
        state.clientSecret = action.payload.clientSecret;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.processingPayment = false;
        state.error = action.payload as string;
      })
     
      // Cancel subscription
      .addCase(cancelSubscription.fulfilled, (state) => {
        if (state.current) {
          state.current.cancelAtPeriodEnd = true;
        }
      })
     
      // Resume subscription
      .addCase(resumeSubscription.fulfilled, (state) => {
        if (state.current) {
          state.current.cancelAtPeriodEnd = false;
        }
      });
  },
});

export const { clearError, setClientSecret, clearClientSecret } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;