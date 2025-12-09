import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { UserTargetCompany, CompanyRecommendation } from '../types';
import { enrichCompanyData } from '../services/companyEnrichmentService';

interface UserTargetCompaniesState {
  targetCompanies: UserTargetCompany[];
  customCompanies: CompanyRecommendation[]; // User-created companies
  checklistCompletions: Record<string, Record<string, boolean>>; // companyId -> checklistItemId -> completed
  isLoading: boolean;
  enrichmentStatus: 'idle' | 'loading' | 'success' | 'error';
  enrichmentError?: string;
}

const initialState: UserTargetCompaniesState = {
  targetCompanies: [],
  customCompanies: [],
  checklistCompletions: {},
  isLoading: false,
  enrichmentStatus: 'idle',
};

// Async thunk for adding custom company with enrichment
export const addCustomCompany = createAsyncThunk(
  'userTargetCompanies/addCustomCompany',
  async (companyName: string, { rejectWithValue }) => {
    try {
      const enrichedData = await enrichCompanyData(companyName);

      // Generate unique ID for custom company
      const customCompanyId = `custom-${Date.now()}-${companyName.toLowerCase().replace(/\s+/g, '-')}`;

      const customCompany: CompanyRecommendation = {
        id: customCompanyId,
        name: enrichedData.name,
        logo: enrichedData.logo,
        industry: enrichedData.industry,
        isCustom: true,
        applicationTimeline: enrichedData.applicationTimeline,
        events: enrichedData.events, // Now includes enriched events
        recommendedCourses: enrichedData.recommendedCourses, // Now includes enriched courses
        preparationChecklist: enrichedData.preparationChecklist, // Now includes enriched checklist
        companyInfo: enrichedData.companyInfo,
      };

      return customCompany;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to enrich company data');
    }
  }
);

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

    removeCustomCompany: (state, action: PayloadAction<string>) => {
      const companyId = action.payload;
      state.customCompanies = state.customCompanies.filter(c => c.id !== companyId);
      // Also remove from target companies if it was targeted
      state.targetCompanies = state.targetCompanies.filter(tc => tc.companyId !== companyId);
    },

    toggleChecklistItem: (state, action: PayloadAction<{ companyId: string; checklistItemId: string }>) => {
      const { companyId, checklistItemId } = action.payload;

      // Initialize company's checklist completions if not exists
      if (!state.checklistCompletions[companyId]) {
        state.checklistCompletions[companyId] = {};
      }

      // Toggle the completion state
      const currentState = state.checklistCompletions[companyId][checklistItemId] || false;
      state.checklistCompletions[companyId][checklistItemId] = !currentState;
    },

    loadCustomCompanies: (state, action: PayloadAction<CompanyRecommendation[]>) => {
      state.customCompanies = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addCustomCompany.pending, (state) => {
        state.enrichmentStatus = 'loading';
        state.enrichmentError = undefined;
      })
      .addCase(addCustomCompany.fulfilled, (state, action) => {
        state.enrichmentStatus = 'success';
        // Add to custom companies list
        state.customCompanies.push(action.payload);
        // Automatically add to user's target companies
        const newTargetCompany: UserTargetCompany = {
          companyId: action.payload.id,
          addedAt: new Date().toISOString(),
          priority: state.targetCompanies.length + 1,
        };
        state.targetCompanies.push(newTargetCompany);
      })
      .addCase(addCustomCompany.rejected, (state, action) => {
        state.enrichmentStatus = 'error';
        state.enrichmentError = action.payload as string;
      });
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
  removeCustomCompany,
  toggleChecklistItem,
  loadCustomCompanies,
} = userTargetCompaniesSlice.actions;

export default userTargetCompaniesSlice.reducer;