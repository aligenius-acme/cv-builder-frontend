// User types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'ADMIN';
  emailVerified?: boolean;
  aiCredits?: number;
  aiCreditsUsed?: number;
  stats?: {
    resumes: number;
    coverLetters: number;
  };
  createdAt?: string;
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
  originalFileKey?: string;
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
  certifications?: CertificationEntry[];
  projects?: ProjectEntry[];
  languages?: string[];
  awards?: AwardEntry[] | string[];
  volunteerWork?: VolunteerWorkEntry[] | string[];
  contact: ContactInfo;
  photoUrl?: string; // Profile photo URL
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
  link?: string;
  company?: string;
  dates?: string;
}

export interface CertificationEntry {
  name: string;
  issuer?: string;
  date?: string;
}

export interface AwardEntry {
  name: string;
  issuer?: string;
  date?: string;
}

export interface VolunteerWorkEntry {
  role: string;
  organization: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string[];
}

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  photoUrl?: string; // Profile photo URL
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

// Detailed recommendation types
export interface DetailedRecommendation {
  issue: string;
  location: string;
  currentText: string;
  suggestedText: string;
  reasoning: string;
  estimatedScoreImpact: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  keywords: string[];
  implementation: string;
}

export interface MissingKeywordDetail {
  keyword: string;
  importance: string;
  suggestedLocation: string;
  exampleUsage: string;
  relatedKeywords: string[];
  currentGap: string;
}

export interface SectionImprovement {
  change: string;
  before: string;
  after: string;
  impact: string;
}

export interface BulletImprovement {
  bulletPoint: string;
  weaknesses: string[];
  enhanced: string;
  impact: string;
  keywordsAdded: string[];
}

export interface SectionAnalysis {
  currentScore: number;
  issues: string[];
  improvements: SectionImprovement[] | BulletImprovement[];
}

export interface SkillsAnalysis {
  currentScore: number;
  matched: string[];
  missing: string[];
  irrelevant: string[];
  reorder: string;
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
  honestAssessment?: string;
  competitorComparison?: string;
  detailedRecommendations?: {
    criticalIssues: DetailedRecommendation[];
    missingKeywordDetails: MissingKeywordDetail[];
    sectionBySection: {
      summary?: SectionAnalysis;
      experience?: SectionAnalysis;
      skills?: SkillsAnalysis;
      education?: SectionAnalysis;
    };
  };
  quickWins?: string[];
  actionPlan?: {
    step1: string;
    step2: string;
    step3: string;
    estimatedScoreAfterFixes: string;
  };
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
export type PrimaryCategory =
  | 'ATS-Professional'
  | 'Tech-Startup'
  | 'Creative-Design'
  | 'Academic-Research'
  | 'Entry-Student'
  | 'Executive-Leadership';

export type DesignStyle = 'Minimal' | 'Modern' | 'Bold' | 'Traditional';

export type ATSCompatibility = 'ATS-Safe' | 'ATS-Friendly' | 'Visual-First';

export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Executive';

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview?: string;
  tags: string[];

  // New enhanced fields
  primaryCategory?: PrimaryCategory;
  designStyle?: DesignStyle;
  atsCompatibility?: ATSCompatibility;
  experienceLevel?: ExperienceLevel;
  industryTags?: string[];
  colorHex?: string;
  colorName?: string;
  layoutName?: string;

  // Metadata
  popularityScore?: number;
  isFeatured?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  supportedFormats?: string[];
  supportsDocx?: boolean;

  // Photo support
  photoSupport?: boolean;

  // Legacy fields
  category?: string;
  layoutType?: 'single-column' | 'two-column' | 'one-page';
  features?: string[];
  isATSSafe?: boolean;
  hasPhoto?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateFilters {
  category?: PrimaryCategory;
  atsCompatibility?: ATSCompatibility;
  industry?: string;
  experienceLevel?: ExperienceLevel;
  designStyle?: DesignStyle;
  search?: string;
  sortBy?: 'popular' | 'newest' | 'name' | 'ats-score';
}

export interface RecommendedTemplatesResponse {
  templates: ResumeTemplate[];
  reason?: string;
  basedOn?: {
    industry?: string;
    experienceLevel?: string;
    skills?: string[];
  };
}

// Admin types
export interface DashboardStats {
  totalUsers: number;
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
