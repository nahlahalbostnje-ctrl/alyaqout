import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface Category {
  id: number;
  grade_id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
  grade?: { id: number; name: string };
}

interface CategoriesState {
  list: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = { list: [], loading: false, error: null };

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (gradeId: number | null, { rejectWithValue }) => {
    try {
      const params = gradeId ? { grade_id: gradeId } : {};
      const { data } = await api.get('/admin/categories', { params });
      return data.data as Category[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحميل المواد');
    }
  }
);

export const addCategory = createAsyncThunk(
  'categories/add',
  async (payload: { grade_id: number; name: string; sort_order: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/categories', payload);
      return data.data as Category;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل إضافة المادة');
    }
  }
);

export const toggleCategory = createAsyncThunk(
  'categories/toggle',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/categories/${id}/toggle`);
      return data.data as Category;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تغيير الحالة');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل الحذف');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchCategories.rejected,  (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(addCategory.fulfilled,     (state, action) => { state.list.push(action.payload); })
      .addCase(toggleCategory.fulfilled,  (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteCategory.fulfilled,  (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;
