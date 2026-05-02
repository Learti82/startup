import axios, { AxiosError } from 'axios';
import type { Property, Document, RiskReport, User, ApiResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ error?: string }>) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

function errMsg(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || err.message || 'Gabim i panjohur';
  }
  return 'Gabim i panjohur';
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: async (data: {
    email: string; password: string; full_name: string;
    role: string; phone?: string; consent_gdpr: boolean;
  }) => {
    try {
      const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data);
      return res.data;
    } catch (err) { throw new Error(errMsg(err)); }
  },

  login: async (email: string, password: string) => {
    try {
      const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password });
      return res.data;
    } catch (err) { throw new Error(errMsg(err)); }
  },
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const userApi = {
  getMe: async () => {
    const res = await api.get<ApiResponse<User>>('/users/me');
    return res.data.data!;
  },
  updateMe: async (data: { full_name?: string; phone?: string }) => {
    const res = await api.put<ApiResponse>('/users/me', data);
    return res.data;
  },
  exportData: async () => {
    const res = await api.get<ApiResponse>('/users/me/export');
    return res.data.data;
  },
  deleteAccount: async () => {
    const res = await api.delete<ApiResponse>('/users/me');
    return res.data;
  },
};

// ─── Properties ──────────────────────────────────────────────────────────────
export const propertyApi = {
  list: async (limit = 20, offset = 0) => {
    const res = await api.get<ApiResponse<Property[]>>('/properties', { params: { limit, offset } });
    return res.data;
  },
  get: async (id: string) => {
    const res = await api.get<ApiResponse<Property>>(`/properties/${id}`);
    return res.data.data!;
  },
  create: async (data: Partial<Property>) => {
    try {
      const res = await api.post<ApiResponse<Property>>('/properties', data);
      return res.data.data!;
    } catch (err) { throw new Error(errMsg(err)); }
  },
  update: async (id: string, data: Partial<Property>) => {
    const res = await api.put<ApiResponse>(`/properties/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<ApiResponse>(`/properties/${id}`);
    return res.data;
  },
};

// ─── Documents ───────────────────────────────────────────────────────────────
export const documentApi = {
  list: async (propertyId: string) => {
    const res = await api.get<ApiResponse<Document[]>>(`/properties/${propertyId}/documents`);
    return res.data.data!;
  },
  upload: async (propertyId: string, file: File, documentType: string,
    onProgress?: (p: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    try {
      const res = await api.post<ApiResponse<Document>>(
        `/properties/${propertyId}/documents`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
          },
        }
      );
      return res.data.data!;
    } catch (err) { throw new Error(errMsg(err)); }
  },
  delete: async (propertyId: string, docId: string) => {
    const res = await api.delete<ApiResponse>(`/properties/${propertyId}/documents/${docId}`);
    return res.data;
  },
  download: (propertyId: string, docId: string) =>
    `/api/properties/${propertyId}/documents/${docId}/download`,
};

// ─── Reports ─────────────────────────────────────────────────────────────────
export const reportApi = {
  analyze: async (propertyId: string) => {
    try {
      const res = await api.post<ApiResponse<{ report_id: string }>>(`/properties/${propertyId}/analyze`);
      return res.data;
    } catch (err) { throw new Error(errMsg(err)); }
  },
  get: async (propertyId: string) => {
    const res = await api.get<ApiResponse<RiskReport>>(`/properties/${propertyId}/report`);
    return res.data.data;
  },
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: async () => {
    const res = await api.get<ApiResponse>('/admin/stats');
    return res.data.data;
  },
  getUsers: async (params?: { search?: string; limit?: number; offset?: number }) => {
    const res = await api.get<ApiResponse<User[]>>('/admin/users', { params });
    return res.data;
  },
  toggleUserActive: async (userId: string) => {
    const res = await api.put<ApiResponse>(`/admin/users/${userId}/toggle-active`);
    return res.data;
  },
  getReports: async (params?: { limit?: number; offset?: number }) => {
    const res = await api.get<ApiResponse>('/admin/reports', { params });
    return res.data;
  },
  getAuditLogs: async (params?: { user_id?: string; action?: string; limit?: number }) => {
    const res = await api.get<ApiResponse>('/admin/audit-logs', { params });
    return res.data;
  },
};

export default api;
