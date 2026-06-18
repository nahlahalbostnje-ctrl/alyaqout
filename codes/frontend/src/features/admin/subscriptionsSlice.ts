import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface SubStudent { id: number; name: string; phone: string }
export interface SubPackage  { id: number; name: string; duration_days: number }

export interface Subscription {
  id: number;
  student: SubStudent;
  package: SubPackage;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  payment_method: 'manual' | 'online';
  payment_status: 'paid' | 'pending' | 'refunded';
  amount_paid: string;
  notes: string | null;
  days_remaining: number;
  created_at: string;
}

export interface SubStats {
  total: number;
  active: number;
  expired: number;
  cancelled: number;
  pending: number;
}

interface SubsState {
  items: Subscription[];
  stats: SubStats;
  loading: boolean;
  error: string | null;
}

const initialState: SubsState = {
  items: [],
  stats: { total: 0, active: 0, expired: 0, cancelled: 0, pending: 0 },
  loading: false,
  error: null,
};

export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetch',
  async (filters: { status?: string; student_id?: number } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.status)     params.append('status', filters.status);
      if (filters.student_id) params.append('student_id', String(filters.student_id));
      const r = await api.get(`/admin/subscriptions?${params}`);
      return r.data;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

export const addSubscription = createAsyncThunk(
  'subscriptions/add',
  async (payload: {
    student_id: number;
    package_id: number;
    starts_at: string;
    payment_method?: string;
    payment_status?: string;
    amount_paid?: number;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const r = await api.post('/admin/subscriptions', payload);
      return r.data.data as Subscription;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscriptions/cancel',
  async (id: number, { rejectWithValue }) => {
    try {
      const r = await api.patch(`/admin/subscriptions/${id}/cancel`);
      return r.data.data as Subscription;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSubscriptions.fulfilled, (s, a) => {
        s.loading = false;
        s.items   = a.payload.data;
        s.stats   = a.payload.stats;
      })
      .addCase(fetchSubscriptions.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(addSubscription.fulfilled, (s, a) => {
        s.items.unshift(a.payload);
        s.stats.total++;
        s.stats.active++;
      })

      .addCase(cancelSubscription.fulfilled, (s, a) => {
        const idx = s.items.findIndex((i) => i.id === a.payload.id);
        if (idx !== -1) {
          s.items[idx] = a.payload;
          s.stats.active    = Math.max(0, s.stats.active - 1);
          s.stats.cancelled = s.stats.cancelled + 1;
        }
      });
  },
});

export default subscriptionsSlice.reducer;
