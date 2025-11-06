import 'reflect-metadata';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  isBoolean,
  isNumber,
  isString,
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import toast from 'react-hot-toast';

interface NumberOptions {
  allowInfinity?: boolean;
  allowNan?: boolean;
  maxDecimalPlaces?: number;
}

function isOptional(value: any) {
  return value === undefined || value === null;
}

export function jsonToFormData(json: any) {
  const formData = new FormData();
  Object.entries(json).forEach(([key, value]) => {
    formData.append(key, value as string | Blob);
  });
  return formData;
}

export function IsOptionalString(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isOptionalString',
      validator: {
        validate: (value: any, args: ValidationArguments) => {
          const { object, property } = args;
          return isOptional((object as any)[property]) || isString(value);
        },
      },
    },
    validationOptions ?? {
      message: (args: ValidationArguments) =>
        `${args.property} should be a string`,
    }
  );
}

export function IsOptionalNumber(
  validationOptions?: ValidationOptions,
  option: NumberOptions = {}
) {
  return ValidateBy(
    {
      name: 'isOptionalNumber',
      validator: {
        validate: (value: any, args: ValidationArguments) => {
          const { object, property } = args;
          return (
            isOptional((object as any)[property]) || isNumber(value, option)
          );
        },
      },
    },
    validationOptions ?? {
      message: (args: ValidationArguments) =>
        `${args.property} should be a number`,
    }
  );
}

export function IsOptionalBoolean(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isOptionalBoolean',
      validator: {
        validate: (value: any, args: ValidationArguments) => {
          const { object, property } = args;
          return isOptional((object as any)[property]) || isBoolean(value);
        },
      },
    },
    validationOptions ?? {
      message: (args: ValidationArguments) =>
        `${args.property} should be a number`,
    }
  );
}

export class HTTPResponse<T = any> {
  @IsString()
  @IsOptional()
  error?: string;

  @IsOptional()
  data?: T;

  @IsBoolean()
  @IsOptional()
  success?: boolean;

  @IsNumber()
  @IsOptional()
  code?: number;
}

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Response validation utility
export function validateApiResponse<T>(response: HTTPResponse<T>): T {
  if (!response.success && response.success !== undefined) {
    throw new ApiError(
      response.error || 'API request failed',
      response.code,
      undefined,
      response.data
    );
  }

  if (response.data === undefined) {
    throw new ApiError('No data received from API');
  }

  return response.data;
}

// URL building utilities
export function buildApiUrl(
  url: string,
  params?: Record<string, any>
): string {
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
}

// Request retry utility
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Don't retry on authentication errors
      if (error instanceof ApiError && error.status === 401) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve =>
        setTimeout(resolve, delay * Math.pow(2, attempt))
      );
    }
  }

  throw lastError!;
}

// Pagination utilities
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationInfo {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// Data transformation utilities
export function transformDates<T extends Record<string, any>>(obj: T): T {
  const transformed = { ...obj } as any;

  Object.keys(transformed).forEach(key => {
    const value = transformed[key];

    // Transform ISO date strings to Date objects
    if (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
    ) {
      transformed[key] = new Date(value) as any;
    }

    // Recursively transform nested objects
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      transformed[key] = transformDates(value);
    }

    // Transform arrays
    if (Array.isArray(value)) {
      transformed[key] = value.map(item =>
        item && typeof item === 'object' ? transformDates(item) : item
      ) as any;
    }
  });

  return transformed;
}

// Query parameter serialization
export function serializeQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item !== undefined && item !== null) {
            searchParams.append(key, item.toString());
          }
        });
      } else if (value instanceof Date) {
        searchParams.append(key, value.toISOString());
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  return searchParams.toString();
}

// Loading state management
export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
}

export function createLoadingState(): LoadingState {
  return {
    isLoading: false,
    error: null,
  };
}

// Debounce utility for search queries
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Format error messages for display
export function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

// HTTP status code utilities
export const httpStatus = {
  isSuccess: (code: number): boolean => code >= 200 && code < 300,
  isClientError: (code: number): boolean => code >= 400 && code < 500,
  isServerError: (code: number): boolean => code >= 500 && code < 600,
  isUnauthorized: (code: number): boolean => code === 401,
  isForbidden: (code: number): boolean => code === 403,
  isNotFound: (code: number): boolean => code === 404,
} as const;

export function redirectToHome(message: string, countdown: number = 5) {
  let count = countdown;
  const intervalId = setInterval(() => {
    if (count > 0) {
      toast.error(`${message} ${count}秒后跳转到首页...`, {
        className: "toast-error",
        duration: count * 1000,
      });
      count--;
    } else {
      clearInterval(intervalId);
      window.location.href = '/';
    }
  }, 1000);
}
