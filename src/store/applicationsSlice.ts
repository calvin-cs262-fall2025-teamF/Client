import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Application, ApplicationStatus } from '../types';

interface ApplicationsState {
  applications: Application[];
  weeklyGoal: number;
}

const initialState: ApplicationsState = {
  applications: [],
  weeklyGoal: 5,
};

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    addApplication: (state, action: PayloadAction<Application>) => {
      state.applications.push(action.payload);
    },
    updateApplication: (state, action: PayloadAction<{ id: string; updates: Partial<Application> }>) => {
      const { id, updates } = action.payload;
      const index = state.applications.findIndex(app => app.id === id);
      if (index !== -1) {
        state.applications[index] = { ...state.applications[index], ...updates };
      }
    },
    deleteApplication: (state, action: PayloadAction<string>) => {
      state.applications = state.applications.filter(app => app.id !== action.payload);
    },
    setWeeklyGoal: (state, action: PayloadAction<number>) => {
      state.weeklyGoal = action.payload;
    },
    loadApplications: (state, action: PayloadAction<Application[]>) => {
      state.applications = action.payload;
    },
  },
});

export const {
  addApplication,
  updateApplication,
  deleteApplication,
  setWeeklyGoal,
  loadApplications
} = applicationsSlice.actions;
export default applicationsSlice.reducer;