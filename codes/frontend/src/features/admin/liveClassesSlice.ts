import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

export type ClassStatus = 'scheduled' | 'live' | 'ended';

export type SessionType = 'group' | 'individual';

export interface LiveClass {
  id: number;
  course_id: number;
  teacher_id: number;
  session_type: SessionType;
  student_id: number | null;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: ClassStatus;
  approval_status?: string;
  archived_at?: string | null;
  agora_channel: string | null;
  course?: { id: number; title: string };
  teacher?: { id: number; name: string };
  student?: { id: number; name: string };
}

export interface LiveClassPayload {
  course_id: number;
  teacher_id: number;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes?: number;
  session_type?: SessionType;
  student_id?: number | null;
}

interface LiveClassesState {
  list: LiveClass[];
  loading: boolean;
  error: string | null;
}

const initialState: LiveClassesState = { list: [], loading: false, error: null };

export const fetchLiveClasses = createAsyncThunk(
  'liveClasses/fetchAll',
  async (status: ClassStatus | null, { rejectWithValue }) => {
    try {
      const params = status ? { status } : {};
      const { data } = await api.get('/admin/live-classes', { params });
      return data.data as LiveClass[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحميل الحصص');
    }
  }
);

export const addLiveClass = createAsyncThunk(
  'liveClasses/add',
  async (payload: LiveClassPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/live-classes', payload);
      return data.data as LiveClass;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل إضافة الحصة');
    }
  }
);

export const updateLiveClass = createAsyncThunk(
  'liveClasses/update',
  async (
    payload: { id: number; title: string; scheduled_at: string; duration_minutes?: number; description?: string },
    { rejectWithValue }
  ) => {
    try {
      const { id, ...body } = payload;
      const { data } = await api.put(`/admin/live-classes/${id}`, body);
      return data.data as LiveClass;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تعديل الحصة');
    }
  }
);

export const updateClassStatus = createAsyncThunk(
  'liveClasses/updateStatus',
  async (payload: { id: number; status: ClassStatus }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/live-classes/${payload.id}/status`, {
        status: payload.status,
      });
      return data.data as LiveClass;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تغيير الحالة');
    }
  }
);

export const deleteLiveClass = createAsyncThunk(
  'liveClasses/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/live-classes/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل الحذف');
    }
  }
);

export const archiveLiveClass = createAsyncThunk(
  'liveClasses/archive',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.patch(`/admin/live-classes/${id}/archive`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل الأرشفة');
    }
  }
);

const liveClassesSlice = createSlice({
  name: 'liveClasses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveClasses.pending,    (s) => { s.loading = true; s.error = null; })
      .addCase(fetchLiveClasses.fulfilled,  (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchLiveClasses.rejected,   (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(addLiveClass.fulfilled,      (s, a) => { s.list.unshift(a.payload); })
      .addCase(updateLiveClass.fulfilled,   (s, a) => {
        const i = s.list.findIndex((c) => c.id === a.payload.id);
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(updateClassStatus.fulfilled, (s, a) => {
        const i = s.list.findIndex((c) => c.id === a.payload.id);
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(deleteLiveClass.fulfilled,   (s, a) => {
        s.list = s.list.filter((c) => c.id !== a.payload);
      })
      .addCase(archiveLiveClass.fulfilled,  (s, a) => {
        s.list = s.list.filter((c) => c.id !== a.payload);
      });
  },
});

export default liveClassesSlice.reducer;
