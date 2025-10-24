import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserTargetCompany } from '../types';

interface UserTargetCompaniesState {
  targetCompanies: UserTargetCompany[];
  isLoading: boolean;
}

const initialState: UserTargetCompaniesState = {
  targetCompanies: [],
  isLoading: false,
};

const userTargetCompaniesSlice = createSlice({
  name: 'userTargetCompanies',
  initialState,
  reducers: {
    addTargetCompany: (state, action: PayloadAction<{ companyId: string; customNotes?: string }>) => {
      const { companyId, customNotes } = action.payload;

      // Check if company is already in targets
      const existingIndex = state.targetCompanies.findIndex(tc => tc.companyId === companyId);
      if (existingIndex === -1) {
        const newTargetCompany: UserTargetCompany = {
          companyId,
          addedAt: new Date().toISOString(),
          priority: state.targetCompanies.length + 1,
          customNotes,
        };
        state.targetCompanies.push(newTargetCompany);
      }
    },

    removeTargetCompany: (state, action: PayloadAction<string>) => {
      const companyId = action.payload;
      state.targetCompanies = state.targetCompanies.filter(tc => tc.companyId !== companyId);

      // Reorder priorities
      state.targetCompanies.forEach((tc, index) => {
        tc.priority = index + 1;
      });
    },

    updateTargetCompanyNotes: (state, action: PayloadAction<{ companyId: string; notes: string }>) => {
      const { companyId, notes } = action.payload;
      const targetCompany = state.targetCompanies.find(tc => tc.companyId === companyId);
      if (targetCompany) {
        targetCompany.customNotes = notes;
      }
    },

    reorderTargetCompanies: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      if (fromIndex >= 0 && fromIndex < state.targetCompanies.length &&
          toIndex >= 0 && toIndex < state.targetCompanies.length) {
        const [movedItem] = state.targetCompanies.splice(fromIndex, 1);
        state.targetCompanies.splice(toIndex, 0, movedItem);

        // Update priorities
        state.targetCompanies.forEach((tc, index) => {
          tc.priority = index + 1;
        });
      }
    },

    loadUserTargetCompanies: (state, action: PayloadAction<UserTargetCompany[]>) => {
      state.targetCompanies = action.payload;
      state.isLoading = false;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    initializeTargetCompaniesFromSignup: (state, action: PayloadAction<string[]>) => {
      // Initialize target companies from sign-up matched company IDs
      const companyIds = action.payload;
      state.targetCompanies = companyIds.map((companyId, index) => ({
        companyId,
        addedAt: new Date().toISOString(),
        priority: index + 1,
      }));
    },
  },
});

export const {
  addTargetCompany,
  removeTargetCompany,
  updateTargetCompanyNotes,
  reorderTargetCompanies,
  loadUserTargetCompanies,
  setLoading,
  initializeTargetCompaniesFromSignup,
} = userTargetCompaniesSlice.actions;

export default userTargetCompaniesSlice.reducer;