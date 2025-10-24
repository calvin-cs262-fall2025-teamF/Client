export interface User {
  id: string;
  name: string;
  linkedinProfile?: string;
  university: string;
  major: string;
  graduationYear: number;
  targetCompanies: string[];
  targetRoles: string[];
  targetIndustries: string[];
  targetLocations: string[];
  resumeUri?: string;
  weeklyGoal: number;
  createdAt: string;
}

export type ApplicationStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface Application {
  id: string;
  company: string;
  role: string;
  location: string;
  status: ApplicationStatus;
  appliedDate: string;
  notes?: string;
  companyLogo?: string;
}

export interface CompanyRecommendation {
  id: string;
  name: string;
  logo: string;
  industry: string;
  applicationTimeline: {
    internship: string;
    fullTime: string;
    contractor: string;
    coop: string;
  };
  events: Event[];
  recommendedCourses: Course[];
  preparationChecklist: ChecklistItem[];
  companyInfo: {
    size: string;
    culture: string[];
    benefits: string[];
    interviewProcess: string[];
  };
}

export interface Event {
  id: string;
  title: string;
  type: 'Tech Talk' | 'Workshop' | 'Networking' | 'Info Session';
  date: string;
  description: string;
  registrationLink?: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  link: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: 'Interview Prep' | 'Portfolio' | 'Culture Study' | 'Technical Skills';
}

export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  interviews: number;
  weeklyProgress: number;
  weeklyGoal: number;
  trendingUp: boolean;
}

export type RoleType = 'Internship' | 'Full-time' | 'Contractor' | 'Co-op';

export interface UserTargetCompany {
  companyId: string;
  addedAt: string;
  priority?: number;
  customNotes?: string;
}

export interface CompanyMatchResult {
  matchedCompanyId?: string;
  originalText: string;
  confidence: number;
}

export interface Resume {
  id: string;
  name: string;
  fileName: string;
  fileUri: string;
  uploadedAt: string;
  isPrimary: boolean;
  tailoredVersions?: TailoredResume[];
}

export interface TailoredResume {
  id: string;
  originalResumeId: string;
  jobDescription: string;
  companyName: string;
  positionTitle: string;
  tailoredAt: string;
  processingStatus: 'processing' | 'completed' | 'failed';
}

export interface ResumeTailoringRequest {
  resumeId: string;
  jobDescription: string;
  companyName: string;
  positionTitle: string;
}