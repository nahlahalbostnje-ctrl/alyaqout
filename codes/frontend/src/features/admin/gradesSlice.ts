import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface Grade {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
}

interface GradesState {
  list: Grade[];
  loading: boolean;
  error: string | null;
}

const initialState: GradesState = { list: [], loading: false, error: null };

export const fetchGrades = createAsyncThunk(
  'grades/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/grades');
      return data.data as Grade[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحميل الصفوف');
    }
  }
);

export const addGrade = createAsyncThunk(
  'grades/add',
  async (payload: { name: string; sort_order: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/grades', payload);
      return data.data as Grade;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل إضافة الصف');
    }
  }
);

export const updateGrade = createAsyncThunk(
  'grades/update',
  async (payload: { id: number; name: string; sort_order: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/grades/${payload.id}`, {
        name: payload.name,
        sort_order: payload.sort_order,
      });
      return data.data as Grade;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تعديل الصف');
    }
  }
);

export const toggleGrade = createAsyncThunk(
  'grades/toggle',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/grades/${id}/toggle`);
      return data.data as Grade;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تغيير الحالة');
    }
  }
);

export const deleteGrade = createAsyncThunk(
  'grades/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/grades/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل الحذف');
    }
  }
);

const gradesSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGrades.pending,    (state) => { state.loading = true; state.error = null; })
      .addCase(fetchGrades.fulfilled,  (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchGrades.rejected,   (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(addGrade.fulfilled,     (state, action) => { state.list.push(action.payload); })
      .addCase(updateGrade.fulfilled,  (state, action) => {
        const idx = state.list.findIndex((g) => g.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(toggleGrade.fulfilled,  (state, action) => {
        const idx = state.list.findIndex((g) => g.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteGrade.fulfilled,  (state, action) => {
        state.list = state.list.filter((g) => g.id !== action.payload);
      });
  },
});

export default gradesSlice.reducer;
