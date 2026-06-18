import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface ProgressVideo {
  id: number;
  title: string;
  duration: number;
  type: string;
  completed: boolean;
}

export interface ProgressLesson {
  id: number;
  title: string;
  progress: number;
  videos: ProgressVideo[];
}

export interface ProgressUnit {
  id: number;
  title: string;
  progress: number;
  lessons: ProgressLesson[];
}

export interface CourseProgress {
  id: number;
  title: string;
  progress: number;
}

interface CourseProgressState {
  course: CourseProgress | null;
  units: ProgressUnit[];
  loading: boolean;
  activeVideo: { id: number; title: string; video_url: string; type: string; duration: number } | null;
}

const initialState: CourseProgressState = {
  course: null,
  units: [],
  loading: false,
  activeVideo: null,
};

export const fetchCourseContent = createAsyncThunk(
  'courseProgress/fetch',
  async (courseId: number) => {
    const res = await api.get(`/student/courses/${courseId}/content`);
    return res.data as { course: CourseProgress; units: ProgressUnit[] };
  }
);

export const openVideo = createAsyncThunk(
  'courseProgress/openVideo',
  async (videoId: number) => {
    const res = await api.get(`/student/videos/${videoId}/watch`);
    return { id: videoId, ...res.data } as { id: number; title: string; video_url: string; type: string; duration: number };
  }
);

export const completeVideo = createAsyncThunk(
  'courseProgress/complete',
  async (payload: { videoId: number; watchDuration?: number }) => {
    await api.post(`/student/videos/${payload.videoId}/complete`, { watch_duration: payload.watchDuration });
    return payload.videoId;
  }
);

const courseProgressSlice = createSlice({
  name: 'courseProgress',
  initialState,
  reducers: {
    closeVideo(state) {
      state.activeVideo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseContent.pending, (state) => { state.loading = true; })
      .addCase(fetchCourseContent.fulfilled, (state, action) => {
        state.loading = false;
        state.course = action.payload.course;
        state.units = action.payload.units;
      })
      .addCase(fetchCourseContent.rejected, (state) => { state.loading = false; })

      .addCase(openVideo.fulfilled, (state, action) => {
        state.activeVideo = action.payload;
      })

      .addCase(completeVideo.fulfilled, (state, action) => {
        const videoId = action.payload;
        for (const unit of state.units) {
          for (const lesson of unit.lessons) {
            const v = lesson.videos.find((v) => v.id === videoId);
            if (v) {
              v.completed = true;
              const done = lesson.videos.filter((v) => v.completed).length;
              lesson.progress = Math.round(done / lesson.videos.length * 100);
            }
          }
          const totalVids = unit.lessons.reduce((s, l) => s + l.videos.length, 0);
          const doneVids  = unit.lessons.reduce((s, l) => s + l.videos.filter((v) => v.completed).length, 0);
          unit.progress = totalVids > 0 ? Math.round(doneVids / totalVids * 100) : 0;
        }
        if (state.course) {
          const totalVids = state.units.reduce((s, u) => s + u.lessons.reduce((ss, l) => ss + l.videos.length, 0), 0);
          const doneVids  = state.units.reduce((s, u) => s + u.lessons.reduce((ss, l) => ss + l.videos.filter((v) => v.completed).length, 0), 0);
          state.course.progress = totalVids > 0 ? Math.round(doneVids / totalVids * 100) : 0;
        }
      });
  },
});

export const { closeVideo } = courseProgressSlice.actions;
export default courseProgressSlice.reducer;
