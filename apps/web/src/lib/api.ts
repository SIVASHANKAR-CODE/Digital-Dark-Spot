import type {
  ResearchSession,
  Source,
  AnalysisResult,
  CreateResearchRequest,
  ApiResponse,
  HealthResponse,
  AuthResponseData,
  UserProfile,
} from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiClientError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Attach stored JWT if available
  try {
    const token = localStorage.getItem('dds_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorData: ApiResponse<never> | null = null;
    try {
      errorData = await response.json();
    } catch {
      // Response is not JSON
    }

    const message =
      errorData?.error?.message || `Request failed with status ${response.status}`;
    const code = errorData?.error?.code || 'UNKNOWN_ERROR';

    throw new ApiClientError(message, code, response.status);
  }

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new ApiClientError(
      data.error?.message || 'Request was not successful',
      data.error?.code || 'REQUEST_FAILED',
      response.status
    );
  }

  return data.data as T;
}

// Authentication endpoints
export function loginWithGoogle(idToken: string): Promise<AuthResponseData> {
  return apiRequest<AuthResponseData>('POST', '/api/v1/auth/google', { idToken });
}

export function loginWithEmail(email: string, password: string): Promise<AuthResponseData> {
  return apiRequest<AuthResponseData>('POST', '/api/v1/auth/login', { email, password });
}

export function registerWithEmail(
  name: string,
  email: string,
  password: string
): Promise<AuthResponseData> {
  return apiRequest<AuthResponseData>('POST', '/api/v1/auth/register', { name, email, password });
}

export function getCurrentUser(): Promise<UserProfile> {
  return apiRequest<UserProfile>('GET', '/api/v1/auth/me');
}

// Research endpoints
export function createResearch(
  data: CreateResearchRequest
): Promise<ResearchSession> {
  return apiRequest<ResearchSession>('POST', '/api/v1/research', data);
}

export function getResearch(id: string): Promise<ResearchSession> {
  return apiRequest<ResearchSession>('GET', `/api/v1/research/${id}`);
}

export function getAllResearch(): Promise<ResearchSession[]> {
  return apiRequest<ResearchSession[]>('GET', '/api/v1/research');
}

export function deleteResearch(id: string): Promise<void> {
  return apiRequest<void>('DELETE', `/api/v1/research/${id}`);
}

// Source endpoints
export function addSources(
  id: string,
  urls: string[]
): Promise<Source[]> {
  return apiRequest<Source[]>('POST', `/api/v1/research/${id}/sources`, {
    urls,
  });
}

export function getSources(id: string): Promise<Source[]> {
  return apiRequest<Source[]>('GET', `/api/v1/research/${id}/sources`);
}

// Analysis endpoints
export function analyzeResearch(id: string): Promise<AnalysisResult> {
  return apiRequest<AnalysisResult>(
    'POST',
    `/api/v1/research/${id}/analyze`
  );
}

export function getResearchStatus(
  id: string
): Promise<{ status: string; progress?: number }> {
  return apiRequest<{ status: string; progress?: number }>(
    'GET',
    `/api/v1/research/${id}/status`
  );
}

// Report
export function getReport(
  id: string
): Promise<AnalysisResult> {
  return apiRequest<AnalysisResult>(
    'GET',
    `/api/v1/research/${id}/report`
  );
}

// Checklist endpoints
export function toggleChecklistItem(
  id: string,
  itemId: string
): Promise<unknown> {
  return apiRequest('PATCH', `/api/v1/research/${id}/checklist/${itemId}/toggle`);
}

export function addChecklistItem(
  id: string,
  item: { title: string; description: string; priority: string }
): Promise<unknown> {
  return apiRequest('POST', `/api/v1/research/${id}/checklist`, item);
}

// Health
export function getHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('GET', '/api/v1/health');
}

export { ApiClientError };
