import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface CatalogCourse {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  price: string | number | null;
  is_free: boolean;
  units_count: number;
  category: { id: number; name: string } | null;
  subject: { id: number; name: string; type?: string } | null;
  grade: { id: number; name: string } | null;
  teacher: { id: number; name: string } | null;
  is_entitled: boolean;
  progress: number | null;
  is_complete: boolean;
}

export interface CatalogCourseDetail extends Omit<CatalogCourse, 'units_count' | 'progress'> {
  progress: number | null;
  total_videos: number | null;
  content_path: string | null;
  packages_hint: string | null;
  purchase_pending?: boolean;
  can_request_purchase?: boolean;
  units: Array<{
    id: number;
    title: string;
    lessons_count: number;
    locked: boolean;
    lessons: Array<{ id: number; title: string; videos_count: number }>;
  }>;
}

interface State {
  items: CatalogCourse[];
  detail: CatalogCourseDetail | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}

const initialState: State = {
  items: [],
  detail: null,
  loading: false,
  detailLoading: false,
  error: null,
};

export const fetchCatalog = createAsyncThunk(
  'catalog/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const r = await api.get('/student/catalog');
      return r.data.data as CatalogCourse[];
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'تعذر تحميل الكتالوج');
    }
  }
);

export const fetchCatalogCourse = createAsyncThunk(
  'catalog/fetchOne',
  async (courseId: number, { rejectWithValue }) => {
    try {
      const r = await api.get(`/student/catalog/${courseId}`);
      return r.data.data as CatalogCourseDetail;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'تعذر تحميل المساق');
    }
  }
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    clearCatalogDetail: (s) => { s.detail = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchCatalog.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchCatalog.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; });
    b.addCase(fetchCatalog.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) ?? 'خطأ';
    });
    b.addCase(fetchCatalogCourse.pending, (s) => { s.detailLoading = true; s.error = null; });
    b.addCase(fetchCatalogCourse.fulfilled, (s, a) => { s.detailLoading = false; s.detail = a.payload; });
    b.addCase(fetchCatalogCourse.rejected, (s, a) => {
      s.detailLoading = false;
      s.error = (a.payload as string) ?? 'خطأ';
    });
  },
});

export const { clearCatalogDetail } = catalogSlice.actions;
export default catalogSlice.reducer;
