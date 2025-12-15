import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface UserStatistics {
  totalQuestions: number;
  totalRecordings: number;
  averageScore: number | null;
  totalPracticeTime: number; // in minutes
  streakDays: number;
  lastPracticeDate: string | null;
  scoresBySkill: {
    fluency: number;
    vocabulary: number;
    grammar: number;
    pronunciation: number;
  };
  progressByMonth: Array<{
    month: string;
    averageScore: number;
    totalRecordings: number;
  }>;
  weakTopics: Array<{
    topicId: string;
    topicTitle: string;
    averageScore: number;
    totalAttempts: number;
  }>;
  recentRecordings: Array<{
    id: string;
    questionId: string;
    questionText: string;
    recordedAt: string;
    overallScore: number | null;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export const statisticsApi = createApi({
  reducerPath: "statisticsApi",
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
  tagTypes: ["Statistics"],
  endpoints: (builder) => ({
    getUserStatistics: builder.query<UserStatistics, void>({
      query: () => `/api/statistics/user`,
      transformResponse: (response: ApiResponse<UserStatistics>) =>
        response.data,
      providesTags: ["Statistics"],
    }),
  }),
});

export const { useGetUserStatisticsQuery } = statisticsApi;




