import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface StudentExam {
  id: number;
  title: string;
  duration?: number;
  starts_at?: string;
  course: { id: number; title: string } | null;
  questions_count: number;
  submitted: boolean;
  submitted_at?: string;
}

export interface ExamQuestionItem {
  id: number;
  question: string;
  type: 'mcq' | 'true_false' | 'short';
  options?: string[];
  points: number;
  sort_order: number;
}

export interface StudentHomework {
  id: number;
  title: string;
  description?: string;
  due_date: string;
  course: { id: number; title: string };
  is_overdue: boolean;
  submitted: boolean;
  sub_status?: string;
  grade?: number;
}

interface StudentExamState {
  exams: StudentExam[];
  homeworks: StudentHomework[];
  activeExam: { id: number; title: string; duration?: number; questions: ExamQuestionItem[] } | null;
  result: { score: number; total_points: number } | null;
  loading: boolean;
  submitting: boolean;
}

const initialState: StudentExamState = {
  exams: [],
  homeworks: [],
  activeExam: null,
  result: null,
  loading: false,
  submitting: false,
};

export const fetchStudentExams = createAsyncThunk('studentExam/fetchExams', async () => {
  const res = await api.get('/student/exams');
  return res.data.data as StudentExam[];
});

export const loadExam = createAsyncThunk('studentExam/load', async (examId: number) => {
  const res = await api.get(`/student/exams/${examId}`);
  return res.data as { id: number; title: string; duration?: number; questions: ExamQuestionItem[] };
});

export const submitExam = createAsyncThunk(
  'studentExam/submit',
  async (payload: { examId: number; answers: Record<number, string> }) => {
    const res = await api.post(`/student/exams/${payload.examId}/submit`, { answers: payload.answers });
    return { examId: payload.examId, result: res.data as { score: number; total_points: number } };
  }
);

export const fetchStudentHomework = createAsyncThunk('studentExam/fetchHW', async () => {
  const res = await api.get('/student/homework');
  return res.data.data as StudentHomework[];
});

export const submitHomework = createAsyncThunk(
  'studentExam/submitHW',
  async (payload: { homeworkId: number; file_url: string; notes?: string }) => {
    await api.post(`/student/homework/${payload.homeworkId}/submit`, {
      file_url: payload.file_url, notes: payload.notes,
    });
    return payload.homeworkId;
  }
);

const studentExamSlice = createSlice({
  name: 'studentExam',
  initialState,
  reducers: {
    clearActiveExam(state) { state.activeExam = null; state.result = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentExams.pending, (s) => { s.loading = true; })
      .addCase(fetchStudentExams.fulfilled, (s, a) => { s.loading = false; s.exams = a.payload; })
      .addCase(fetchStudentExams.rejected, (s) => { s.loading = false; })

      .addCase(loadExam.fulfilled, (s, a) => { s.activeExam = a.payload; })

      .addCase(submitExam.pending, (s) => { s.submitting = true; })
      .addCase(submitExam.fulfilled, (s, a) => {
        s.submitting = false;
        s.result = a.payload.result;
        const exam = s.exams.find((e) => e.id === a.payload.examId);
        if (exam) exam.submitted = true;
      })
      .addCase(submitExam.rejected, (s) => { s.submitting = false; })

      .addCase(fetchStudentHomework.pending, (s) => { s.loading = true; })
      .addCase(fetchStudentHomework.fulfilled, (s, a) => { s.loading = false; s.homeworks = a.payload; })
      .addCase(fetchStudentHomework.rejected, (s) => { s.loading = false; })

      .addCase(submitHomework.fulfilled, (s, a) => {
        const hw = s.homeworks.find((h) => h.id === a.payload);
        if (hw) hw.submitted = true;
      });
  },
});

export const { clearActiveExam } = studentExamSlice.actions;
export default studentExamSlice.reducer;
