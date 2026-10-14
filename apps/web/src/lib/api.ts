import { ApiResponse } from '@sai-punjabi/shared';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  public statusCode: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number = 400, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Get token if saved in client storage for bearer fallback
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('sai_punjabi_token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Include session ID for guest carts
  if (typeof window !== 'undefined') {
    let sessionId = localStorage.getItem('sai_punjabi_session');
    if (!sessionId) {
      sessionId = `sess_${Math.random().toString(36).substring(2, 12)}`;
      localStorage.setItem('sai_punjabi_session', sessionId);
    }
    headers['X-Session-Id'] = sessionId;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensures HTTP-only cookies are passed
  });

  const data: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    message: 'Failed to parse JSON response',
  }));

  if (!res.ok || !data.success) {
    throw new ApiError(
      data.message || 'An error occurred while communicating with the server',
      res.status,
      data.errors
    );
  }

  return data.data as T;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'GET', ...options }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};
