import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
}

export interface DependencyStatus {
  name: string;
  status: string;
  responseTime: number;
  message?: string;
}

export interface DependenciesCheck {
  database: DependencyStatus;
  redis: DependencyStatus;
  minio: DependencyStatus;
  openai?: DependencyStatus;
  groq?: DependencyStatus;
}

export interface RouteInfo {
  method: string;
  path: string;
  controller: string;
  action: string;
  requiresAuth: boolean;
  roles: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export const healthApi = createApi({
  reducerPath: "healthApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Health"],
  endpoints: (builder) => ({
    healthCheck: builder.query<HealthStatus, void>({
      query: () => "/api/health",
      transformResponse: (response: ApiResponse<HealthStatus>) =>
        response.data,
      providesTags: ["Health"],
    }),
    checkDependencies: builder.query<DependenciesCheck, void>({
      query: () => "/api/health/dependencies",
      transformResponse: (response: ApiResponse<DependenciesCheck>) =>
        response.data,
      providesTags: ["Health"],
    }),
    getAllRoutes: builder.query<RouteInfo[], void>({
      query: () => "/api/routes",
      transformResponse: (response: ApiResponse<RouteInfo[]>) =>
        response.data ?? [],
      providesTags: ["Health"],
    }),
  }),
});

export const {
  useHealthCheckQuery,
  useCheckDependenciesQuery,
  useGetAllRoutesQuery,
} = healthApi;












