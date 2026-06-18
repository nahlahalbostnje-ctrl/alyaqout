import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  type: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface BroadcastRecord {
  id: number;
  title: string;
  body: string;
  target_type: string;
  target_value: string | null;
  recipients_count: number;
  sent_by: { id: number; name: string } | null;
  sent_at: string;
}

interface Meta {
  total: number;
  current_page: number;
  last_page: number;
}

interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
  meta: Meta;
  broadcasts: BroadcastRecord[];
  broadcastMeta: Meta;
  loading: boolean;
  broadcastSending: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  meta: { total: 0, current_page: 1, last_page: 1 },
  broadcasts: [],
  broadcastMeta: { total: 0, current_page: 1, last_page: 1 },
  loading: false,
  broadcastSending: false,
};

/* ── Thunks ── */

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async () => {
    const res = await api.get('/notifications');
    return res.data as {
      data: AppNotification[];
      unread_count: number;
      meta: Meta;
    };
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async () => {
    const res = await api.get('/notifications/unread-count');
    return res.data.unread_count as number;
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    return id;
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async () => {
    await api.post('/notifications/mark-all-read');
  }
);

export const sendBroadcast = createAsyncThunk(
  'notifications/broadcast',
  async (payload: {
    title: string;
    body: string;
    target_type: string;
    target_value?: string | null;
  }) => {
    const res = await api.post('/admin/notifications/broadcast', payload);
    return res.data.broadcast as BroadcastRecord;
  }
);

export const fetchBroadcastHistory = createAsyncThunk(
  'notifications/broadcastHistory',
  async () => {
    const res = await api.get('/admin/notifications/history');
    return res.data as { data: BroadcastRecord[]; meta: Meta };
  }
);

/* ── Slice ── */

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.unreadCount = action.payload.unread_count;
        state.meta = action.payload.meta;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })

      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.items.find((i) => i.id === action.payload);
        if (n && !n.is_read) {
          n.is_read = true;
          n.read_at = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.is_read = true;
        });
        state.unreadCount = 0;
      })

      .addCase(sendBroadcast.pending, (state) => {
        state.broadcastSending = true;
      })
      .addCase(sendBroadcast.fulfilled, (state, action) => {
        state.broadcastSending = false;
        state.broadcasts.unshift(action.payload);
        state.broadcastMeta.total += 1;
      })
      .addCase(sendBroadcast.rejected, (state) => {
        state.broadcastSending = false;
      })

      .addCase(fetchBroadcastHistory.fulfilled, (state, action) => {
        state.broadcasts = action.payload.data;
        state.broadcastMeta = action.payload.meta;
      });
  },
});

export const { setUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
