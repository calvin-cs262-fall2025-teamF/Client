import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Resume, TailoredResume, ResumeTailoringRequest } from '../types';

interface ResumeState {
  resumes: Resume[];
  tailoredResumes: TailoredResume[];
  isProcessing: boolean;
  currentTailoringRequest: ResumeTailoringRequest | null;
}

const initialState: ResumeState = {
  resumes: [],
  tailoredResumes: [],
  isProcessing: false,
  currentTailoringRequest: null,
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    loadResumes: (state, action: PayloadAction<Resume[]>) => {
      state.resumes = action.payload;
    },

    addResume: (state, action: PayloadAction<Resume>) => {
      state.resumes.push(action.payload);
    },

    deleteResume: (state, action: PayloadAction<string>) => {
      state.resumes = state.resumes.filter(resume => resume.id !== action.payload);
      // Also remove any tailored versions of this resume
      state.tailoredResumes = state.tailoredResumes.filter(
        tailored => tailored.originalResumeId !== action.payload
      );
    },

    setPrimaryResume: (state, action: PayloadAction<string>) => {
      state.resumes.forEach(resume => {
        resume.isPrimary = resume.id === action.payload;
      });
    },

    updateResumeName: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const resume = state.resumes.find(r => r.id === action.payload.id);
      if (resume) {
        resume.name = action.payload.name;
      }
    },

    startResumeTailoring: (state, action: PayloadAction<ResumeTailoringRequest>) => {
      state.isProcessing = true;
      state.currentTailoringRequest = action.payload;
    },

    completeTailoring: (state, action: PayloadAction<TailoredResume>) => {
      state.isProcessing = false;
      state.currentTailoringRequest = null;
      state.tailoredResumes.push(action.payload);

      // Add to the original resume's tailored versions
      const originalResume = state.resumes.find(r => r.id === action.payload.originalResumeId);
      if (originalResume) {
        if (!originalResume.tailoredVersions) {
          originalResume.tailoredVersions = [];
        }
        originalResume.tailoredVersions.push(action.payload);
      }
    },

    failTailoring: (state) => {
      state.isProcessing = false;
      state.currentTailoringRequest = null;
    },

    loadTailoredResumes: (state, action: PayloadAction<TailoredResume[]>) => {
      state.tailoredResumes = action.payload;

      // Update the tailored versions in the original resumes
      state.resumes.forEach(resume => {
        resume.tailoredVersions = state.tailoredResumes.filter(
          tailored => tailored.originalResumeId === resume.id
        );
      });
    },

    clearTailoringHistory: (state) => {
      state.tailoredResumes = [];
      state.resumes.forEach(resume => {
        resume.tailoredVersions = [];
      });
    },

    deleteTailoredResume: (state, action: PayloadAction<string>) => {
      const tailoredResume = state.tailoredResumes.find(t => t.id === action.payload);
      if (tailoredResume) {
        // Remove from tailored resumes array
        state.tailoredResumes = state.tailoredResumes.filter(t => t.id !== action.payload);

        // Remove from original resume's tailored versions
        const originalResume = state.resumes.find(r => r.id === tailoredResume.originalResumeId);
        if (originalResume && originalResume.tailoredVersions) {
          originalResume.tailoredVersions = originalResume.tailoredVersions.filter(
            t => t.id !== action.payload
          );
        }
      }
    },
  },
});

export const {
  loadResumes,
  addResume,
  deleteResume,
  setPrimaryResume,
  updateResumeName,
  startResumeTailoring,
  completeTailoring,
  failTailoring,
  loadTailoredResumes,
  clearTailoringHistory,
  deleteTailoredResume,
} = resumeSlice.actions;

export default resumeSlice.reducer;