import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface ParentLiveClass {
  id: number;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'ended';
  meeting_link: string | null;
  course: { id: number; title: string };
}

export interface ParentCourse {
  id: number;
  title: string;
  thumbnail: string | null;
  price: string;
  is_free: boolean;
  is_active: boolean;
  category: { id: number; name: string; grade: { id: number; name: string } };
}

export interface ChildSummary {
  id: number;
  name: string;
  phone: string;
  courses_count: number;
  upcoming_count: number;
  upcoming: ParentLiveClass[];
}

export interface ChildDetail {
  id: number;
  name: string;
  phone: string;
  courses: ParentCourse[];
  live_classes: ParentLiveClass[];
}

interface ParentInfo { id: number; name: string }

interface ParentState {
  parent: ParentInfo | null;
  children: ChildSummary[];
  childrenDetail: ChildDetail[];
  stats: { total_children: number };
  loading: boolean;
  error: string | null;
}

const initialState: ParentState = {
  parent: null,
  children: [],
  childrenDetail: [],
  stats: { total_children: 0 },
  loading: false,
  error: null,
};

export const fetchParentDashboard = createAsyncThunk(
  'parent/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const r = await api.get('/parent/dashboard');
      return r.data.data;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

export const fetchParentChildren = createAsyncThunk(
  'parent/fetchChildren',
  async (_, { rejectWithValue }) => {
    try {
      const r = await api.get('/parent/children');
      return r.data.data as ChildDetail[];
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

const parentSlice = createSlice({
  name: 'parent',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParentDashboard.pending,  (s) => { s.loading = true; s.error = null; })
      .addCase(fetchParentDashboard.fulfilled, (s, a) => {
        s.loading  = false;
        s.parent   = a.payload.parent;
        s.children = a.payload.children;
        s.stats    = a.payload.stats;
      })
      .addCase(fetchParentDashboard.rejected, (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      })

      .addCase(fetchParentChildren.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchParentChildren.fulfilled, (s, a) => {
        s.loading        = false;
        s.childrenDetail = a.payload;
      })
      .addCase(fetchParentChildren.rejected,  (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      });
  },
});

export default parentSlice.reducer;
