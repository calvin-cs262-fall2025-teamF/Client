import { store } from '../store';
import { setUser } from '../store/userSlice';
import { loadApplications, setWeeklyGoal } from '../store/applicationsSlice';
import { loadUserTargetCompanies, loadCustomCompanies } from '../store/userTargetCompaniesSlice';
import { loadResumes, loadTailoredResumes } from '../store/resumeSlice';
import { StorageService } from './storage';

export const initializeApp = async (): Promise<void> => {
  try {
    // Try to load the last logged in user (this is a simple implementation)
    // In a real app, you might store the last logged in user separately
    const userNames = await StorageService.getAllStoredUserNames();

    if (userNames.length > 0) {
      // For demo purposes, we'll just try to load the first user found
      // In a real app, you'd implement proper session management
      const userData = await StorageService.getUser(userNames[0]);

      if (userData) {
        // Load user data
        store.dispatch(setUser(userData));

        // Load associated applications, weekly goal, target companies, custom companies, and resumes
        const applications = await StorageService.getApplications(userData.id);
        const weeklyGoal = await StorageService.getWeeklyGoal(userData.id);
        const userTargetCompanies = await StorageService.getUserTargetCompanies(userData.id);
        const customCompanies = await StorageService.getCustomCompanies(userData.id);
        const resumes = await StorageService.getUserResumes(userData.id);
        const tailoredResumes = await StorageService.getTailoredResumes(userData.id);

        store.dispatch(loadApplications(applications));
        store.dispatch(setWeeklyGoal(weeklyGoal));
        store.dispatch(loadUserTargetCompanies(userTargetCompanies));
        store.dispatch(loadCustomCompanies(customCompanies));
        store.dispatch(loadResumes(resumes));
        store.dispatch(loadTailoredResumes(tailoredResumes));
      }
    }
  } catch (error) {
    console.error('Error initializing app:', error);
    // Don't throw error, just log it and continue with empty state
  }
};