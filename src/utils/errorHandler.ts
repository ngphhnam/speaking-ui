import { TFunction } from "i18next";

/**
 * API Error Response structure
 */
export interface ApiError {
  success: boolean;
  message: string;
  errorCode?: string;
  timestamp?: string;
  metadata?: any;
}

/**
 * Error response from RTK Query
 */
export interface RtkQueryError {
  status?: number;
  data?: ApiError | string;
}

/**
 * Get translated error message from API error response
 * @param error - Error object from API or RTK Query
 * @param t - Translation function from i18next
 * @param fallbackMessage - Default message if translation not found
 * @returns Translated error message
 */
export const getErrorMessage = (
  error: any,
  t: TFunction,
  fallbackMessage?: string
): string => {
  // Check if it's an RTK Query error with data
  if (error && typeof error === "object" && "data" in error) {
    const data = error.data;

    // If data is an ApiError object with errorCode
    if (data && typeof data === "object" && "errorCode" in data) {
      const errorCode = data.errorCode;
      
      // Try to get translation for errorCode
      if (errorCode) {
        const translationKey = `errors.${errorCode}`;
        const translated = t(translationKey);
        
        // If translation exists (not the same as key), return it
        if (translated !== translationKey) {
          return translated;
        }
      }

      // Fallback to message from API
      if (data.message) {
        return data.message;
      }
    }

    // If data is a string
    if (typeof data === "string") {
      return data;
    }

    // If data has detail or message property
    if (data && typeof data === "object") {
      if ("detail" in data && data.detail) {
        return String(data.detail);
      }
      if ("message" in data && data.message) {
        return String(data.message);
      }
    }
  }

  // Check if it's a standard error with message
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  // Check for status code errors
  if (error && typeof error === "object" && "status" in error) {
    const status = error.status;
    
    // Map common HTTP status codes
    switch (status) {
      case 400:
        return t("errors.VALIDATION_001", "Invalid input data");
      case 401:
        return t("errors.AUTH_009", "Unauthorized access");
      case 403:
        return t("errors.AUTH_009", "Unauthorized access");
      case 404:
        return t("errors.AUTH_001", "User not found");
      case 408:
        return t("errors.NETWORK_002", "Request timeout");
      case 500:
        return t("errors.SERVER_001", "Internal server error");
      case 503:
        return t("errors.SERVER_002", "Service temporarily unavailable");
      default:
        return t("errors.UNKNOWN_ERROR", fallbackMessage || "An unexpected error occurred");
    }
  }

  // Return fallback message
  return t("errors.UNKNOWN_ERROR", fallbackMessage || "An unexpected error occurred");
};

/**
 * Check if error code matches
 * @param error - Error object
 * @param code - Error code to check
 * @returns boolean
 */
export const isErrorCode = (error: any, code: string): boolean => {
  if (error && typeof error === "object" && "data" in error) {
    const data = error.data;
    if (data && typeof data === "object" && "errorCode" in data) {
      return data.errorCode === code;
    }
  }
  return false;
};

/**
 * Extract error code from error object
 * @param error - Error object
 * @returns Error code or undefined
 */
export const getErrorCode = (error: any): string | undefined => {
  if (error && typeof error === "object" && "data" in error) {
    const data = error.data;
    if (data && typeof data === "object" && "errorCode" in data) {
      return data.errorCode;
    }
  }
  return undefined;
};





