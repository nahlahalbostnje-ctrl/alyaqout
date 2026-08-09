import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface StudentCertificate {
  id: number;
  code: string;
  student_name: string;
  course_title: string;
  course_id: number;
  thumbnail: string | null;
  issued_at: string | null;
  verify_path: string;
  meta?: Record<string, unknown> | null;
}

interface State {
  items: StudentCertificate[];
  loading: boolean;
  error: string | null;
}

const initialState: State = { items: [], loading: false, error: null };

export const fetchStudentCertificates = createAsyncThunk(
  'studentCertificates/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const r = await api.get('/student/certificates');
      return r.data.data as StudentCertificate[];
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message ?? 'تعذر تحميل الشهادات');
    }
  }
);

const studentCertificatesSlice = createSlice({
  name: 'studentCertificates',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchStudentCertificates.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchStudentCertificates.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; });
    b.addCase(fetchStudentCertificates.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) ?? 'خطأ';
    });
  },
});

export default studentCertificatesSlice.reducer;
