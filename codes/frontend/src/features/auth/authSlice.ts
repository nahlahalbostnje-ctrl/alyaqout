import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface AuthCountry {
  id: number;
  name: string;
  code: string;
  currency: string;
}

export interface AuthUser {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: string;
  country_id: number | null;
  country?: AuthCountry | null;
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

export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'البريد أو كلمة المرور غير صحيحة.');
    }
  }
);

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (phone: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/send-otp', { phone });
      return data as { success: boolean; message: string; debug_otp?: string; expires_in?: number };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'تعذّر إرسال رمز التحقق.');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: { phone: string; otp: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/verify-otp', payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'رمز التحقق غير صحيح.');
    }
  }
);

/** @deprecated استخدم loginWithEmail أو verifyOtp */
export const login = loginWithEmail;

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
  async (payload: { name?: string; phone?: string; email?: string; password?: string; password_confirmation?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/auth/profile', payload);
      return data.data as AuthUser;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحديث البيانات');
    }
  }
);

function applyAuthSuccess(state: AuthState, payload: { token: string; user: AuthUser }) {
  state.loading = false;
  state.error   = null;
  state.token   = payload.token;
  state.user    = payload.user;
  localStorage.setItem('yaqoot_token', payload.token);
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user  = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('yaqoot_token');
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem('yaqoot_token', action.payload);
    },
    impersonate(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token;
      state.user  = action.payload.user;
      localStorage.setItem('yaqoot_token', action.payload.token);
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        applyAuthSuccess(state, action.payload);
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        applyAuthSuccess(state, action.payload);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
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

export const { logout, setToken, impersonate, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
