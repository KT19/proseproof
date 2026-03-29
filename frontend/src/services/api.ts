import axios from 'axios';
import type { Document, AnalysisResult, UserStats, HealthStatus } from '../types';

const API_BASE = '/api';

// Documents API
export const documentsApi = {
  list: async (): Promise<Document[]> => {
    const response = await axios.get(`${API_BASE}/documents`);
    return response.data;
  },

  get: async (id: number): Promise<Document> => {
    const response = await axios.get(`${API_BASE}/documents/${id}`);
    return response.data;
  },

  create: async (title?: string, text?: string): Promise<Document> => {
    const response = await axios.post(`${API_BASE}/documents`, {
      title: title || 'Untitled Document',
      original_text: text || '',
    });
    return response.data;
  },

  update: async (id: number, data: Partial<Document>): Promise<Document> => {
    const response = await axios.put(`${API_BASE}/documents/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/documents/${id}`);
  },
};

// Analysis API
export const analysisApi = {
  analyze: async (text: string): Promise<AnalysisResult> => {
    const response = await axios.post(`${API_BASE}/analyze`, { text });
    return response.data;
  },
};

// Stats API
export const statsApi = {
  get: async (): Promise<UserStats> => {
    const response = await axios.get(`${API_BASE}/stats`);
    return response.data;
  },
};

// Health API
export const healthApi = {
  check: async (): Promise<HealthStatus> => {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  },
};
