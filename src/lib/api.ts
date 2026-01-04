import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiResponse, User, Resume, ResumeVersion, CoverLetter, Plan, ATSAnalysis, ResumeTemplate } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          this.token = null;
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        throw error;
      }
    );

    // Load token from storage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  getToken() {
    return this.token;
  }

  // Auth endpoints
  async register(email: string, password: string, firstName?: string, lastName?: string) {
    const response = await this.client.post<ApiResponse<{ user: User; token: string }>>('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
    if (response.data.data?.token) {
      this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      email,
      password,
    });
    if (response.data.data?.token) {
      this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async getMe() {
    const response = await this.client.get<ApiResponse<User>>('/auth/me');
    return response.data;
  }

  async updateProfile(data: { firstName?: string; lastName?: string }) {
    const response = await this.client.put<ApiResponse<User>>('/auth/profile', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.client.put<ApiResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.client.post<ApiResponse>('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string) {
    const response = await this.client.post<ApiResponse>('/auth/reset-password', { token, password });
    return response.data;
  }

  async verifyEmail(token: string) {
    const response = await this.client.post<ApiResponse>('/auth/verify-email', { token });
    return response.data;
  }

  async resendVerification() {
    const response = await this.client.post<ApiResponse>('/auth/resend-verification');
    return response.data;
  }

  logout() {
    this.setToken(null);
  }

  // Resume endpoints
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse<Resume>>('/resumes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getResumes() {
    const response = await this.client.get<ApiResponse<Resume[]>>('/resumes');
    return response.data;
  }

  async getResume(id: string) {
    const response = await this.client.get<ApiResponse<Resume>>(`/resumes/${id}`);
    return response.data;
  }

  async updateResume(id: string, data: { title?: string }) {
    const response = await this.client.put<ApiResponse<Resume>>(`/resumes/${id}`, data);
    return response.data;
  }

  async deleteResume(id: string) {
    const response = await this.client.delete<ApiResponse>(`/resumes/${id}`);
    return response.data;
  }

  async customizeResume(id: string, data: { jobTitle: string; companyName: string; jobDescription: string }) {
    const response = await this.client.post<ApiResponse<ResumeVersion>>(`/resumes/${id}/customize`, data);
    return response.data;
  }

  async getResumeVersion(resumeId: string, versionId: string) {
    const response = await this.client.get<ApiResponse<ResumeVersion>>(`/resumes/${resumeId}/versions/${versionId}`);
    return response.data;
  }

  async compareVersions(resumeId: string, version1: string, version2: string) {
    const response = await this.client.get<ApiResponse<{ version1: ResumeVersion; version2: ResumeVersion }>>(
      `/resumes/${resumeId}/compare?version1=${version1}&version2=${version2}`
    );
    return response.data;
  }

  async downloadVersion(
    resumeId: string,
    versionId: string,
    format: 'pdf' | 'docx' = 'pdf',
    template: string = 'professional',
    anonymize = false
  ) {
    const response = await this.client.get(`/resumes/${resumeId}/versions/${versionId}/download`, {
      params: { format, template, anonymize: anonymize.toString() },
      responseType: 'blob',
    });
    return response.data;
  }

  async simulateATS(resumeId: string, versionId: string) {
    const response = await this.client.post<ApiResponse<ATSAnalysis>>(
      `/resumes/${resumeId}/versions/${versionId}/simulate-ats`
    );
    return response.data;
  }

  // Scrape job posting from URL
  async scrapeJobUrl(url: string) {
    const response = await this.client.post<ApiResponse<{
      url: string;
      title: string;
      company: string;
      location?: string;
      salary?: string;
      description: string;
      requirements?: string[];
      benefits?: string[];
      employmentType?: string;
      experienceLevel?: string;
    }>>('/resumes/scrape-job', { url });
    return response.data;
  }

  // Cover Letter endpoints
  async generateCoverLetter(data: {
    resumeVersionId?: string;
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    tone?: 'professional' | 'enthusiastic' | 'formal';
  }) {
    const response = await this.client.post<ApiResponse<CoverLetter>>('/cover-letters', data);
    return response.data;
  }

  async getCoverLetters() {
    const response = await this.client.get<ApiResponse<CoverLetter[]>>('/cover-letters');
    return response.data;
  }

  async getCoverLetter(id: string) {
    const response = await this.client.get<ApiResponse<CoverLetter>>(`/cover-letters/${id}`);
    return response.data;
  }

  async updateCoverLetter(id: string, content: string) {
    const response = await this.client.put<ApiResponse<CoverLetter>>(`/cover-letters/${id}`, { content });
    return response.data;
  }

  async deleteCoverLetter(id: string) {
    const response = await this.client.delete<ApiResponse>(`/cover-letters/${id}`);
    return response.data;
  }

  async downloadCoverLetter(id: string, format: 'pdf' | 'docx' = 'pdf') {
    const response = await this.client.get(`/cover-letters/${id}/download`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  async regenerateCoverLetter(id: string, tone?: 'professional' | 'enthusiastic' | 'formal') {
    const response = await this.client.post<ApiResponse<CoverLetter>>(`/cover-letters/${id}/regenerate`, { tone });
    return response.data;
  }

  // Subscription endpoints
  async getSubscription() {
    const response = await this.client.get<ApiResponse<any>>('/subscription');
    return response.data;
  }

  async getPlans() {
    const response = await this.client.get<ApiResponse<{ plans: Plan[] }>>('/subscription/plans');
    return response.data;
  }

  async createCheckout(planType: 'pro' | 'business') {
    const response = await this.client.post<ApiResponse<{ checkoutUrl: string }>>('/subscription/checkout', {
      planType,
    });
    return response.data;
  }

  async createPortalSession() {
    const response = await this.client.post<ApiResponse<{ portalUrl: string }>>('/subscription/portal');
    return response.data;
  }

  async cancelSubscription() {
    const response = await this.client.post<ApiResponse>('/subscription/cancel');
    return response.data;
  }

  async reactivateSubscription() {
    const response = await this.client.post<ApiResponse>('/subscription/reactivate');
    return response.data;
  }

  async getUsage() {
    const response = await this.client.get<ApiResponse<any>>('/subscription/usage');
    return response.data;
  }

  // Admin endpoints
  async getAdminDashboard() {
    const response = await this.client.get<ApiResponse<any>>('/admin/dashboard');
    return response.data;
  }

  async getAdminUsers(page = 1, limit = 20, search?: string, role?: string) {
    const response = await this.client.get<ApiResponse<any>>('/admin/users', {
      params: { page, limit, search, role },
    });
    return response.data;
  }

  async getAdminUser(id: string) {
    const response = await this.client.get<ApiResponse<any>>(`/admin/users/${id}`);
    return response.data;
  }

  async updateAdminUser(id: string, data: { role?: string; emailVerified?: boolean }) {
    const response = await this.client.put<ApiResponse<any>>(`/admin/users/${id}`, data);
    return response.data;
  }

  async deleteAdminUser(id: string) {
    const response = await this.client.delete<ApiResponse>(`/admin/users/${id}`);
    return response.data;
  }

  async getAdminAIUsage(page = 1, limit = 50, userId?: string, operation?: string) {
    const response = await this.client.get<ApiResponse<any>>('/admin/ai-usage', {
      params: { page, limit, userId, operation },
    });
    return response.data;
  }

  async getAdminParsingErrors(page = 1, limit = 50) {
    const response = await this.client.get<ApiResponse<any>>('/admin/parsing-errors', {
      params: { page, limit },
    });
    return response.data;
  }

  async getAdminAuditLogs(page = 1, limit = 50) {
    const response = await this.client.get<ApiResponse<any>>('/admin/audit-logs', {
      params: { page, limit },
    });
    return response.data;
  }

  async getAdminOrganizations(page = 1, limit = 20) {
    const response = await this.client.get<ApiResponse<any>>('/admin/organizations', {
      params: { page, limit },
    });
    return response.data;
  }

  async getAdminPrompts() {
    const response = await this.client.get<ApiResponse<any>>('/admin/prompts');
    return response.data;
  }

  async updateAdminPrompt(id: string, data: { promptText: string; isActive?: boolean }) {
    const response = await this.client.put<ApiResponse<any>>(`/admin/prompts/${id}`, data);
    return response.data;
  }

  async getAdminTemplates() {
    const response = await this.client.get<ApiResponse<any>>('/admin/templates');
    return response.data;
  }

  async createAdminTemplate(data: {
    name: string;
    description?: string;
    templateConfig: any;
    isDefault?: boolean;
    isPremium?: boolean;
    isAtsSafe?: boolean;
  }) {
    const response = await this.client.post<ApiResponse<any>>('/admin/templates', data);
    return response.data;
  }

  async getDisclaimer() {
    const response = await this.client.get<ApiResponse<{ disclaimer: string; lastUpdated: string }>>('/disclaimer');
    return response.data;
  }

  // Template endpoints
  async getTemplates() {
    const response = await this.client.get<ApiResponse<ResumeTemplate[]>>('/templates');
    return response.data;
  }

  async previewTemplate(templateId: string, resumeId?: string, versionId?: string) {
    const params: Record<string, string> = {};
    if (resumeId) params.resumeId = resumeId;
    if (versionId) params.versionId = versionId;

    const response = await this.client.get(`/templates/${templateId}/preview`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Organization endpoints
  async createOrganization(data: { name: string; domain?: string }) {
    const response = await this.client.post<ApiResponse<any>>('/organization', data);
    return response.data;
  }

  async getOrganization() {
    const response = await this.client.get<ApiResponse<any>>('/organization');
    return response.data;
  }

  async updateOrganization(data: {
    name?: string;
    domain?: string;
    logoUrl?: string;
    primaryColor?: string;
    anonymizationEnabled?: boolean;
  }) {
    const response = await this.client.put<ApiResponse<any>>('/organization', data);
    return response.data;
  }

  async inviteMember(email: string) {
    const response = await this.client.post<ApiResponse<any>>('/organization/invite', { email });
    return response.data;
  }

  async acceptInvite(token: string) {
    const response = await this.client.post<ApiResponse<any>>('/organization/accept-invite', { token });
    return response.data;
  }

  async removeMember(memberId: string) {
    const response = await this.client.delete<ApiResponse<any>>(`/organization/members/${memberId}`);
    return response.data;
  }

  async updateMemberRole(memberId: string, role: 'ORG_ADMIN' | 'ORG_USER') {
    const response = await this.client.put<ApiResponse<any>>(`/organization/members/${memberId}/role`, { role });
    return response.data;
  }

  async leaveOrganization() {
    const response = await this.client.post<ApiResponse<any>>('/organization/leave');
    return response.data;
  }

  // Share endpoints
  async toggleSharing(resumeId: string, versionId: string, isPublic: boolean) {
    const response = await this.client.post<ApiResponse<{
      isPublic: boolean;
      shareToken: string | null;
      shareUrl: string | null;
      views: number;
      downloads: number;
    }>>(`/shared/${resumeId}/versions/${versionId}/share`, { isPublic });
    return response.data;
  }

  async getSharingStatus(resumeId: string, versionId: string) {
    const response = await this.client.get<ApiResponse<{
      isPublic: boolean;
      shareToken: string | null;
      shareUrl: string | null;
      totalViews: number;
      totalDownloads: number;
      viewsLast7Days: number;
      downloadsLast7Days: number;
      recentActivity: Array<{
        id: string;
        eventType: string;
        country?: string;
        city?: string;
        createdAt: string;
      }>;
    }>>(`/shared/${resumeId}/versions/${versionId}/share`);
    return response.data;
  }

  async getSharedResume(token: string) {
    const response = await this.client.get<ApiResponse<{
      jobTitle: string;
      companyName: string;
      atsScore: number;
      candidateName: string;
      resume: {
        contact: any;
        summary: string;
        experience: any[];
        education: any[];
        skills: string[];
        certifications?: string[];
        projects?: any[];
      };
    }>>(`/shared/${token}`);
    return response.data;
  }

  async downloadSharedResume(token: string, format: 'pdf' | 'docx' = 'pdf', template = 'london-navy') {
    const response = await this.client.get(`/shared/${token}/download`, {
      params: { format, template },
      responseType: 'blob',
    });
    return response.data;
  }

  // AI Writing endpoints
  async getAISuggestions(data: {
    text: string;
    context?: {
      jobTitle?: string;
      industry?: string;
      section?: 'experience' | 'summary' | 'skills' | 'education';
      previousBullets?: string[];
    };
    suggestionType: 'improve' | 'expand' | 'quantify' | 'action-verb' | 'complete';
  }) {
    const response = await this.client.post<ApiResponse<{
      suggestions: string[] | Array<{ verb: string; example: string }>;
      type: string;
    }>>('/ai-writing/suggestions', data);
    return response.data;
  }

  async getAICompletions(data: {
    text: string;
    cursorPosition?: number;
    section?: string;
  }) {
    const response = await this.client.post<ApiResponse<{
      completions: string[];
    }>>('/ai-writing/completions', data);
    return response.data;
  }

  async generateBulletPoints(data: {
    jobTitle: string;
    company: string;
    responsibilities?: string;
    achievements?: string;
    targetRole?: string;
  }) {
    const response = await this.client.post<ApiResponse<{
      bulletPoints: string[];
    }>>('/ai-writing/generate-bullets', data);
    return response.data;
  }

  // Interview Prep endpoints
  async generateInterviewQuestions(data: {
    jobTitle: string;
    company?: string;
    industry?: string;
    jobDescription?: string;
    resumeData?: any;
    questionTypes?: ('behavioral' | 'technical' | 'situational')[];
  }) {
    const response = await this.client.post<ApiResponse<{
      questions: Array<{
        question: string;
        category: string;
        difficulty: string;
        tips?: string;
        sampleAnswer?: string;
      }>;
      jobTitle: string;
      company?: string;
    }>>('/interview-prep/generate', data);
    return response.data;
  }

  async evaluateAnswer(data: {
    question: string;
    answer: string;
    jobTitle?: string;
    company?: string;
  }) {
    const response = await this.client.post<ApiResponse<{
      score: number;
      strengths: string[];
      improvements: string[];
      improvedAnswer: string;
      feedback: string;
    }>>('/interview-prep/evaluate', data);
    return response.data;
  }

  async getCommonQuestions(category?: string) {
    const response = await this.client.get<ApiResponse<{
      questions: Array<{
        question: string;
        category: string;
        difficulty: string;
        tips?: string;
      }>;
      categories: string[];
    }>>('/interview-prep/common', { params: { category } });
    return response.data;
  }

  // Salary Analyzer endpoints
  async analyzeSalary(data: {
    jobTitle: string;
    location: string;
    experienceYears?: number;
    industry?: string;
    companySize?: string;
    skills?: string[];
    currentOffer?: string;
  }) {
    const response = await this.client.post<ApiResponse<{
      analysis: {
        salaryRange: { min: number; median: number; max: number; currency: string };
        percentile: { '25th': number; '50th': number; '75th': number; '90th': number };
        factors: Array<{ name: string; impact: string; description: string }>;
        benefits: { common: string[]; premium: string[] };
        negotiationTips: string[];
        marketOutlook: string;
        competitorSalaries: Array<{ company: string; range: string }>;
        offerAnalysis?: { comparison: string; percentileRank: number; recommendation: string };
      };
      query: any;
    }>>('/salary/analyze', data);
    return response.data;
  }

  async compareOffers(offers: Array<{
    company: string;
    position: string;
    baseSalary: number;
    bonus?: string;
    equity?: string;
    benefits?: string[];
    remoteWork?: string;
    ptoDays?: number;
    location?: string;
  }>) {
    const response = await this.client.post<ApiResponse<{
      totalCompensation: Array<{ company: string; estimated: number }>;
      rankings: Record<string, string[]>;
      prosAndCons: Array<{ company: string; pros: string[]; cons: string[] }>;
      recommendation: any;
      negotiationSuggestions: any[];
    }>>('/salary/compare', { offers });
    return response.data;
  }

  async getNegotiationScript(data: {
    currentOffer: string;
    targetSalary: string;
    reasons?: string[];
    jobTitle?: string;
    company?: string;
  }) {
    const response = await this.client.post<ApiResponse<{
      openingStatement: string;
      keyPoints: Array<{ point: string; elaboration: string }>;
      responses: Record<string, string>;
      closingStatement: string;
      emailTemplate: string;
      tips: string[];
    }>>('/salary/negotiation-script', data);
    return response.data;
  }

  // Job Board endpoints
  async searchJobs(params: {
    keywords: string;
    location?: string;
    experienceLevel?: string;
    jobType?: string;
    remote?: boolean;
    postedWithin?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await this.client.get<ApiResponse<{
      jobs: Array<{
        id: string;
        title: string;
        company: string;
        location: string;
        salary?: string;
        type: string;
        posted: string;
        description: string;
        requirements?: string[];
        source: string;
        url: string;
        logo?: string;
      }>;
      total: number;
      page: number;
      totalPages: number;
      filters: any;
    }>>('/jobs/search', { params });
    return response.data;
  }

  async getJobDetails(id: string, url?: string) {
    const response = await this.client.get<ApiResponse<{
      fullDescription: string;
      responsibilities: string[];
      requirements: string[];
      niceToHave: string[];
      benefits: string[];
      culture: string;
    }>>(`/jobs/details/${id}`, { params: { url } });
    return response.data;
  }

  async saveJob(jobId: string, jobData: any) {
    const response = await this.client.post<ApiResponse<{ jobId: string }>>('/jobs/save', { jobId, jobData });
    return response.data;
  }

  async getSavedJobs() {
    const response = await this.client.get<ApiResponse<{ jobs: any[]; total: number }>>('/jobs/saved');
    return response.data;
  }

  async getRecommendedJobs(resumeId?: string) {
    const response = await this.client.get<ApiResponse<{
      jobs: any[];
      basedOn: { skills: string[]; recentTitles: string[] };
    }>>('/jobs/recommended', { params: { resumeId } });
    return response.data;
  }

  // Resume Builder endpoints
  async createBlankResume(data: { title?: string; template?: string }) {
    const response = await this.client.post<ApiResponse<{
      id: string;
      title: string;
      parsedData: any;
      createdAt: string;
    }>>('/resumes/create', data);
    return response.data;
  }

  async updateResumeContent(id: string, data: { parsedData?: any; title?: string }) {
    const response = await this.client.put<ApiResponse<{
      id: string;
      title: string;
      parsedData: any;
      updatedAt: string;
    }>>(`/resumes/${id}/content`, data);
    return response.data;
  }

  async downloadBuiltResume(id: string, format: 'pdf' | 'docx' = 'pdf', template = 'london-navy') {
    const response = await this.client.get(`/resumes/${id}/download`, {
      params: { format, template },
      responseType: 'blob',
    });
    return response.data;
  }

  async previewBuiltResume(id: string, template = 'london-navy') {
    const response = await this.client.get(`/resumes/${id}/preview`, {
      params: { template },
      responseType: 'blob',
    });
    return response.data;
  }
}

export const api = new ApiClient();
export default api;
