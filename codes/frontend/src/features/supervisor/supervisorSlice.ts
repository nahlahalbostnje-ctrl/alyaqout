import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface SupervisedStudent {
  id: number;
  name: string;
  phone: string;
  grade?: string;
  is_active: boolean;
}

export interface StudentPerformance {
  student: { id: number; name: string; phone: string; grade?: string };
  attendance: { total: number; present: number; absent: number; late: number; rate: number | null };
  exams: { count: number; average: number | null };
  homework: { submitted: number; average: number | null };
}

interface SupervisorState {
  students: SupervisedStudent[];
  performance: Record<number, StudentPerformance>;
  loading: boolean;
  saving: boolean;
}

const initialState: SupervisorState = {
  students: [],
  performance: {},
  loading: false,
  saving: false,
};

export const fetchSupervisedStudents = createAsyncThunk('supervisor/students', async () => {
  const res = await api.get('/supervisor/students');
  return res.data.data as SupervisedStudent[];
});

export const fetchStudentPerformance = createAsyncThunk(
  'supervisor/performance',
  async (studentId: number) => {
    const res = await api.get(`/supervisor/students/${studentId}/performance`);
    return { studentId, data: res.data.data as StudentPerformance };
  }
);

export const assignStudent = createAsyncThunk('supervisor/assign', async (studentId: number) => {
  await api.post('/supervisor/students', { student_id: studentId });
  return studentId;
});

export const removeStudent = createAsyncThunk('supervisor/remove', async (studentId: number) => {
  await api.delete(`/supervisor/students/${studentId}`);
  return studentId;
});

const supervisorSlice = createSlice({
  name: 'supervisor',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupervisedStudents.pending, (s) => { s.loading = true; })
      .addCase(fetchSupervisedStudents.fulfilled, (s, a) => { s.loading = false; s.students = a.payload; })
      .addCase(fetchSupervisedStudents.rejected, (s) => { s.loading = false; })

      .addCase(fetchStudentPerformance.fulfilled, (s, a) => {
        s.performance[a.payload.studentId] = a.payload.data;
      })

      .addCase(removeStudent.fulfilled, (s, a) => {
        s.students = s.students.filter((st) => st.id !== a.payload);
      });
  },
});

export default supervisorSlice.reducer;
