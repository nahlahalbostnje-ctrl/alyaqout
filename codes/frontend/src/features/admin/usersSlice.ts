import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

export type UserRole = 'teacher' | 'student' | 'parent';

export interface AdminUser {
  id: number;
  name: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

interface UsersState {
  list: AdminUser[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = { list: [], loading: false, error: null };

export const fetchUsers = createAsyncThunk(
  'adminUsers/fetchAll',
  async (role: UserRole | null, { rejectWithValue }) => {
    try {
      const params = role ? { role } : {};
      const { data } = await api.get('/admin/users', { params });
      return data.data as AdminUser[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحميل المستخدمين');
    }
  }
);

export const addUser = createAsyncThunk(
  'adminUsers/add',
  async (payload: { name: string; phone: string; role: UserRole }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/users', payload);
      return data.data as AdminUser;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل إنشاء الحساب');
    }
  }
);

export const toggleUser = createAsyncThunk(
  'adminUsers/toggle',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/users/${id}/toggle`);
      return data.data as AdminUser;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تغيير الحالة');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'adminUsers/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل الحذف');
    }
  }
);

const usersSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchUsers.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchUsers.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(addUser.fulfilled,    (s, a) => { s.list.unshift(a.payload); })
      .addCase(toggleUser.fulfilled, (s, a) => {
        const i = s.list.findIndex((u) => u.id === a.payload.id);
        if (i !== -1) s.list[i] = { ...s.list[i], ...a.payload };
      })
      .addCase(deleteUser.fulfilled, (s, a) => {
        s.list = s.list.filter((u) => u.id !== a.payload);
      });
  },
});

export default usersSlice.reducer;
