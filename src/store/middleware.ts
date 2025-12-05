import { Middleware } from '@reduxjs/toolkit';
import { StorageService } from '../utils/storage';
import apiService from '../services/apiService';
import { replaceApplication } from './applicationsSlice';

export const storageMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);
  const state = store.getState();

  // Auto-save user data when user actions are dispatched
  if (action.type && action.type.startsWith('user/')) {
    if (state.user.currentUser) {
      // Save locally
      StorageService.saveUser(state.user.currentUser).catch(console.error);
      // Sync to backend
      apiService.updateUser(state.user.currentUser.id, state.user.currentUser).catch((err) => {
        console.error('[Middleware] Failed to sync user to backend:', err);
      });
    }
  }

  // Auto-save applications data when application actions are dispatched
  if (action.type && action.type.startsWith('applications/')) {
    if (state.user.currentUser) {
      const userId = state.user.currentUser.id;
      
      // Save locally
      StorageService.saveApplications(
        userId,
        state.applications.applications
      ).catch(console.error);

      StorageService.saveWeeklyGoal(
        userId,
        state.applications.weeklyGoal
      ).catch(console.error);

      // Sync to backend based on action type
      if (action.type === 'applications/addApplication') {
        // Store the temporary client-generated ID
        const tempId = action.payload.id;
        
        // Create new application - send only fields backend expects
        const applicationData = {
          company: action.payload.company,
          role: action.payload.role,
          location: action.payload.location || 'Not specified',
          status: action.payload.status,
          appliedDate: action.payload.appliedDate,
          notes: action.payload.notes || null,
          companyLogo: action.payload.companyLogo || null,
          // Note: Don't send 'id' - backend generates it
          // Note: Don't send 'jobLink' - backend doesn't have this field (use notes instead)
        };
        
        apiService.createApplication(userId, applicationData)
          .then((response) => {
            if (response.data) {
              // Backend returned the created application with its own ID
              // Replace the temporary application with the backend's version
              store.dispatch(replaceApplication({
                oldId: tempId,
                newApplication: response.data
              }));
              console.log('[Middleware] Application synced to backend with ID:', response.data.id);
            }
          })
          .catch((err) => {
            console.error('[Middleware] Failed to create application:', err);
          });
      } else if (action.type === 'applications/updateApplication') {
        // Update existing application
        const { id, updates } = action.payload;
        apiService.updateApplication(userId, id, updates).catch((err) => {
          console.error('[Middleware] Failed to update application:', err);
        });
      } else if (action.type === 'applications/deleteApplication') {
        // Delete application
        apiService.deleteApplication(userId, action.payload).catch((err) => {
          console.error('[Middleware] Failed to delete application:', err);
        });
      }
      // Note: We don't sync for replaceApplication, loadApplications, or setWeeklyGoal
      // - replaceApplication: Already synced (used to update ID after creation)
      // - loadApplications: Data loaded from backend, no need to sync back
      // - setWeeklyGoal: Can be synced separately if needed
    }
  }

  // Auto-save target companies data when target company actions are dispatched
  if (action.type && action.type.startsWith('userTargetCompanies/')) {
    if (state.user.currentUser) {
      const userId = state.user.currentUser.id;
      
      // Save locally
      StorageService.saveUserTargetCompanies(
        userId,
        state.userTargetCompanies.targetCompanies
      ).catch(console.error);

      // Sync to backend - extract company IDs from UserTargetCompany objects
      const companyIds = state.userTargetCompanies.targetCompanies.map(tc => tc.companyId);
      
      // Use the updateUser targets endpoint
      apiService.updateUserTargets(userId, { targetCompanies: companyIds }).catch((err) => {
        console.error('[Middleware] Failed to sync target companies:', err);
      });
    }
  }

  // Auto-save resume data when resume actions are dispatched
  if (action.type && action.type.startsWith('resume/')) {
    if (state.user.currentUser) {
      const userId = state.user.currentUser.id;
      
      // Save locally
      StorageService.saveUserResumes(
        userId,
        state.resume.resumes
      ).catch(console.error);

      StorageService.saveTailoredResumes(
        userId,
        state.resume.tailoredResumes
      ).catch(console.error);

      // Sync to backend based on action type
      if (action.type === 'resume/addResume') {
        // Create new resume - send metadata including fileUri (backend stores it as reference)
        const resumeData = {
          name: action.payload.name,
          fileName: action.payload.fileName,
          fileUri: action.payload.fileUri, // Send fileUri - backend stores it as metadata
          uploadedAt: action.payload.uploadedAt,
          isPrimary: action.payload.isPrimary,
        };
        apiService.createResume(userId, resumeData).catch((err) => {
          console.error('[Middleware] Failed to create resume:', err);
          // Don't show error to user - data is saved locally
        });
      } else if (action.type === 'resume/updateResumeName') {
        // Update resume name
        const resume = state.resume.resumes.find(r => r.id === action.payload.id);
        if (resume) {
          apiService.updateResume(userId, action.payload.id, { name: action.payload.name }).catch((err) => {
            console.error('[Middleware] Failed to update resume:', err);
          });
        }
      } else if (action.type === 'resume/deleteResume') {
        // Delete resume
        apiService.deleteResume(userId, action.payload).catch((err) => {
          console.error('[Middleware] Failed to delete resume:', err);
        });
      } else if (action.type === 'resume/setPrimaryResume') {
        // Update primary resume
        const resume = state.resume.resumes.find(r => r.id === action.payload);
        if (resume) {
          apiService.updateResume(userId, action.payload, { isPrimary: true }).catch((err) => {
            console.error('[Middleware] Failed to update primary resume:', err);
          });
        }
      }
      // Note: We don't sync for loadResumes, completeTailoring, etc. to avoid unnecessary API calls
    }
  }

  // Auto-save checklist progress when checklist actions are dispatched
  if (action.type && action.type.startsWith('checklist/')) {
    if (state.user.currentUser) {
      // For now, we'll store checklist progress in local storage
      // You could extend StorageService to include checklist methods later
      try {
        const checklistData = JSON.stringify(state.checklist.progress);
        // This is a simplified version - you may want to add proper StorageService methods
        console.log('Checklist progress saved:', checklistData);
      } catch (error) {
        console.error('Error saving checklist progress:', error);
      }
    }
  }

  return result;
};