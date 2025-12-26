import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface UserProgressDto {
  userId: string;
  totalSessions: number;
  totalPracticeTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  totalQuestionsAnswered: number;
  averageScore: number;
  lastPracticeDate: string | null;
  level: string;
  experiencePoints: number;
  nextLevelPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyProgressDto {
  date: string;
  sessionsCompleted: number;
  practiceTimeMinutes: number;
  questionsAnswered: number;
  averageScore: number;
}

export interface WeeklyProgressDto {
  weekStart: string;
  weekEnd: string;
  sessionsCompleted: number;
  practiceTimeMinutes: number;
  questionsAnswered: number;
  averageScore: number;
  daysActive: number;
}

export interface MonthlyProgressDto {
  month: string;
  year: number;
  sessionsCompleted: number;
  practiceTimeMinutes: number;
  questionsAnswered: number;
  averageScore: number;
  daysActive: number;
}

export interface ProgressStatistics {
  totalSessions: number;
  totalPracticeTime: number;
  totalQuestions: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  level: string;
  experiencePoints: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface ProgressTrends {
  scoreTrend: TrendDataPoint[];
  practiceTimeTrend: TrendDataPoint[];
  sessionsTrend: TrendDataPoint[];
}

export interface ImprovementData {
  overallImprovement: number;
  fluencyImprovement: number;
  vocabularyImprovement: number;
  grammarImprovement: number;
  pronunciationImprovement: number;
  comparisonPeriod: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export const userProgressApi = createApi({
  reducerPath: "userProgressApi",
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
  tagTypes: ["UserProgress"],
  endpoints: (builder) => ({
    getUserProgress: builder.query<UserProgressDto, string>({
      query: (userId) => `/api/user-progress/user/${userId}`,
      transformResponse: (response: ApiResponse<UserProgressDto>) =>
        response.data,
      providesTags: (result, error, userId) => [
        { type: "UserProgress", id: userId },
      ],
    }),
    getDailyProgress: builder.query<DailyProgressDto[], string>({
      query: (userId) => `/api/user-progress/user/${userId}/daily`,
      transformResponse: (response: ApiResponse<DailyProgressDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserProgress", id: `daily-${userId}` },
      ],
    }),
    getWeeklyProgress: builder.query<WeeklyProgressDto[], string>({
      query: (userId) => `/api/user-progress/user/${userId}/weekly`,
      transformResponse: (response: ApiResponse<WeeklyProgressDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserProgress", id: `weekly-${userId}` },
      ],
    }),
    getMonthlyProgress: builder.query<MonthlyProgressDto[], string>({
      query: (userId) => `/api/user-progress/user/${userId}/monthly`,
      transformResponse: (response: ApiResponse<MonthlyProgressDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserProgress", id: `monthly-${userId}` },
      ],
    }),
    getProgressStatistics: builder.query<ProgressStatistics, string>({
      query: (userId) => `/api/user-progress/user/${userId}/statistics`,
      transformResponse: (response: ApiResponse<ProgressStatistics>) =>
        response.data,
      providesTags: (result, error, userId) => [
        { type: "UserProgress", id: `stats-${userId}` },
      ],
    }),
    getProgressTrends: builder.query<
      ProgressTrends,
      { userId: string; periodType?: string; periods?: number }
    >({
      query: ({ userId, periodType = "daily", periods = 30 }) => {
        const params = new URLSearchParams();
        params.append("periodType", periodType);
        params.append("periods", periods.toString());
        return `/api/user-progress/user/${userId}/trends?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<ProgressTrends>) =>
        response.data,
      providesTags: (result, error, { userId }) => [
        { type: "UserProgress", id: `trends-${userId}` },
      ],
    }),
    getImprovement: builder.query<ImprovementData, string>({
      query: (userId) => `/api/user-progress/user/${userId}/improvement`,
      transformResponse: (response: ApiResponse<ImprovementData>) =>
        response.data,
      providesTags: (result, error, userId) => [
        { type: "UserProgress", id: `improvement-${userId}` },
      ],
    }),
  }),
});

export const {
  useGetUserProgressQuery,
  useGetDailyProgressQuery,
  useGetWeeklyProgressQuery,
  useGetMonthlyProgressQuery,
  useGetProgressStatisticsQuery,
  useGetProgressTrendsQuery,
  useGetImprovementQuery,
} = userProgressApi;












