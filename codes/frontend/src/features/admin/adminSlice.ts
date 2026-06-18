import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

interface CountryInfo {
  id: number;
  name: string;
  code: string;
}

interface AdminStats {
  teachers: number;
  students: number;
  parents: number;
  grades: number;
  courses: number;
  live_scheduled: number;
  live_active: number;
}

interface AdminDashboard {
  country: CountryInfo;
  stats: AdminStats;
}

interface AdminState {
  dashboard: AdminDashboard | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  dashboard: null,
  loading: false,
  error: null,
};

export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/dashboard/stats');
      return data.data as AdminDashboard;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحميل الإحصائيات');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading   = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export default adminSlice.reducer;
