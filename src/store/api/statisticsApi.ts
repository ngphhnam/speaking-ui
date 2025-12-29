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
    fluency: number | null;
    vocabulary: number | null;
    grammar: number | null;
    pronunciation: number | null;
  };
  progressByMonth: Array<{
    month: string;
    averageScore: number | null;
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

// Separate response types for each endpoint
interface StatisticsData {
  totalQuestions: number;
  totalRecordings: number;
  averageScore: number | null;
  totalPracticeTime: number;
  streakDays: number;
  lastPracticeDate: string | null;
}

interface ScoresBySkillData {
  fluency: number | null;
  vocabulary: number | null;
  grammar: number | null;
  pronunciation: number | null;
}

interface ProgressByMonthData {
  month: string;
  averageScore: number | null;
  totalRecordings: number;
}

interface WeakTopicsData {
  topicId: string;
  topicTitle: string;
  averageScore: number;
  totalAttempts: number;
}

interface RecentRecordingsData {
  id: string;
  questionId: string;
  questionText: string;
  recordedAt: string;
  overallScore: number;
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
    getUserStatistics: builder.query<StatisticsData, string>({
      query: (userId) => `/api/statistic/user/${userId}/statistics`,
      transformResponse: (response: ApiResponse<StatisticsData>) =>
        response.data,
      providesTags: (result, error, userId) => [
        { type: "Statistics", id: `stats-${userId}` },
      ],
    }),
    getScoresBySkill: builder.query<ScoresBySkillData, string>({
      query: (userId) => `/api/statistic/user/${userId}/scores-by-skill`,
      transformResponse: (response: ApiResponse<ScoresBySkillData>) =>
        response.data,
      providesTags: (result, error, userId) => [
        { type: "Statistics", id: `scores-${userId}` },
      ],
    }),
    getProgressByMonth: builder.query<ProgressByMonthData[], string>({
      query: (userId) => `/api/statistic/user/${userId}/progress-by-month`,
      transformResponse: (response: ApiResponse<ProgressByMonthData[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "Statistics", id: `progress-${userId}` },
      ],
    }),
    getWeakTopics: builder.query<WeakTopicsData[], string>({
      query: (userId) => `/api/statistic/user/${userId}/weak-topics`,
      transformResponse: (response: ApiResponse<WeakTopicsData[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "Statistics", id: `topics-${userId}` },
      ],
    }),
    getRecentRecordings: builder.query<RecentRecordingsData[], string>({
      query: (userId) => `/api/statistic/user/${userId}/recent-recordings`,
      transformResponse: (response: ApiResponse<RecentRecordingsData[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "Statistics", id: `recordings-${userId}` },
      ],
    }),
    // Combined query that fetches all statistics and merges them
    getAllUserStatistics: builder.query<UserStatistics, string>({
      async queryFn(userId, _queryApi, _extraOptions, fetchWithBQ) {
        // Fetch all endpoints in parallel
        const [statsResult, scoresResult, progressResult, topicsResult, recordingsResult] =
          await Promise.all([
            fetchWithBQ(`/api/statistic/user/${userId}/statistics`),
            fetchWithBQ(`/api/statistic/user/${userId}/scores-by-skill`),
            fetchWithBQ(`/api/statistic/user/${userId}/progress-by-month`),
            fetchWithBQ(`/api/statistic/user/${userId}/weak-topics`),
            fetchWithBQ(`/api/statistic/user/${userId}/recent-recordings`),
          ]);

        // Check for errors
        if (statsResult.error) return { error: statsResult.error };
        if (scoresResult.error) return { error: scoresResult.error };
        if (progressResult.error) return { error: progressResult.error };
        if (topicsResult.error) return { error: topicsResult.error };
        if (recordingsResult.error) return { error: recordingsResult.error };

        // Transform responses
        const stats = (statsResult.data as ApiResponse<StatisticsData>).data;
        const scores = (scoresResult.data as ApiResponse<ScoresBySkillData>).data;
        const progress = (progressResult.data as ApiResponse<ProgressByMonthData[]>).data ?? [];
        const topics = (topicsResult.data as ApiResponse<WeakTopicsData[]>).data ?? [];
        const recordings = (recordingsResult.data as ApiResponse<RecentRecordingsData[]>).data ?? [];

        // Merge all data into UserStatistics
        const merged: UserStatistics = {
          ...stats,
          scoresBySkill: scores,
          progressByMonth: progress,
          weakTopics: topics,
          recentRecordings: recordings,
        };

        return { data: merged };
      },
      providesTags: (result, error, userId) => [
        { type: "Statistics", id: `all-${userId}` },
      ],
    }),
  }),
});

export const {
  useGetUserStatisticsQuery,
  useGetScoresBySkillQuery,
  useGetProgressByMonthQuery,
  useGetWeakTopicsQuery,
  useGetRecentRecordingsQuery,
  useGetAllUserStatisticsQuery,
} = statisticsApi;




