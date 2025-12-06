export type UserDto = {
  id: string;
  email: string;
  fullName: string;
  /**
   * Primary role returned by the API, e.g. "Admin"
   */
  role: string;
  /**
   * Optional list of roles for future use / backwards compatibility.
   */
  roles?: string[];
};

export type AuthResponse = {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  user: UserDto;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
  role?: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

// Generic API response wrapper used across the app
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string | null;
  timestamp?: string;
  metadata?: unknown;
};


