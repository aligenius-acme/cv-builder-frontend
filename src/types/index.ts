// User types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'ORG_ADMIN' | 'ORG_USER' | 'ADMIN';
  planType: 'FREE' | 'PRO' | 'BUSINESS';
  organizationId?: string;
  organizationName?: string;
  emailVerified?: boolean;
  subscription?: SubscriptionInfo;
  stats?: {
    resumes: number;
    coverLetters: number;
  };
  createdAt?: string;
}

export interface SubscriptionInfo {
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'PAUSED';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  resumeLimit: number;
  resumesCreated: number;
}

// Resume types
export interface Resume {
  id: string;
  title: string;
  fileName: string;
  parseStatus: 'pending' | 'processing' | 'completed' | 'failed';
  parseError?: string;
  parsedData?: ParsedResumeData;
  rawText?: string;
  versionCount?: number;
  versions?: ResumeVersionSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface ParsedResumeData {
  summary?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  certifications?: string[];
  projects?: ProjectEntry[];
  contact: ContactInfo;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description: string[];
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location?: string;
  graduationDate?: string;
  gpa?: string;
  achievements?: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
}

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ResumeVersionSummary {
  id: string;
  versionNumber: number;
  jobTitle: string;
  companyName: string;
  atsScore: number;
  createdAt: string;
}

export interface ResumeVersion extends ResumeVersionSummary {
  jobDescription: string;
  originalData?: ParsedResumeData;
  tailoredData: ParsedResumeData;
  tailoredText: string;
  changesExplanation: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  atsDetails?: ATSAnalysis;
  truthGuardWarnings?: TruthGuardWarning[];
}

export interface ATSAnalysis {
  score: number;
  keywordMatchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  sectionScores: {
    summary: number;
    experience: number;
    skills: number;
    education: number;
    formatting: number;
  };
  formattingIssues: string[];
  recommendations: string[];
  atsExtractedView: string;
  riskyElements: string[];
}

export interface TruthGuardWarning {
  type: 'exaggeration' | 'inconsistency' | 'unsupported_claim';
  section: string;
  original: string;
  concern: string;
  severity: 'low' | 'medium' | 'high';
}

// Cover Letter types
export interface CoverLetter {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
  content: string;
  tone: 'professional' | 'enthusiastic' | 'formal';
  createdAt: string;
  updatedAt: string;
}

// Subscription types
export interface Plan {
  id: string;
  name: string;
  price: number;
  interval?: 'month' | 'year';
  stripePriceId?: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  forTeams?: boolean;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Template types
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  tags: string[];
}

// Admin types
export interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalResumes: number;
  totalCoverLetters: number;
  aiRequests30d: number;
  aiCost30d: string;
}

export interface AIUsageLog {
  id: string;
  userId: string;
  operation: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: string;
  durationMs: number;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
  };
}
