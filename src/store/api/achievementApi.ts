import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface AchievementDto {
  id: string;
  title: string;
  description: string;
  achievementType: "practice_streak" | "total_questions" | "score_milestone" | "total_practice_days";
  points: number;
  badgeIconUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievementDto {
  id: string;
  userId: string;
  achievementId: string;
  achievement: AchievementDto;
  progress: number | null;
  isCompleted: boolean;
  earnedAt: string | null;
  createdAt: string;
}

export interface CreateAchievementRequest {
  title: string;
  description: string;
  achievementType: "practice_streak" | "total_questions" | "score_milestone" | "total_practice_days";
  points: number;
  badgeIconUrl?: string;
}

export interface UpdateAchievementRequest {
  title?: string;
  description?: string;
  achievementType?: "practice_streak" | "total_questions" | "score_milestone" | "total_practice_days";
  points?: number;
  badgeIconUrl?: string;
  isActive?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export const achievementApi = createApi({
  reducerPath: "achievementApi",
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
  tagTypes: ["Achievement", "UserAchievement"],
  endpoints: (builder) => ({
    getAllAchievements: builder.query<AchievementDto[], void>({
      query: () => "/api/achievements",
      transformResponse: (response: ApiResponse<AchievementDto[]>) =>
        response.data ?? [],
      providesTags: ["Achievement"],
    }),
    getAchievementById: builder.query<AchievementDto, string>({
      query: (achievementId) => `/api/achievements/${achievementId}`,
      transformResponse: (response: ApiResponse<AchievementDto>) =>
        response.data,
      providesTags: (result, error, achievementId) => [
        { type: "Achievement", id: achievementId },
      ],
    }),
    getActiveAchievements: builder.query<AchievementDto[], void>({
      query: () => "/api/achievements/active",
      transformResponse: (response: ApiResponse<AchievementDto[]>) =>
        response.data ?? [],
      providesTags: ["Achievement"],
    }),
    uploadBadgeIcon: builder.mutation<{ badgeIconUrl: string }, FormData>({
      query: (formData) => ({
        url: "/api/achievements/upload-badge-icon",
        method: "POST",
        body: formData,
        prepareHeaders: (headers: Headers) => {
          headers.delete("Content-Type");
          return headers;
        },
      }),
      transformResponse: (response: ApiResponse<{ badgeIconUrl: string }>) =>
        response.data,
    }),
    createAchievement: builder.mutation<
      AchievementDto,
      CreateAchievementRequest
    >({
      query: (body) => ({
        url: "/api/achievements",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<AchievementDto>) =>
        response.data,
      invalidatesTags: ["Achievement"],
    }),
    updateAchievement: builder.mutation<
      AchievementDto,
      { achievementId: string; data: UpdateAchievementRequest }
    >({
      query: ({ achievementId, data }) => ({
        url: `/api/achievements/${achievementId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<AchievementDto>) =>
        response.data,
      invalidatesTags: (result, error, { achievementId }) => [
        { type: "Achievement", id: achievementId },
        "Achievement",
      ],
    }),
    uploadAndUpdateBadgeIcon: builder.mutation<
      AchievementDto,
      { achievementId: string; formData: FormData }
    >({
      query: ({ achievementId, formData }) => ({
        url: `/api/achievements/${achievementId}/upload-badge-icon`,
        method: "POST",
        body: formData,
        prepareHeaders: (headers: Headers) => {
          headers.delete("Content-Type");
          return headers;
        },
      }),
      transformResponse: (response: ApiResponse<AchievementDto>) =>
        response.data,
      invalidatesTags: (result, error, { achievementId }) => [
        { type: "Achievement", id: achievementId },
      ],
    }),
    deleteAchievement: builder.mutation<{ message: string }, string>({
      query: (achievementId) => ({
        url: `/api/achievements/${achievementId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: ["Achievement"],
    }),
    getUserAchievements: builder.query<UserAchievementDto[], string>({
      query: (userId) => `/api/user-achievements/user/${userId}`,
      transformResponse: (response: ApiResponse<UserAchievementDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserAchievement", id: userId },
      ],
    }),
    getCompletedAchievements: builder.query<UserAchievementDto[], string>({
      query: (userId) => `/api/user-achievements/user/${userId}/completed`,
      transformResponse: (response: ApiResponse<UserAchievementDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserAchievement", id: `completed-${userId}` },
      ],
    }),
    getInProgressAchievements: builder.query<UserAchievementDto[], string>({
      query: (userId) => `/api/user-achievements/user/${userId}/in-progress`,
      transformResponse: (response: ApiResponse<UserAchievementDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserAchievement", id: `progress-${userId}` },
      ],
    }),
  }),
});

export const {
  useGetAllAchievementsQuery,
  useGetAchievementByIdQuery,
  useGetActiveAchievementsQuery,
  useUploadBadgeIconMutation,
  useCreateAchievementMutation,
  useUpdateAchievementMutation,
  useUploadAndUpdateBadgeIconMutation,
  useDeleteAchievementMutation,
  useGetUserAchievementsQuery,
  useGetCompletedAchievementsQuery,
  useGetInProgressAchievementsQuery,
} = achievementApi;














