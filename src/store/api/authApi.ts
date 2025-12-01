import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
          persistAuthSession(data);
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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
          persistAuthSession(data);
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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
          persistAuthSession(data);
        } catch {
          dispatch(clearCredentials());
          clearAuthSession();
        }
      },
    }),
    me: builder.query<AuthResponse["user"], void>({
      query: () => "/api/auth/me",
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
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useMeQuery,
  useLogoutMutation,
} = authApi;

