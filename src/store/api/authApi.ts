import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
} from "@/store/types";
import type { RootState } from "@/store/store";
import {
  clearAuthSession,
  persistAuthSession,
} from "@/store/persistence";
import { clearCredentials, setCredentials } from "@/store/authSlice";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export const authApi = createApi({
  reducerPath: "authApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => response.data,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
          // Tokens are stored in cookies by the backend; do not persist in localStorage.
        } catch {
          /* noop */
        }
      },
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (payload) => ({
        url: "/api/auth/register",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => response.data,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
          // Tokens are stored in cookies by the backend; do not persist in localStorage.
        } catch {
          /* noop */
        }
      },
    }),
    refreshToken: builder.mutation<AuthResponse, RefreshTokenRequest>({
      query: (payload) => ({
        url: "/api/auth/refresh-token",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => response.data,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
          // Tokens are stored in cookies by the backend; do not persist in localStorage.
        } catch {
          dispatch(clearCredentials());
          clearAuthSession();
        }
      },
    }),
    me: builder.query<AuthResponse["user"], void>({
      query: () => "/api/auth/me",
      transformResponse: (
        response: ApiResponse<AuthResponse["user"]>
      ) => response.data,
    }),
    logout: builder.mutation<{ message: string }, RefreshTokenRequest | void>({
      query: (payload) => ({
        url: "/api/auth/logout",
        method: "POST",
        body: payload ?? null,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearCredentials());
          clearAuthSession();
        }
      },
    }),
    updateProfile: builder.mutation<
      AuthResponse["user"],
      {
        fullName?: string;
        phone?: string;
        targetBandScore?: number;
        currentLevel?: string;
        examDate?: string;
        dateOfBirth?: string;
        bio?: string;
      }
    >({
      query: (payload) => ({
        url: "/api/auth/profile",
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: ApiResponse<AuthResponse["user"]>) =>
        response.data,
    }),
    uploadAvatar: builder.mutation<{ avatarUrl: string }, FormData>({
      query: (formData) => ({
        url: "/api/auth/upload-avatar",
        method: "POST",
        body: formData,
        prepareHeaders: (headers: Headers) => {
          headers.delete("Content-Type");
          return headers;
        },
      }),
      transformResponse: (response: ApiResponse<{ avatarUrl: string }>) =>
        response.data,
    }),
    deleteAvatar: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/api/auth/avatar",
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
    }),
    changePassword: builder.mutation<
      { message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (payload) => ({
        url: "/api/auth/change-password",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useMeQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useDeleteAvatarMutation,
  useChangePasswordMutation,
} = authApi;

