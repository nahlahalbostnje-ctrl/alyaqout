import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/axios';

interface AuthUser {
  id: number;
  name: string;
  phone: string;
  role: string;
  country_id: number | null;
}

interface AuthState {
  user:    AuthUser | null;
  token:   string | null;
  loading: boolean;
  error:   string | null;
}

const initialState: AuthState = {
  user:    null,
  token:   localStorage.getItem('yaqoot_token'),
  loading: false,
  error:   null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (phone: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { phone });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'رقم الهاتف غير مسجل أو الحساب غير نشط.');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'خطأ في جلب البيانات');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload: { name?: string; phone?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/auth/profile', payload);
      return data.data as AuthUser;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحديث البيانات');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('yaqoot_token');
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem('yaqoot_token', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token   = action.payload.token;
        state.user    = action.payload.user;
        localStorage.setItem('yaqoot_token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user  = null;
        state.token = null;
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) state.user = { ...state.user, ...action.payload };
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
