import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";
import type { UserDto } from "@/store/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface PaginatedUsersResponse {
  items: UserDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  role?: string;
  search?: string;
}

export interface AssignRoleRequest {
  role: string;
}

export interface ApiUsageLog {
  id: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  aiModel: string | null;
  tokensUsed: number | null;
  estimatedCost: number | null;
  timestamp: string;
}

export interface ApiUsageStatistics {
  totalRequests: number;
  totalTokensUsed: number;
  totalCost: number;
  averageResponseTime: number;
  requestsByEndpoint: Record<string, number>;
  requestsByModel: Record<string, number>;
}

export interface ApiCostSummary {
  totalCost: number;
  costByModel: Record<string, number>;
  costByEndpoint: Record<string, number>;
  monthlyTrend: Array<{
    month: string;
    cost: number;
  }>;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

export interface PaginatedApiUsageLogsResponse {
  items: ApiUsageLog[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedAuditLogsResponse {
  items: AuditLog[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export const adminApi = createApi({
  reducerPath: "adminApi",
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
  tagTypes: ["Admin", "ApiUsage", "AuditLog"],
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedUsersResponse, GetUsersParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.pageSize)
          searchParams.append("pageSize", params.pageSize.toString());
        if (params.role) searchParams.append("role", params.role);
        if (params.search) searchParams.append("search", params.search);
        return `/api/admin/users?${searchParams.toString()}`;
      },
      transformResponse: (response: ApiResponse<PaginatedUsersResponse>) =>
        response.data,
      providesTags: ["Admin"],
    }),
    assignRole: builder.mutation<
      { message: string },
      { userId: string; role: string }
    >({
      query: ({ userId, role }) => ({
        url: `/api/admin/users/${userId}/roles`,
        method: "POST",
        body: { role },
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: ["Admin"],
    }),
    lockUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/api/admin/users/${userId}/lock`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: ["Admin"],
    }),
    unlockUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/api/admin/users/${userId}/unlock`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: ["Admin"],
    }),
    getApiUsageLogs: builder.query<
      PaginatedApiUsageLogsResponse,
      { page?: number; pageSize?: number }
    >({
      query: ({ page = 1, pageSize = 50 }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("pageSize", pageSize.toString());
        return `/api/admin/api-usage-logs?${params.toString()}`;
      },
      transformResponse: (
        response: ApiResponse<PaginatedApiUsageLogsResponse>
      ) => response.data,
      providesTags: ["ApiUsage"],
    }),
    getApiUsageStatistics: builder.query<ApiUsageStatistics, void>({
      query: () => "/api/admin/api-usage-logs/statistics",
      transformResponse: (response: ApiResponse<ApiUsageStatistics>) =>
        response.data,
      providesTags: ["ApiUsage"],
    }),
    getApiCosts: builder.query<ApiCostSummary, void>({
      query: () => "/api/admin/api-usage-logs/costs",
      transformResponse: (response: ApiResponse<ApiCostSummary>) =>
        response.data,
      providesTags: ["ApiUsage"],
    }),
    getAuditLogs: builder.query<
      PaginatedAuditLogsResponse,
      { page?: number; pageSize?: number }
    >({
      query: ({ page = 1, pageSize = 50 }) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("pageSize", pageSize.toString());
        return `/api/admin/audit-logs?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<PaginatedAuditLogsResponse>) =>
        response.data,
      providesTags: ["AuditLog"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useAssignRoleMutation,
  useLockUserMutation,
  useUnlockUserMutation,
  useGetApiUsageLogsQuery,
  useGetApiUsageStatisticsQuery,
  useGetApiCostsQuery,
  useGetAuditLogsQuery,
} = adminApi;






