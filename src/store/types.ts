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
  /**
   * URL to the user's avatar image
   */
  avatarUrl?: string | null;
  /**
   * User's phone number
   */
  phone?: string | null;
  /**
   * Target IELTS band score
   */
  targetBandScore?: number | null;
  /**
   * Current English level
   */
  currentLevel?: string | null;
  /**
   * Exam date
   */
  examDate?: string | null;
  /**
   * Date of birth
   */
  dateOfBirth?: string | null;
  /**
   * User bio/description
   */
  bio?: string | null;
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


