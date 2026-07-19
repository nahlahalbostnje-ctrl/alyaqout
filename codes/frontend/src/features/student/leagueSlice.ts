import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface League {
  id:                  number;
  name:                string;
  type:                '1v1' | 'group';
  status:              'pending' | 'active' | 'ended';
  participants_count:  number;
  max_participants:    number | null;
  starts_at:           string | null;
  ends_at:             string | null;
  i_joined:            boolean;
}

export interface LeagueLeaderboardEntry {
  rank:       number;
  student_id: number;
  name:       string;
  score:      number;
  is_me:      boolean;
}

export interface LeagueDetail {
  league:      League;
  leaderboard: LeagueLeaderboardEntry[];
}

interface LeagueState {
  leagues:      League[];
  activeLeague: LeagueDetail | null;
  loading:      boolean;
  error:        string | null;
}

const initialState: LeagueState = {
  leagues:      [],
  activeLeague: null,
  loading:      false,
  error:        null,
};

export const fetchLeagues = createAsyncThunk(
  'league/fetchAll',
  async (type: '1v1' | 'group' | undefined = undefined, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/student/leagues', {
        params: type ? { type } : undefined,
      });
      return data.leagues as League[];
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'فشل جلب الدوريات');
    }
  }
);

export const joinLeague = createAsyncThunk(
  'league/join',
  async (leagueId: number, { rejectWithValue }) => {
    try {
      await api.post(`/student/leagues/${leagueId}/join`);
      return leagueId;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'فشل الانضمام للدوري');
    }
  }
);

export const fetchLeagueDetail = createAsyncThunk(
  'league/fetchDetail',
  async (leagueId: number, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/student/leagues/${leagueId}`);
      return data as LeagueDetail;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'فشل جلب تفاصيل الدوري');
    }
  }
);

const leagueSlice = createSlice({
  name: 'league',
  initialState,
  reducers: {
    clearActiveLeague: (state) => { state.activeLeague = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeagues.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchLeagues.fulfilled, (s, a) => { s.loading = false; s.leagues = a.payload; })
      .addCase(fetchLeagues.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(joinLeague.fulfilled, (s, a) => {
        const l = s.leagues.find((x) => x.id === a.payload);
        if (l) { l.i_joined = true; l.participants_count += 1; }
        if (s.activeLeague?.league.id === a.payload) {
          s.activeLeague.league.i_joined = true;
        }
      })

      .addCase(fetchLeagueDetail.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchLeagueDetail.fulfilled, (s, a) => { s.loading = false; s.activeLeague = a.payload; })
      .addCase(fetchLeagueDetail.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });
  },
});

export const { clearActiveLeague } = leagueSlice.actions;
export default leagueSlice.reducer;
