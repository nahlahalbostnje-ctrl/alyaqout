import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface AgoraTokenData {
  token:       string;
  channel:     string;
  uid:         number;
  app_id:      string;
  role:        'publisher' | 'subscriber';
  class_title: string;
}

interface AgoraState {
  tokenData:  AgoraTokenData | null;
  loading:    boolean;
  error:      string | null;
}

const initialState: AgoraState = {
  tokenData: null,
  loading:   false,
  error:     null,
};

export const fetchAgoraToken = createAsyncThunk(
  'agora/fetchToken',
  async (classId: number, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/live/token', { class_id: classId });
      return data as AgoraTokenData;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'فشل جلب توكن البث');
    }
  }
);

export const startLiveClass = createAsyncThunk(
  'agora/startClass',
  async (classId: number, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/live/${classId}/start`);
      return data as AgoraTokenData & { status: string };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'فشل بدء الحصة');
    }
  }
);

export const endLiveClass = createAsyncThunk(
  'agora/endClass',
  async (classId: number, { rejectWithValue }) => {
    try {
      await api.post(`/live/${classId}/end`);
      return classId;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'فشل إنهاء الحصة');
    }
  }
);

const agoraSlice = createSlice({
  name: 'agora',
  initialState,
  reducers: {
    clearAgoraState: (state) => {
      state.tokenData = null;
      state.loading   = false;
      state.error     = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgoraToken.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchAgoraToken.fulfilled, (s, a) => { s.loading = false; s.tokenData = a.payload; })
      .addCase(fetchAgoraToken.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(startLiveClass.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(startLiveClass.fulfilled, (s, a) => {
        s.loading   = false;
        s.tokenData = { ...a.payload };
      })
      .addCase(startLiveClass.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(endLiveClass.fulfilled, (s) => { s.tokenData = null; });
  },
});

export const { clearAgoraState } = agoraSlice.actions;
export default agoraSlice.reducer;
