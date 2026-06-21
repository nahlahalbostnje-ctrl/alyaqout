import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface SuperAdminStats {
  total_students:       number;
  total_teachers:       number;
  total_parents:        number;
  total_countries:      number;
  total_courses:        number;
  total_subscriptions:  number;
  live_now:             number;
  revenue_this_month:   number;
  revenue_last_month:   number;
  revenue_change_pct:   number;
  students_this_month:  number;
  students_last_month:  number;
}

export interface CountryStat {
  id: number; name: string; code: string;
  students: number; teachers: number;
}

export interface GrowthPoint { month: string; total: number; }

interface SuperAdminState {
  stats:         SuperAdminStats | null;
  approvals:     { exams: number; homeworks: number } | null;
  countryStats:  CountryStat[];
  growthChart:   GrowthPoint[];
  loading:       boolean;
  error:         string | null;
}

const initialState: SuperAdminState = {
  stats:        null,
  approvals:    null,
  countryStats: [],
  growthChart:  [],
  loading:      false,
  error:        null,
};

export const fetchSuperAdminStats = createAsyncThunk(
  'superAdmin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/super-admin/dashboard/stats');
      return data.data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? 'فشل جلب الإحصائيات');
    }
  }
);

const superAdminSlice = createSlice({
  name: 'superAdmin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuperAdminStats.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchSuperAdminStats.fulfilled, (state, action) => {
        state.loading      = false;
        state.stats        = action.payload.stats;
        state.approvals    = action.payload.approvals;
        state.countryStats = action.payload.country_stats;
        state.growthChart  = action.payload.growth_chart;
      })
      .addCase(fetchSuperAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export default superAdminSlice.reducer;
