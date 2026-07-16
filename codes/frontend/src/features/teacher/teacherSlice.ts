import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

interface CourseCategory { id: number; name: string; grade?: { id: number; name: string } }

export interface TeacherSubjectSummary {
  id: number;
  subject_id: number;
  name: string | null;
  type: string | null;
  grades: { id: number; name: string }[];
}

export interface TeacherCourse {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  price: string;
  is_free: boolean;
  is_active: boolean;
  category?: CourseCategory;
  subject?: { id: number; name: string; type: string };
  grade?: { id: number; name: string };
}

export interface TeacherLiveClass {
  id: number;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'ended';
  approval_status?: 'pending' | 'approved' | 'rejected';
  archived_at?: string | null;
  meeting_link: string | null;
  agora_channel: string | null;
  course: { id: number; title: string };
}

export interface CreateLiveClassPayload {
  course_id: number;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
}

export interface UpdateLiveClassPayload {
  id: number;
  title?: string;
  description?: string;
  scheduled_at?: string;
  duration_minutes?: number;
}

export interface TeacherStats {
  total_courses:         number;
  total_live_classes:    number;
  pending_homework_subs: number;
  pending_exam_subs:     number;
  active_homeworks:      number;
  active_exams:          number;
  today_attendance:      number;
}

export interface RecentSubmission {
  id: number;
  student_name: string;
  homework: string;
  submitted_at: string;
}

interface TeacherInfo { id: number; name: string }

interface TeacherState {
  teacher: TeacherInfo | null;
  subjects: TeacherSubjectSummary[];
  courses: TeacherCourse[];
  liveClasses: TeacherLiveClass[];
  upcoming: TeacherLiveClass[];
  stats: TeacherStats | null;
  liveNow: { id: number; title: string; agora_channel: string | null } | null;
  recentSubmissions: RecentSubmission[];
  loading: boolean;
  error: string | null;
}

const initialState: TeacherState = {
  teacher: null,
  subjects: [],
  courses: [],
  liveClasses: [],
  upcoming: [],
  stats: null,
  liveNow: null,
  recentSubmissions: [],
  loading: false,
  error: null,
};

export const fetchTeacherDashboard = createAsyncThunk(
  'teacher/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const r = await api.get('/teacher/dashboard');
      return r.data.data;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

export const fetchTeacherCourses = createAsyncThunk(
  'teacher/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const r = await api.get('/teacher/courses');
      return r.data.data as TeacherCourse[];
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

export const fetchTeacherLiveClasses = createAsyncThunk(
  'teacher/fetchLiveClasses',
  async (scope: 'active' | 'archived' | undefined, { rejectWithValue }) => {
    try {
      const r = await api.get('/teacher/live-classes', { params: { scope: scope ?? 'active' } });
      return r.data.data as TeacherLiveClass[];
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

export const updateTeacherClassStatus = createAsyncThunk(
  'teacher/updateClassStatus',
  async (classId: number, { rejectWithValue }) => {
    try {
      const r = await api.patch(`/teacher/live-classes/${classId}/status`);
      return r.data.data as TeacherLiveClass;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

export const createTeacherLiveClass = createAsyncThunk(
  'teacher/createLiveClass',
  async (payload: CreateLiveClassPayload, { rejectWithValue }) => {
    try {
      const r = await api.post('/teacher/live-classes', payload);
      return r.data.data as TeacherLiveClass;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

export const updateTeacherLiveClass = createAsyncThunk(
  'teacher/updateLiveClass',
  async (payload: UpdateLiveClassPayload, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const r = await api.put(`/teacher/live-classes/${id}`, body);
      return r.data.data as TeacherLiveClass;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

export const archiveTeacherLiveClass = createAsyncThunk(
  'teacher/archiveLiveClass',
  async (id: number, { rejectWithValue }) => {
    try {
      const r = await api.patch(`/teacher/live-classes/${id}/archive`);
      return r.data.data as TeacherLiveClass;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherDashboard.pending,  (s) => { s.loading = true; s.error = null; })
      .addCase(fetchTeacherDashboard.fulfilled, (s, a) => {
        s.loading           = false;
        s.teacher           = a.payload.teacher;
        s.subjects          = a.payload.subjects ?? [];
        s.courses           = a.payload.courses;
        s.upcoming          = a.payload.upcoming;
        s.stats             = a.payload.stats ?? null;
        s.liveNow           = a.payload.live_now ?? null;
        s.recentSubmissions = a.payload.recent_submissions ?? [];
      })
      .addCase(fetchTeacherDashboard.rejected, (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      })

      .addCase(fetchTeacherCourses.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchTeacherCourses.fulfilled, (s, a) => { s.loading = false; s.courses = a.payload; })
      .addCase(fetchTeacherCourses.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(fetchTeacherLiveClasses.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchTeacherLiveClasses.fulfilled, (s, a) => { s.loading = false; s.liveClasses = a.payload; })
      .addCase(fetchTeacherLiveClasses.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(updateTeacherClassStatus.fulfilled, (s, a) => {
        const idx = s.liveClasses.findIndex((c) => c.id === a.payload.id);
        if (idx !== -1) s.liveClasses[idx] = a.payload;
        const upIdx = s.upcoming.findIndex((c) => c.id === a.payload.id);
        if (upIdx !== -1) s.upcoming[upIdx] = a.payload;
      })

      .addCase(createTeacherLiveClass.fulfilled, (s, a) => {
        s.liveClasses = [a.payload, ...s.liveClasses];
      })

      .addCase(updateTeacherLiveClass.fulfilled, (s, a) => {
        const idx = s.liveClasses.findIndex((c) => c.id === a.payload.id);
        if (idx !== -1) s.liveClasses[idx] = a.payload;
      })

      .addCase(archiveTeacherLiveClass.fulfilled, (s, a) => {
        s.liveClasses = s.liveClasses.filter((c) => c.id !== a.payload.id);
      });
  },
});

export default teacherSlice.reducer;
