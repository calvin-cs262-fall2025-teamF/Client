import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the structure for tracking user progress on checklist items
interface ChecklistProgress {
  [companyId: string]: {
    [itemId: string]: boolean; // itemId -> completion status
  };
}

interface ChecklistState {
  progress: ChecklistProgress;
  isLoading: boolean;
}

const initialState: ChecklistState = {
  progress: {},
  isLoading: false,
};

const checklistSlice = createSlice({
  name: 'checklist',
  initialState,
  reducers: {
    toggleChecklistItem: (state, action: PayloadAction<{ companyId: string; itemId: string }>) => {
      const { companyId, itemId } = action.payload;

      // Initialize company progress if it doesn't exist
      if (!state.progress[companyId]) {
        state.progress[companyId] = {};
      }

      // Toggle the completion status
      const currentStatus = state.progress[companyId][itemId] || false;
      state.progress[companyId][itemId] = !currentStatus;
    },

    setChecklistItemStatus: (state, action: PayloadAction<{ companyId: string; itemId: string; completed: boolean }>) => {
      const { companyId, itemId, completed } = action.payload;

      // Initialize company progress if it doesn't exist
      if (!state.progress[companyId]) {
        state.progress[companyId] = {};
      }

      state.progress[companyId][itemId] = completed;
    },

    resetCompanyChecklist: (state, action: PayloadAction<string>) => {
      const companyId = action.payload;

      // Reset all items for the company to false
      if (state.progress[companyId]) {
        Object.keys(state.progress[companyId]).forEach(itemId => {
          state.progress[companyId][itemId] = false;
        });
      }
    },

    removeCompanyProgress: (state, action: PayloadAction<string>) => {
      const companyId = action.payload;

      // Remove all progress for the company when it's removed from targets
      delete state.progress[companyId];
    },

    loadChecklistProgress: (state, action: PayloadAction<ChecklistProgress>) => {
      state.progress = action.payload;
      state.isLoading = false;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  toggleChecklistItem,
  setChecklistItemStatus,
  resetCompanyChecklist,
  removeCompanyProgress,
  loadChecklistProgress,
  setLoading,
} = checklistSlice.actions;

export default checklistSlice.reducer;