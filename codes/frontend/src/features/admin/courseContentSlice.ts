import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface VideoItem {
  id: number;
  title: string;
  video_url: string;
  duration: number;
  type: 'video' | 'pdf' | 'attachment';
  is_review: boolean;
  sort_order: number;
}

export interface LessonItem {
  id: number;
  title: string;
  sort_order: number;
  videos_count: number;
  videos?: VideoItem[];
}

export interface UnitItem {
  id: number;
  title: string;
  sort_order: number;
  lessons_count: number;
  lessons?: LessonItem[];
}

interface CourseContentState {
  units: UnitItem[];
  lessons: Record<number, LessonItem[]>;
  videos: Record<number, VideoItem[]>;
  loading: boolean;
  saving: boolean;
}

const initialState: CourseContentState = {
  units: [],
  lessons: {},
  videos: {},
  loading: false,
  saving: false,
};

/* ── Thunks ── */

export const fetchUnits = createAsyncThunk(
  'courseContent/fetchUnits',
  async (courseId: number) => {
    const res = await api.get(`/admin/courses/${courseId}/units`);
    return { courseId, units: res.data.data as UnitItem[] };
  }
);

export const addUnit = createAsyncThunk(
  'courseContent/addUnit',
  async (payload: { courseId: number; title: string }) => {
    const res = await api.post(`/admin/courses/${payload.courseId}/units`, { title: payload.title });
    return res.data.data as UnitItem;
  }
);

export const updateUnit = createAsyncThunk(
  'courseContent/updateUnit',
  async (payload: { courseId: number; unitId: number; title: string }) => {
    const res = await api.put(`/admin/courses/${payload.courseId}/units/${payload.unitId}`, { title: payload.title });
    return res.data.data as UnitItem;
  }
);

export const deleteUnit = createAsyncThunk(
  'courseContent/deleteUnit',
  async (payload: { courseId: number; unitId: number }) => {
    await api.delete(`/admin/courses/${payload.courseId}/units/${payload.unitId}`);
    return payload.unitId;
  }
);

export const fetchLessons = createAsyncThunk(
  'courseContent/fetchLessons',
  async (unitId: number) => {
    const res = await api.get(`/admin/units/${unitId}/lessons`);
    return { unitId, lessons: res.data.data as LessonItem[] };
  }
);

export const addLesson = createAsyncThunk(
  'courseContent/addLesson',
  async (payload: { unitId: number; title: string }) => {
    const res = await api.post(`/admin/units/${payload.unitId}/lessons`, { title: payload.title });
    return { unitId: payload.unitId, lesson: res.data.data as LessonItem };
  }
);

export const updateLesson = createAsyncThunk(
  'courseContent/updateLesson',
  async (payload: { unitId: number; lessonId: number; title: string }) => {
    const res = await api.put(`/admin/units/${payload.unitId}/lessons/${payload.lessonId}`, {
      title: payload.title,
    });
    return { unitId: payload.unitId, lesson: res.data.data as LessonItem };
  }
);

export const deleteLesson = createAsyncThunk(
  'courseContent/deleteLesson',
  async (payload: { unitId: number; lessonId: number }) => {
    await api.delete(`/admin/units/${payload.unitId}/lessons/${payload.lessonId}`);
    return payload;
  }
);

export const fetchVideos = createAsyncThunk(
  'courseContent/fetchVideos',
  async (lessonId: number) => {
    const res = await api.get(`/admin/lessons/${lessonId}/videos`);
    return { lessonId, videos: res.data.data as VideoItem[] };
  }
);

export const addVideo = createAsyncThunk(
  'courseContent/addVideo',
  async (payload: {
    lessonId: number;
    title: string;
    video_url: string;
    type: string;
    duration: number;
    is_review: boolean;
  }) => {
    const res = await api.post(`/admin/lessons/${payload.lessonId}/videos`, payload);
    return { lessonId: payload.lessonId, video: res.data.data as VideoItem };
  }
);

