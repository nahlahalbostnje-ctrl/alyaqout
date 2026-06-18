import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface ExamQuestion {
  id?: number;
  question: string;
  type: 'mcq' | 'true_false' | 'short';
  options?: string[];
  answer?: string;
  points: number;
}

export interface TeacherExam {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  duration?: number;
  starts_at?: string;
  course: { id: number; title: string } | null;
  questions_count: number;
  submissions_count: number;
  created_at: string;
}

export interface ExamSubmissionRecord {
  id: number;
  student: { id: number; name: string };
  score: number | null;
  total_points: number | null;
  submitted_at: string | null;
  graded_at: string | null;
}

export interface Homework {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  due_date: string;
  course: { id: number; title: string } | null;
  submissions_count: number;
  created_at: string;
}

export interface HomeworkSubmissionRecord {
  id: number;
  student: { id: number; name: string };
  file_url: string | null;
  notes: string | null;
  grade: number | null;
  teacher_feedback: string | null;
  status: string;
  submitted_at: string | null;
}

interface TeacherExamState {
  exams: TeacherExam[];
  submissions: Record<number, ExamSubmissionRecord[]>;
  homeworks: Homework[];
  hwSubmissions: Record<number, HomeworkSubmissionRecord[]>;
  loading: boolean;
  saving: boolean;
}

const initialState: TeacherExamState = {
  exams: [],
  submissions: {},
  homeworks: [],
  hwSubmissions: {},
  loading: false,
  saving: false,
};

export const fetchTeacherExams = createAsyncThunk(
  'teacherExams/fetch', async () => {
    const res = await api.get('/teacher/exams');
    return res.data.data as TeacherExam[];
  }
);

export const createExam = createAsyncThunk(
  'teacherExams/create',
  async (payload: { course_id: number; title: string; description?: string; duration?: number; questions: ExamQuestion[] }) => {
    const res = await api.post('/teacher/exams', payload);
    return res.data.data as TeacherExam;
  }
);

export const deleteExam = createAsyncThunk(
  'teacherExams/delete', async (id: number) => {
    await api.delete(`/teacher/exams/${id}`);
    return id;
  }
);

export const fetchExamSubmissions = createAsyncThunk(
  'teacherExams/submissions', async (examId: number) => {
    const res = await api.get(`/teacher/exams/${examId}/submissions`);
    return { examId, data: res.data.data as ExamSubmissionRecord[] };
  }
);

export const gradeExamSubmission = createAsyncThunk(
  'teacherExams/grade',
  async (payload: { examId: number; submissionId: number; score: number }) => {
    await api.patch(`/teacher/exams/${payload.examId}/submissions/${payload.submissionId}/grade`, { score: payload.score });
    return payload;
  }
);

export const fetchTeacherHomework = createAsyncThunk(
  'teacherExams/hwFetch', async () => {
    const res = await api.get('/teacher/homework');
    return res.data.data as Homework[];
  }
);

export const createHomework = createAsyncThunk(
  'teacherExams/hwCreate',
  async (payload: { course_id: number; title: string; description?: string; due_date: string }) => {
    const res = await api.post('/teacher/homework', payload);
    return res.data.data as Homework;
  }
);

export const deleteHomework = createAsyncThunk(
  'teacherExams/hwDelete', async (id: number) => {
    await api.delete(`/teacher/homework/${id}`);
    return id;
  }
);

export const fetchHomeworkSubmissions = createAsyncThunk(
  'teacherExams/hwSubmissions', async (hwId: number) => {
    const res = await api.get(`/teacher/homework/${hwId}/submissions`);
    return { hwId, data: res.data.data as HomeworkSubmissionRecord[] };
  }
);

export const gradeHomeworkSubmission = createAsyncThunk(
  'teacherExams/hwGrade',
  async (payload: { hwId: number; subId: number; grade: number; feedback?: string }) => {
    await api.patch(`/teacher/homework/${payload.hwId}/submissions/${payload.subId}/grade`, {
      grade: payload.grade, teacher_feedback: payload.feedback,
    });
    return payload;
  }
);

const teacherExamSlice = createSlice({
  name: 'teacherExams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherExams.pending, (s) => { s.loading = true; })
      .addCase(fetchTeacherExams.fulfilled, (s, a) => { s.loading = false; s.exams = a.payload; })
      .addCase(fetchTeacherExams.rejected, (s) => { s.loading = false; })

      .addCase(createExam.pending, (s) => { s.saving = true; })
      .addCase(createExam.fulfilled, (s, a) => { s.saving = false; s.exams.unshift(a.payload); })
      .addCase(createExam.rejected, (s) => { s.saving = false; })

      .addCase(deleteExam.fulfilled, (s, a) => { s.exams = s.exams.filter((e) => e.id !== a.payload); })

      .addCase(fetchExamSubmissions.fulfilled, (s, a) => {
        s.submissions[a.payload.examId] = a.payload.data;
      })

      .addCase(gradeExamSubmission.fulfilled, (s, a) => {
        const subs = s.submissions[a.payload.examId] ?? [];
        const sub = subs.find((ss) => ss.id === a.payload.submissionId);
        if (sub) sub.score = a.payload.score;
      })

      .addCase(fetchTeacherHomework.pending, (s) => { s.loading = true; })
      .addCase(fetchTeacherHomework.fulfilled, (s, a) => { s.loading = false; s.homeworks = a.payload; })
      .addCase(fetchTeacherHomework.rejected, (s) => { s.loading = false; })

      .addCase(createHomework.pending, (s) => { s.saving = true; })
      .addCase(createHomework.fulfilled, (s, a) => { s.saving = false; s.homeworks.unshift(a.payload); })
      .addCase(createHomework.rejected, (s) => { s.saving = false; })

      .addCase(deleteHomework.fulfilled, (s, a) => { s.homeworks = s.homeworks.filter((h) => h.id !== a.payload); })

      .addCase(fetchHomeworkSubmissions.fulfilled, (s, a) => {
        s.hwSubmissions[a.payload.hwId] = a.payload.data;
      })

      .addCase(gradeHomeworkSubmission.fulfilled, (s, a) => {
        const subs = s.hwSubmissions[a.payload.hwId] ?? [];
        const sub = subs.find((ss) => ss.id === a.payload.subId);
        if (sub) { sub.grade = a.payload.grade; sub.status = 'graded'; }
      });
  },
});

export default teacherExamSlice.reducer;
