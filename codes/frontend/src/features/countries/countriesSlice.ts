import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axios';

export interface CountryAdmin {
  id:        number;
  name:      string;
  phone:     string;
  is_active: boolean;
}

export interface Country {
  id:         number;
  name:       string;
  code:       string;
  currency:   string;
  phone_code: string;
  is_active:  boolean;
  sort_order: number;
  admins:     CountryAdmin[];
}

interface CountriesState {
  list:    Country[];
  loading: boolean;
  error:   string | null;
}

const initialState: CountriesState = { list: [], loading: false, error: null };

/* ── Thunks ── */

export const fetchCountries = createAsyncThunk('countries/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/super-admin/countries');
    return data.data as Country[];
  } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'فشل تحميل الدول'); }
});

export const addCountry = createAsyncThunk('countries/add', async (payload: Omit<Country, 'id' | 'admins'>, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/super-admin/countries', payload);
    return data.data as Country;
  } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'فشل إضافة الدولة'); }
});

export const updateCountry = createAsyncThunk('countries/update', async (payload: Partial<Country> & { id: number }, { rejectWithValue }) => {
  try {
    const { id, ...body } = payload;
    const { data } = await api.put(`/super-admin/countries/${id}`, body);
    return data.data as Country;
  } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'فشل تعديل الدولة'); }
});

export const deleteCountry = createAsyncThunk('countries/delete', async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/super-admin/countries/${id}`);
    return id;
  } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'فشل حذف الدولة'); }
});

export const toggleCountry = createAsyncThunk('countries/toggle', async (id: number, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/super-admin/countries/${id}/toggle`);
    return data.data as Country;
  } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'فشل تغيير الحالة'); }
});

export const createCountryAdmin = createAsyncThunk(
  'countries/createAdmin',
  async (payload: { countryId: number; name: string; phone: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/super-admin/countries/${payload.countryId}/admins`, {
        name: payload.name, phone: payload.phone,
      });
      return { countryId: payload.countryId, admin: data.data as CountryAdmin };
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'فشل إنشاء المدير'); }
  }
);

export const updateCountryAdmin = createAsyncThunk(
  'countries/updateAdmin',
  async (payload: { countryId: number; adminId: number; name: string; phone: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/super-admin/countries/${payload.countryId}/admins/${payload.adminId}`, {
        name: payload.name, phone: payload.phone,
      });
      return { countryId: payload.countryId, admin: data.data as CountryAdmin };
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'فشل تعديل المدير'); }
  }
);

export const toggleCountryAdmin = createAsyncThunk(
  'countries/toggleAdmin',
  async (payload: { countryId: number; adminId: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/super-admin/countries/${payload.countryId}/admins/${payload.adminId}/toggle`);
      return { countryId: payload.countryId, admin: data.data as CountryAdmin };
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'فشل تغيير حالة المدير'); }
  }
);

export const deleteCountryAdmin = createAsyncThunk(
  'countries/deleteAdmin',
  async (payload: { countryId: number; adminId: number }, { rejectWithValue }) => {
    try {
      await api.delete(`/super-admin/countries/${payload.countryId}/admins/${payload.adminId}`);
      return payload;
    } catch (err: any) { return rejectWithValue(err.response?.data?.message || 'فشل حذف المدير'); }
  }
);

/* ── Slice ── */

const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending,  (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCountries.fulfilled,(state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchCountries.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(addCountry.fulfilled, (state, action) => { state.list.push(action.payload); })

      .addCase(updateCountry.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })

      .addCase(deleteCountry.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      })

      .addCase(toggleCountry.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })

      .addCase(createCountryAdmin.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.countryId);
        if (idx !== -1) state.list[idx].admins.push(action.payload.admin);
      })

      .addCase(updateCountryAdmin.fulfilled, (state, action) => {
        const ci = state.list.findIndex((c) => c.id === action.payload.countryId);
        if (ci !== -1) {
          const ai = state.list[ci].admins.findIndex((a) => a.id === action.payload.admin.id);
          if (ai !== -1) state.list[ci].admins[ai] = action.payload.admin;
        }
      })

      .addCase(toggleCountryAdmin.fulfilled, (state, action) => {
        const ci = state.list.findIndex((c) => c.id === action.payload.countryId);
        if (ci !== -1) {
          const ai = state.list[ci].admins.findIndex((a) => a.id === action.payload.admin.id);
          if (ai !== -1) state.list[ci].admins[ai] = action.payload.admin;
        }
      })

      .addCase(deleteCountryAdmin.fulfilled, (state, action) => {
        const ci = state.list.findIndex((c) => c.id === action.payload.countryId);
        if (ci !== -1) {
          state.list[ci].admins = state.list[ci].admins.filter((a) => a.id !== action.payload.adminId);
        }
      });
  },
});

export default countriesSlice.reducer;
