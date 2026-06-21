import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

interface Teacher { id: number; name: string; }
interface Grade   { id: number; name: string; }
interface Category { id: number; name: string; grade: Grade; }

export interface StudentCourse {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  price: string;
  is_free: boolean;
  category: Category;
  teacher: Teacher | null;
}

export interface StudentLiveClass {
  id: number;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'ended';
  meeting_link: string | null;
  agora_channel: string | null;
  course: { id: number; title: string };
  teacher: Teacher;
}

interface StudentInfo { id: number; name: string; }

export interface ActiveSubscription {
  id: number;
  package_name: string;
  starts_at: string;
  ends_at: string;
  days_remaining: number;
  status: string;
}

export interface StudentDashStats {
  total_points:     number;
  level:            number;
  xp_in_level:      number;
  xp_for_next:      number;
  pending_homework: number;
  upcoming_exams:   number;
  attendance_count: number;
  total_courses:    number;
}

interface StudentState {
  student: StudentInfo | null;
  courses: StudentCourse[];
  liveClasses: StudentLiveClass[];
  upcoming: StudentLiveClass[];
  subscription: ActiveSubscription | null;
  dashStats: StudentDashStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  student: null,
  courses: [],
  liveClasses: [],
  upcoming: [],
  subscription: null,
  dashStats: null,
  loading: false,
  error: null,
};

export const fetchStudentDashboard = createAsyncThunk(
  'student/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const r = await api.get('/student/dashboard');
      return r.data.data;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

export const fetchStudentCourses = createAsyncThunk(
  'student/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const r = await api.get('/student/courses');
      return r.data.data as StudentCourse[];
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

export const fetchStudentLiveClasses = createAsyncThunk(
  'student/fetchLiveClasses',
  async (_, { rejectWithValue }) => {
    try {
      const r = await api.get('/student/live-classes');
      return r.data.data as StudentLiveClass[];
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'حدث خطأ');
    }
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentDashboard.pending,  (s) => { s.loading = true; s.error = null; })
      .addCase(fetchStudentDashboard.fulfilled, (s, a) => {
        s.loading      = false;
        s.student      = a.payload.student;
        s.courses      = a.payload.courses;
        s.upcoming     = a.payload.upcoming;
        s.subscription = a.payload.subscription ?? null;
        s.dashStats    = a.payload.stats ?? null;
      })
      .addCase(fetchStudentDashboard.rejected, (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      })

      .addCase(fetchStudentCourses.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchStudentCourses.fulfilled, (s, a) => { s.loading = false; s.courses = a.payload; })
      .addCase(fetchStudentCourses.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(fetchStudentLiveClasses.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchStudentLiveClasses.fulfilled, (s, a) => { s.loading = false; s.liveClasses = a.payload; })
      .addCase(fetchStudentLiveClasses.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });
  },
});

export default studentSlice.reducer;
