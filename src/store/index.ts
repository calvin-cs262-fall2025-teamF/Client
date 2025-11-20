import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import applicationsReducer from './applicationsSlice';
import userTargetCompaniesReducer from './userTargetCompaniesSlice';
import resumeReducer from './resumeSlice';
import checklistReducer from './checklistSlice';
import { storageMiddleware } from './middleware';

export const store = configureStore({
  reducer: {
    user: userReducer,
    applications: applicationsReducer,
    userTargetCompanies: userTargetCompaniesReducer,
    resume: resumeReducer,
    checklist: checklistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(storageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;