export const updateVideo = createAsyncThunk(
  'courseContent/updateVideo',
  async (payload: {
    lessonId: number;
    videoId: number;
    title: string;
    video_url: string;
    type: string;
    duration: number;
    is_review: boolean;
  }) => {
    const { lessonId, videoId, ...body } = payload;
    const res = await api.put(`/admin/lessons/${lessonId}/videos/${videoId}`, body);
    return { lessonId, video: res.data.data as VideoItem };
  }
);

export const deleteVideo = createAsyncThunk(
  'courseContent/deleteVideo',
  async (payload: { lessonId: number; videoId: number }) => {
    await api.delete(`/admin/lessons/${payload.lessonId}/videos/${payload.videoId}`);
    return payload;
  }
);

/* ── Slice ── */

const courseContentSlice = createSlice({
  name: 'courseContent',
  initialState,
  reducers: {
    clearContent(state) {
      state.units = [];
      state.lessons = {};
      state.videos = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnits.pending, (state) => { state.loading = true; })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.units = action.payload.units;
      })
      .addCase(fetchUnits.rejected, (state) => { state.loading = false; })

      .addCase(addUnit.pending, (state) => { state.saving = true; })
      .addCase(addUnit.fulfilled, (state, action) => {
        state.saving = false;
        state.units.push(action.payload);
      })
      .addCase(addUnit.rejected, (state) => { state.saving = false; })

      .addCase(updateUnit.fulfilled, (state, action) => {
        const idx = state.units.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) {
          state.units[idx] = {
            ...state.units[idx],
            ...action.payload,
            lessons_count: state.units[idx].lessons_count,
          };
        }
      })

      .addCase(deleteUnit.fulfilled, (state, action: PayloadAction<number>) => {
        state.units = state.units.filter((u) => u.id !== action.payload);
      })

      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.lessons[action.payload.unitId] = action.payload.lessons;
      })

      .addCase(addLesson.pending, (state) => { state.saving = true; })
      .addCase(addLesson.fulfilled, (state, action) => {
        state.saving = false;
        const { unitId, lesson } = action.payload;
        if (!state.lessons[unitId]) state.lessons[unitId] = [];
        state.lessons[unitId].push(lesson);
        const unit = state.units.find((u) => u.id === unitId);
        if (unit) unit.lessons_count += 1;
      })
      .addCase(addLesson.rejected, (state) => { state.saving = false; })

      .addCase(updateLesson.fulfilled, (state, action) => {
        const { unitId, lesson } = action.payload;
        const list = state.lessons[unitId] ?? [];
        const idx = list.findIndex((l) => l.id === lesson.id);
        if (idx !== -1) {
          state.lessons[unitId][idx] = {
            ...list[idx],
            ...lesson,
            videos_count: list[idx].videos_count,
          };
        }
      })

      .addCase(deleteLesson.fulfilled, (state, action) => {
        const { unitId, lessonId } = action.payload;
        state.lessons[unitId] = (state.lessons[unitId] ?? []).filter((l) => l.id !== lessonId);
        const unit = state.units.find((u) => u.id === unitId);
        if (unit && unit.lessons_count > 0) unit.lessons_count -= 1;
      })

      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.videos[action.payload.lessonId] = action.payload.videos;
      })

      .addCase(addVideo.pending, (state) => { state.saving = true; })
      .addCase(addVideo.fulfilled, (state, action) => {
        state.saving = false;
        const { lessonId, video } = action.payload;
        if (!state.videos[lessonId]) state.videos[lessonId] = [];
        state.videos[lessonId].push(video);
      })
      .addCase(addVideo.rejected, (state) => { state.saving = false; })

      .addCase(updateVideo.fulfilled, (state, action) => {
        const { lessonId, video } = action.payload;
        const list = state.videos[lessonId] ?? [];
        const idx = list.findIndex((v) => v.id === video.id);
        if (idx !== -1) state.videos[lessonId][idx] = video;
      })

      .addCase(deleteVideo.fulfilled, (state, action) => {
        const { lessonId, videoId } = action.payload;
        state.videos[lessonId] = (state.videos[lessonId] ?? []).filter((v) => v.id !== videoId);
      });
  },
});

export const { clearContent } = courseContentSlice.actions;
export default courseContentSlice.reducer;
