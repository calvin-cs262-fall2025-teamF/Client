import { Middleware } from '@reduxjs/toolkit';
import { StorageService } from '../utils/storage';
import { RootState } from './index';

export const storageMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: any) => {
  const result = next(action);
  const state = store.getState();

  // Auto-save user data when user actions are dispatched
  if (action.type && action.type.startsWith('user/')) {
    if (state.user.currentUser) {
      StorageService.saveUser(state.user.currentUser).catch(console.error);
    }
  }

  // Auto-save applications data when application actions are dispatched
  if (action.type && action.type.startsWith('applications/')) {
    if (state.user.currentUser) {
      StorageService.saveApplications(
        state.user.currentUser.id,
        state.applications.applications
      ).catch(console.error);

      StorageService.saveWeeklyGoal(
        state.user.currentUser.id,
        state.applications.weeklyGoal
      ).catch(console.error);
    }
  }

  // Auto-save target companies data when target company actions are dispatched
  if (action.type && action.type.startsWith('userTargetCompanies/')) {
    if (state.user.currentUser) {
      StorageService.saveUserTargetCompanies(
        state.user.currentUser.id,
        state.userTargetCompanies.targetCompanies
      ).catch(console.error);
    }
  }

  // Auto-save resume data when resume actions are dispatched
  if (action.type && action.type.startsWith('resume/')) {
    if (state.user.currentUser) {
      StorageService.saveUserResumes(
        state.user.currentUser.id,
        state.resume.resumes
      ).catch(console.error);

      StorageService.saveTailoredResumes(
        state.user.currentUser.id,
        state.resume.tailoredResumes
      ).catch(console.error);
    }
  }

  return result;
};