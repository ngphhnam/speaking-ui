import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ;

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

export type SaveGeneratedVocabularyRequest = {
  word: string;
  definition: string;
  example?: string;
  pronunciation?: string;
  vietnamese_meaning?: string;
  personalNotes?: string;
};

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
      query: (userId) => `/api/user-vocabulary/user/${userId}`,
      transformResponse: (response: ApiResponse<UserVocabularyDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserVocabulary", id: userId },
      ],
    }),
    getLearningVocabulary: builder.query<UserVocabularyDto[], string>({
      query: (userId) => `/api/user-vocabulary/user/${userId}/learning`,
      transformResponse: (response: ApiResponse<UserVocabularyDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserVocabulary", id: `learning-${userId}` },
      ],
    }),
    getMasteredVocabulary: builder.query<UserVocabularyDto[], string>({
      query: (userId) => `/api/user-vocabulary/user/${userId}/mastered`,
      transformResponse: (response: ApiResponse<UserVocabularyDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserVocabulary", id: `mastered-${userId}` },
      ],
    }),
    getDueForReview: builder.query<UserVocabularyDto[], string>({
      query: (userId) => `/api/user-vocabulary/user/${userId}/due-for-review`,
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
        url: "/api/user-vocabulary",
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
        url: `/api/user-vocabulary/${userVocabularyId}`,
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
        url: `/api/user-vocabulary/${userVocabularyId}/review`,
        method: "PUT",
        body: correct,
      }),
      transformResponse: (response: ApiResponse<UserVocabularyDto>) =>
        response.data,
      invalidatesTags: ["UserVocabulary"],
    }),
    getVocabularyStatistics: builder.query<VocabularyStatistics, string>({
      query: (userId) => `/api/user-vocabulary/user/${userId}/statistics`,
      transformResponse: (response: ApiResponse<VocabularyStatistics>) =>
        response.data,
      providesTags: (result, error, userId) => [
        { type: "UserVocabulary", id: `stats-${userId}` },
      ],
    }),
    saveGeneratedVocabulary: builder.mutation<
      any,
      SaveGeneratedVocabularyRequest
    >({
      query: (body) => ({
        url: "/api/user-vocabulary/save-generated",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<any>) => response.data,
      invalidatesTags: ["UserVocabulary"],
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
  useSaveGeneratedVocabularyMutation,
} = userVocabularyApi;















