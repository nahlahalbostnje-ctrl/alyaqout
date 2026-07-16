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
  archived_at?: string | null;
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
  archived_at?: string | null;
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
  error: string | null;
}

const initialState: TeacherExamState = {
  exams: [],
  submissions: {},
  homeworks: [],
  hwSubmissions: {},
  loading: false,
  saving: false,
  error: null,
};

function apiErr(e: unknown, fallback: string): string {
  const err = e as { response?: { data?: { message?: string } } };
  return err.response?.data?.message ?? fallback;
}

export const fetchTeacherExams = createAsyncThunk(
  'teacherExams/fetch',
  async (scope: 'active' | 'archived' | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get('/teacher/exams', { params: { scope: scope ?? 'active' } });
      return res.data.data as TeacherExam[];
    } catch (e) {
      return rejectWithValue(apiErr(e, 'تعذّر جلب الامتحانات'));
    }
  }
);

export const createExam = createAsyncThunk(
  'teacherExams/create',
  async (payload: { course_id: number; title: string; description?: string; duration?: number; questions: ExamQuestion[] }, { rejectWithValue }) => {
    try {
      const res = await api.post('/teacher/exams', payload);
      return res.data.data as TeacherExam;
    } catch (e) {
      return rejectWithValue(apiErr(e, 'تعذّر إنشاء الامتحان'));
    }
  }
);

export const updateExam = createAsyncThunk(
  'teacherExams/update',
  async (payload: { id: number; course_id?: number; title?: string; description?: string; duration?: number }, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const res = await api.put(`/teacher/exams/${id}`, body);
      return res.data.data as TeacherExam;
    } catch (e) {
      return rejectWithValue(apiErr(e, 'تعذّر تعديل الامتحان'));
    }
  }
);

export const archiveExam = createAsyncThunk(
  'teacherExams/archive',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/teacher/exams/${id}/archive`);
      return res.data.data as TeacherExam;
    } catch (e) {
      return rejectWithValue(apiErr(e, 'تعذّر أرشفة الامتحان'));
    }
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
  'teacherExams/hwFetch',
  async (scope: 'active' | 'archived' | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get('/teacher/homework', { params: { scope: scope ?? 'active' } });
      return res.data.data as Homework[];
    } catch (e) {
      return rejectWithValue(apiErr(e, 'تعذّر جلب الواجبات'));
    }
  }
);

export const createHomework = createAsyncThunk(
  'teacherExams/hwCreate',
  async (payload: { course_id: number; title: string; description?: string; due_date: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/teacher/homework', payload);
      return res.data.data as Homework;
    } catch (e) {
      return rejectWithValue(apiErr(e, 'تعذّر إنشاء الواجب'));
    }
  }
);

export const updateHomework = createAsyncThunk(
  'teacherExams/hwUpdate',
  async (payload: { id: number; course_id?: number; title?: string; description?: string; due_date?: string }, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const res = await api.put(`/teacher/homework/${id}`, body);
      return res.data.data as Homework;
    } catch (e) {
      return rejectWithValue(apiErr(e, 'تعذّر تعديل الواجب'));
    }
  }
);

export const archiveHomework = createAsyncThunk(
  'teacherExams/hwArchive',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/teacher/homework/${id}/archive`);
      return res.data.data as Homework;
    } catch (e) {
      return rejectWithValue(apiErr(e, 'تعذّر أرشفة الواجب'));
    }
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
  reducers: {
    clearTeacherExamError(s) { s.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherExams.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchTeacherExams.fulfilled, (s, a) => { s.loading = false; s.exams = a.payload; })
      .addCase(fetchTeacherExams.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(createExam.pending, (s) => { s.saving = true; s.error = null; })
      .addCase(createExam.fulfilled, (s, a) => { s.saving = false; s.exams.unshift(a.payload); })
      .addCase(createExam.rejected, (s, a) => { s.saving = false; s.error = a.payload as string; })

      .addCase(updateExam.pending, (s) => { s.saving = true; s.error = null; })
      .addCase(updateExam.fulfilled, (s, a) => {
        s.saving = false;
        const i = s.exams.findIndex((e) => e.id === a.payload.id);
        if (i !== -1) s.exams[i] = a.payload;
      })
      .addCase(updateExam.rejected, (s, a) => { s.saving = false; s.error = a.payload as string; })

      .addCase(archiveExam.fulfilled, (s, a) => {
        s.exams = s.exams.filter((e) => e.id !== a.payload.id);
      })

      .addCase(fetchExamSubmissions.fulfilled, (s, a) => {
        s.submissions[a.payload.examId] = a.payload.data;
      })

      .addCase(gradeExamSubmission.fulfilled, (s, a) => {
        const subs = s.submissions[a.payload.examId] ?? [];
        const sub = subs.find((ss) => ss.id === a.payload.submissionId);
        if (sub) sub.score = a.payload.score;
      })

      .addCase(fetchTeacherHomework.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchTeacherHomework.fulfilled, (s, a) => { s.loading = false; s.homeworks = a.payload; })
      .addCase(fetchTeacherHomework.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(createHomework.pending, (s) => { s.saving = true; s.error = null; })
      .addCase(createHomework.fulfilled, (s, a) => { s.saving = false; s.homeworks.unshift(a.payload); })
      .addCase(createHomework.rejected, (s, a) => { s.saving = false; s.error = a.payload as string; })

      .addCase(updateHomework.pending, (s) => { s.saving = true; s.error = null; })
      .addCase(updateHomework.fulfilled, (s, a) => {
        s.saving = false;
        const i = s.homeworks.findIndex((h) => h.id === a.payload.id);
        if (i !== -1) s.homeworks[i] = a.payload;
      })
      .addCase(updateHomework.rejected, (s, a) => { s.saving = false; s.error = a.payload as string; })

      .addCase(archiveHomework.fulfilled, (s, a) => {
        s.homeworks = s.homeworks.filter((h) => h.id !== a.payload.id);
      })

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

export const { clearTeacherExamError } = teacherExamSlice.actions;
export default teacherExamSlice.reducer;
