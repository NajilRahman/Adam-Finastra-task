import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import appointmentsReducer from './slices/appointmentSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentsReducer
  }
});
