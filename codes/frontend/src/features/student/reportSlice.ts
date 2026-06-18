import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface RecentExam {
  title?: string;
  score?: number;
  total_points?: number;
  pct: number;
  submitted_at?: string;
}

export interface RecentHw {
  title?: string;
  grade?: number;
  submitted_at?: string;
}

export interface StudentReport {
  attendance: { total: number; present: number; absent: number; late: number; rate: number | null };
  exams: { count: number; average: number | null; recent: RecentExam[] };
  homework: { submitted: number; late: number; average: number | null; recent: RecentHw[] };
  progress: { videos_completed: number };
}

interface ReportState {
  myReport: StudentReport | null;
  childReports: Record<number, StudentReport & { student: { id: number; name: string } }>;
  loading: boolean;
}

const initialState: ReportState = {
  myReport: null,
  childReports: {},
  loading: false,
};

export const fetchMyReport = createAsyncThunk('report/mine', async () => {
  const res = await api.get('/student/report');
  return res.data.data as StudentReport;
});

export const fetchChildReport = createAsyncThunk('report/child', async (studentId: number) => {
  const res = await api.get(`/parent/children/${studentId}/report`);
  return { studentId, data: res.data.data as StudentReport & { student: { id: number; name: string } } };
});

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyReport.pending, (s) => { s.loading = true; })
      .addCase(fetchMyReport.fulfilled, (s, a) => { s.loading = false; s.myReport = a.payload; })
      .addCase(fetchMyReport.rejected, (s) => { s.loading = false; })
      .addCase(fetchChildReport.pending, (s) => { s.loading = true; })
      .addCase(fetchChildReport.fulfilled, (s, a) => {
        s.loading = false;
        s.childReports[a.payload.studentId] = a.payload.data;
      })
      .addCase(fetchChildReport.rejected, (s) => { s.loading = false; });
  },
});

export default reportSlice.reducer;
