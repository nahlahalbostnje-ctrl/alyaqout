import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface Course {
  id: number;
  category_id: number | null;
  subject_id: number | null;
  grade_id: number | null;
  teacher_id: number | null;
  title: string;
  description: string | null;
  thumbnail: string | null;
  price: string;
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
  subject?: { id: number; name: string; type: string };
  grade?: { id: number; name: string };
  category?: { id: number; name: string; grade_id: number; grade?: { id: number; name: string } };
  teacher?: { id: number; name: string } | null;
}

export interface CoursePayload {
  subject_id: number;
  grade_id?: number | null;
  teacher_id?: number | null;
  title: string;
  description?: string;
  price?: number;
  is_free?: boolean;
  sort_order?: number;
}

interface CoursesState {
  list: Course[];
  loading: boolean;
  error: string | null;
}

const initialState: CoursesState = { list: [], loading: false, error: null };

export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async (subjectId: number | null, { rejectWithValue }) => {
    try {
      const params = subjectId ? { subject_id: subjectId } : {};
      const { data } = await api.get('/admin/courses', { params });
      return data.data as Course[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تحميل الدورات');
    }
  }
);

export const addCourse = createAsyncThunk(
  'courses/add',
  async (payload: CoursePayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/courses', payload);
      return data.data as Course;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.errors?.teacher_id?.[0] || 'فشل إضافة الدورة');
    }
  }
);

/** Metadata update only — does not send teacher_id (assignTeacher uses the same PUT route). */
export const updateCourse = createAsyncThunk(
  'courses/update',
  async (payload: { id: number } & Partial<Omit<CoursePayload, 'subject_id'>> & { subject_id?: number }, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;
      const { data } = await api.put(`/admin/courses/${id}`, body);
      return data.data as Course;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تعديل الدورة');
    }
  }
);

export const toggleCourse = createAsyncThunk(
  'courses/toggle',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/courses/${id}/toggle`);
      return data.data as Course;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل تغيير الحالة');
    }
  }
);

export const assignTeacher = createAsyncThunk(
  'courses/assignTeacher',
  async (payload: { courseId: number; teacherId: number | null }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/courses/${payload.courseId}`, {
        teacher_id: payload.teacherId,
      });
      return data.data as Course;
    } catch (err: any) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.teacher_id?.[0]
        || 'فشل تعيين المعلم';
      return rejectWithValue(msg);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/courses/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل الحذف');
    }
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCourses.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchCourses.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(addCourse.fulfilled,    (s, a) => { s.list.push(a.payload); })
      .addCase(updateCourse.fulfilled, (s, a) => {
        const i = s.list.findIndex((c) => c.id === a.payload.id);
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(assignTeacher.fulfilled, (s, a) => {
        const i = s.list.findIndex((c) => c.id === a.payload.id);
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(toggleCourse.fulfilled, (s, a) => {
        const i = s.list.findIndex((c) => c.id === a.payload.id);
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(deleteCourse.fulfilled, (s, a) => {
        s.list = s.list.filter((c) => c.id !== a.payload);
      });
  },
});

export default coursesSlice.reducer;
