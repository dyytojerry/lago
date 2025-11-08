import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { buildApiUrl } from './api-utils';
import { storage, StorageManager } from '../storage';
import { HTTPResponse } from './api-utils';

export const defaultRequestOptions: {
  baseURL: string;
  fallback?: (statusCode: number, retry: () => Promise<any>) => Promise<any>;
  storage: StorageManager;
} = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  storage,
}
export interface HTTPRequestInit<T extends Record<string, any> = any> extends RequestInit {
  noAuthorize?: boolean;
  params?: T;
}

// Helper function to get cookie value
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

let navitagteUrl = '';
let familyId = '';
export function setFamilyId(id: string) {
  familyId = id;
}
export const redirectToLogin = () => {
  if (navitagteUrl) return;
  debugger
  if (typeof window !== 'undefined') {
    // Redirect to login page
    if (!window.location.pathname || window.location.pathname === '/') {
      navitagteUrl = `/login${familyId ? `?familyId=${familyId}` : ''}`;
    } else {
      navitagteUrl = `/login?${familyId ? `familyId=${familyId}&` : ''}callback_url=${window.location.pathname}`;
    }
    window.location.href = navitagteUrl;
  }
};

// Enhanced API request function with auth handling
export async function apiRequest<T extends Record<string, any>>(
  endpoint: string,
  options: HTTPRequestInit = {},
  responseClass?: new () => T
): Promise<HTTPResponse<T>> {
  const { noAuthorize = false, ...fetchOptions } = options;

  return await makeRequest(
    endpoint,
    fetchOptions,
    responseClass,
    noAuthorize,
  );
}
// Internal function to make the actual request with retry logic
async function makeRequest<T extends Record<string, any>>(
  endpoint: string,
  options: HTTPRequestInit,
  responseClass?: new () => T,
  noAuthorize = false,
  retryException?: () => void
): Promise<{ data: T }> {
  const url = buildApiUrl(endpoint.startsWith('http') ? endpoint : `${defaultRequestOptions.baseURL}${endpoint}`, options.params);

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: '',
    ...(options.headers as Record<string, string>),
  };

  // Add authentication token if not disabled
  const token = await defaultRequestOptions.storage.getItem<string>('authToken');
  if (token) {
    defaultHeaders['Authorization'] =
      (options.headers as any)?.Authorization || `Bearer ${token}`;
  }
  const headers = Object.keys(defaultHeaders).reduce(
    (acc, key) => {
      if (defaultHeaders[key]) {
        acc[key] = defaultHeaders[key];
      }
      return acc;
    },
    {} as Record<string, string>
  );

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && !noAuthorize && !retryException) {
      // If refresh fails or no refresh token, redirect to login
      if (defaultRequestOptions.fallback) {
        return defaultRequestOptions.fallback(response.status, () => makeRequest(endpoint, options, responseClass, noAuthorize, () => {
          throw new Error('Authentication required. Please log in again.')
        }));
      } else {
        redirectToLogin();
        throw new Error('Authentication required. Please log in again.');
      }
    }

    // Handle 422 Unprocessable Entity - redirect to login
    if (response.status === 422 && !retryException) {
      if (defaultRequestOptions.fallback) {
        return defaultRequestOptions.fallback(response.status, () => makeRequest(endpoint, options, responseClass, noAuthorize, () => {
          throw new Error('Authentication error. Please log in again.');
        }));
      } else {
        redirectToLogin();
        throw new Error('Authentication required. Please log in again.');
      }
    }

    if (retryException) {
      retryException()
    } else {
      throw new Error(
        errorData.error ||
          `${response.status}: ${errorData.message || `HTTP error! status: ${response.status}`}`
      );
    }
  }

  const res = await response.json();

  if (res.data === undefined || res.data === null || res.data.error) {
    const errorMessage = res.data?.error || res.error || 'Unknown error';
    console.error('API error:', errorMessage);
    throw new Error(errorMessage);
  }

  // Transform and validate response if responseClass is provided
  if (responseClass) {
    const instance = plainToClass(responseClass, res.data);
    const errors = await validate(instance as object);
    if (errors.length > 0) {
      console.warn('Validation errors:', errors);
    }
    res.data = instance;
    return res;
  }

  return res;
}
