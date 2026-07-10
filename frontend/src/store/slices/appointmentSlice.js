import { createSlice } from '@reduxjs/toolkit';

const getTodayString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const initialState = {
  list: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  },
  slots: [],
  slotsLoading: false,
  filters: {
    doctor: '',
    department: '',
    date: getTodayString(),
    status: '',
    patientSearch: '',
    doctorSearch: '',
    mobileSearch: '',
    page: 1,
    limit: 10
  },
  loading: false,
  error: null
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (state, action) => {
      const { appointments, meta } = action.payload;
      state.list = appointments;
      state.meta = meta;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSlots: (state, action) => {
      state.slots = action.payload;
      state.slotsLoading = false;
    },
    setSlotsLoading: (state, action) => {
      state.slotsLoading = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        doctor: '',
        department: '',
        date: getTodayString(),
        status: '',
        patientSearch: '',
        doctorSearch: '',
        mobileSearch: '',
        page: 1,
        limit: 10
      };
    },
    // Used for Real-Time updates (Socket.IO integration)
    addAppointmentToList: (state, action) => {
      const newApp = action.payload;
      // Insert at index 0 if it fits our current filters (or just append)
      const exists = state.list.some(app => app._id === newApp._id);
      if (!exists) {
        state.list = [newApp, ...state.list];
        state.meta.total += 1;
      }
    },
    updateAppointmentInList: (state, action) => {
      const updated = action.payload;
      state.list = state.list.map((app) =>
        app._id === updated._id ? { ...app, ...updated } : app
      );
    },
    removeAppointmentFromList: (state, action) => {
      const { id } = action.payload;
      state.list = state.list.filter((app) => app._id !== id);
    }
  }
});

export const {
  setAppointments,
  setLoading,
  setError,
  setSlots,
  setSlotsLoading,
  setFilters,
  resetFilters,
  addAppointmentToList,
  updateAppointmentInList,
  removeAppointmentFromList
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
export const selectAppointmentsList = (state) => state.appointments.list;
export const selectAppointmentsMeta = (state) => state.appointments.meta;
export const selectAvailableSlots = (state) => state.appointments.slots;
export const selectAppointmentFilters = (state) => state.appointments.filters;
