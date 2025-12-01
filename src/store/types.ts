export type UserDto = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
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

