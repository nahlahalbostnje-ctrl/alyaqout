import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface Package {
  id: number;
  name: string;
  description: string | null;
  price: string;
  duration_days: number;
  is_active: boolean;
  sort_order: number;
}

interface PackagesState {
  list: Package[];
  loading: boolean;
  error: string | null;
}

const initialState: PackagesState = { list: [], loading: false, error: null };

export const fetchPackages = createAsyncThunk(
  'packages/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/packages');
      return data.data as Package[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحميل الباقات');
    }
  }
);

export const addPackage = createAsyncThunk(
  'packages/add',
  async (payload: { name: string; description?: string; price: number; duration_days: number; sort_order?: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/packages', payload);
      return data.data as Package;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل إضافة الباقة');
    }
  }
);

export const updatePackage = createAsyncThunk(
  'packages/update',
  async (
    payload: { id: number; name: string; description?: string; price: number; duration_days: number; sort_order?: number },
    { rejectWithValue }
  ) => {
    try {
      const { id, ...body } = payload;
      const { data } = await api.put(`/admin/packages/${id}`, body);
      return data.data as Package;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تعديل الباقة');
    }
  }
);

export const togglePackage = createAsyncThunk(
  'packages/toggle',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/packages/${id}/toggle`);
      return data.data as Package;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تغيير الحالة');
    }
  }
);

export const deletePackage = createAsyncThunk(
  'packages/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/packages/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل الحذف');
    }
  }
);

const packagesSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPackages.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchPackages.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(addPackage.fulfilled,    (s, a) => { s.list.push(a.payload); })
      .addCase(updatePackage.fulfilled, (s, a) => {
        const i = s.list.findIndex((p) => p.id === a.payload.id);
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(togglePackage.fulfilled, (s, a) => {
        const i = s.list.findIndex((p) => p.id === a.payload.id);
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(deletePackage.fulfilled, (s, a) => {
        s.list = s.list.filter((p) => p.id !== a.payload);
      });
  },
});

export default packagesSlice.reducer;
