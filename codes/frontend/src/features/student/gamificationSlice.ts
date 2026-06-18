import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

interface PointRecord {
  action:      string;
  label:       string;
  points:      number;
  description: string;
  earned_at:   string;
}

interface LeaderboardEntry {
  rank:    number;
  name:    string;
  points:  number;
  is_me:   boolean;
}

interface GamificationState {
  totalPoints:  number;
  pointsTable:  Record<string, number>;
  history:      PointRecord[];
  leaderboard:  LeaderboardEntry[];
  myRank:       number | null;
  loading:      boolean;
  error:        string | null;
}

const initialState: GamificationState = {
  totalPoints:  0,
  pointsTable:  {},
  history:      [],
  leaderboard:  [],
  myRank:       null,
  loading:      false,
  error:        null,
};

export const fetchMyPoints = createAsyncThunk(
  'gamification/fetchMyPoints',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/student/points');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل جلب النقاط');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'gamification/fetchLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/student/leaderboard');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'فشل جلب الترتيب');
    }
  }
);

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPoints.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyPoints.fulfilled, (state, action) => {
        state.loading     = false;
        state.totalPoints = action.payload.total_points;
        state.pointsTable = action.payload.points_table;
        state.history     = action.payload.history;
      })
      .addCase(fetchMyPoints.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      .addCase(fetchLeaderboard.pending, (state) => { state.loading = true; })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading     = false;
        state.leaderboard = action.payload.leaderboard;
        state.myRank      = action.payload.my_rank;
        state.totalPoints = action.payload.my_points;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export default gamificationSlice.reducer;
