import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

export type SubjectType = 'curriculum' | 'extracurricular';

export interface SubjectGrade {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  country_id?: number;
  name: string;
  type: SubjectType;
  sort_order: number;
  is_active: boolean;
  grades?: SubjectGrade[];
}

export interface SubjectPayload {
  name: string;
  type: SubjectType;
  grade_ids: number[];
  sort_order?: number;
}

interface SubjectsState {
  list: Subject[];
  loading: boolean;
  error: string | null;
}

const initialState: SubjectsState = { list: [], loading: false, error: null };

export const fetchSubjects = createAsyncThunk(
  'subjects/fetchAll',
  async (params: { type?: SubjectType; grade_id?: number } | null | undefined, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/subjects', { params: params ?? {} });
      return data.data as Subject[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحميل المواد');
    }
  }
);

export const addSubject = createAsyncThunk(
  'subjects/add',
  async (payload: SubjectPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/subjects', payload);
      return data.data as Subject;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل إضافة المادة');
    }
  }
);

export const updateSubject = createAsyncThunk(
  'subjects/update',
  async (payload: { id: number } & Partial<SubjectPayload>, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const { data } = await api.put(`/admin/subjects/${id}`, body);
      return data.data as Subject;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تعديل المادة');
    }
  }
);

export const toggleSubject = createAsyncThunk(
  'subjects/toggle',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/subjects/${id}/toggle`);
      return data.data as Subject;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تغيير الحالة');
    }
  }
);

export const deleteSubject = createAsyncThunk(
  'subjects/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/subjects/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل الحذف');
    }
  }
);

const subjectsSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSubjects.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchSubjects.rejected,  (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(addSubject.fulfilled,    (state, action) => { state.list.push(action.payload); })
      .addCase(updateSubject.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(toggleSubject.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      });
  },
});

export default subjectsSlice.reducer;
