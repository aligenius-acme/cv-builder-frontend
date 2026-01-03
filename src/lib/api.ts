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
}

export const api = new ApiClient();
export default api;
