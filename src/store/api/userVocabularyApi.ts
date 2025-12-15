import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface UserVocabularyDto {
  id: string;
  userId: string;
  vocabularyId: string;
  learningStatus: "new" | "learning" | "reviewing" | "mastered";
  masteryLevel: number;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  personalNotes: string | null;
  addedAt: string;
  vocabulary?: any;
}

export interface VocabularyStatistics {
  totalVocabulary: number;
  newWords: number;
  learningWords: number;
  reviewingWords: number;
  masteredWords: number;
  averageMasteryLevel: number;
  totalReviews: number;
  correctRate: number;
}

export interface AddVocabularyToUserListRequest {
  vocabularyId: string;
  personalNotes?: string;
}

export interface UpdateUserVocabularyRequest {
  learningStatus?: "new" | "learning" | "reviewing" | "mastered";
  personalNotes?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export const userVocabularyApi = createApi({
  reducerPath: "userVocabularyApi",
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
  tagTypes: ["UserVocabulary"],
  endpoints: (builder) => ({
    getUserVocabulary: builder.query<UserVocabularyDto[], string>({
      query: (userId) => `/api/uservocabulary/user/${userId}`,
      transformResponse: (response: ApiResponse<UserVocabularyDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserVocabulary", id: userId },
      ],
    }),
    getLearningVocabulary: builder.query<UserVocabularyDto[], string>({
      query: (userId) => `/api/uservocabulary/user/${userId}/learning`,
      transformResponse: (response: ApiResponse<UserVocabularyDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserVocabulary", id: `learning-${userId}` },
      ],
    }),
    getMasteredVocabulary: builder.query<UserVocabularyDto[], string>({
      query: (userId) => `/api/uservocabulary/user/${userId}/mastered`,
      transformResponse: (response: ApiResponse<UserVocabularyDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserVocabulary", id: `mastered-${userId}` },
      ],
    }),
    getDueForReview: builder.query<UserVocabularyDto[], string>({
      query: (userId) => `/api/uservocabulary/user/${userId}/due-for-review`,
      transformResponse: (response: ApiResponse<UserVocabularyDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserVocabulary", id: `due-${userId}` },
      ],
    }),
    addVocabularyToUserList: builder.mutation<
      UserVocabularyDto,
      AddVocabularyToUserListRequest
    >({
      query: (body) => ({
        url: "/api/uservocabulary",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<UserVocabularyDto>) =>
        response.data,
      invalidatesTags: ["UserVocabulary"],
    }),
    updateUserVocabulary: builder.mutation<
      UserVocabularyDto,
      { userVocabularyId: string; data: UpdateUserVocabularyRequest }
    >({
      query: ({ userVocabularyId, data }) => ({
        url: `/api/uservocabulary/${userVocabularyId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<UserVocabularyDto>) =>
        response.data,
      invalidatesTags: (result, error, { userVocabularyId }) => [
        { type: "UserVocabulary", id: userVocabularyId },
        "UserVocabulary",
      ],
    }),
    markAsReviewed: builder.mutation<
      UserVocabularyDto,
      { userVocabularyId: string; correct: boolean }
    >({
      query: ({ userVocabularyId, correct }) => ({
        url: `/api/uservocabulary/${userVocabularyId}/review`,
        method: "PUT",
        body: correct,
      }),
      transformResponse: (response: ApiResponse<UserVocabularyDto>) =>
        response.data,
      invalidatesTags: ["UserVocabulary"],
    }),
    getVocabularyStatistics: builder.query<VocabularyStatistics, string>({
      query: (userId) => `/api/uservocabulary/user/${userId}/statistics`,
      transformResponse: (response: ApiResponse<VocabularyStatistics>) =>
        response.data,
      providesTags: (result, error, userId) => [
        { type: "UserVocabulary", id: `stats-${userId}` },
      ],
    }),
  }),
});

export const {
  useGetUserVocabularyQuery,
  useGetLearningVocabularyQuery,
  useGetMasteredVocabularyQuery,
  useGetDueForReviewQuery,
  useAddVocabularyToUserListMutation,
  useUpdateUserVocabularyMutation,
  useMarkAsReviewedMutation,
  useGetVocabularyStatisticsQuery,
} = userVocabularyApi;



