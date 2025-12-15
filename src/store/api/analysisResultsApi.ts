import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface AnalysisResultDto {
  id: string;
  recordingId: string;
  userId: string;
  overallBandScore: number;
  fluencyScore: number;
  vocabularyScore: number;
  grammarScore: number;
  pronunciationScore: number;
  feedbackSummary: string;
  strengths: string | null;
  improvements: string | null;
  grammarIssues: string | null;
  pronunciationIssues: string | null;
  vocabularySuggestions: string | null;
  corrections: Array<{
    original: string;
    corrected: string;
    reason: string;
  }>;
  analyzedAt: string;
  createdAt: string;
}

export interface UserStatistics {
  totalRecordings: number;
  averageScore: number;
  averageFluency: number;
  averageVocabulary: number;
  averageGrammar: number;
  averagePronunciation: number;
  improvementRate: number;
}

export interface ScoreTrend {
  date: string;
  overallScore: number;
  fluencyScore: number;
  vocabularyScore: number;
  grammarScore: number;
  pronunciationScore: number;
}

export interface WeakArea {
  category: string;
  averageScore: number;
  occurrenceCount: number;
  suggestions: string[];
}

export interface Strength {
  category: string;
  averageScore: number;
  description: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export const analysisResultsApi = createApi({
  reducerPath: "analysisResultsApi",
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
  tagTypes: ["AnalysisResult"],
  endpoints: (builder) => ({
    getAnalysisById: builder.query<AnalysisResultDto, string>({
      query: (analysisId) => `/api/analysis-results/${analysisId}`,
      transformResponse: (response: ApiResponse<AnalysisResultDto>) =>
        response.data,
      providesTags: (result, error, analysisId) => [
        { type: "AnalysisResult", id: analysisId },
      ],
    }),
    getAnalysisByRecording: builder.query<AnalysisResultDto, string>({
      query: (recordingId) => `/api/analysis-results/recording/${recordingId}`,
      transformResponse: (response: ApiResponse<AnalysisResultDto>) =>
        response.data,
      providesTags: (result, error, recordingId) => [
        { type: "AnalysisResult", id: recordingId },
      ],
    }),
    getUserAnalysisResults: builder.query<AnalysisResultDto[], string>({
      query: (userId) => `/api/analysis-results/user/${userId}`,
      transformResponse: (response: ApiResponse<AnalysisResultDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "AnalysisResult", id: `user-${userId}` },
      ],
    }),
    getUserStatistics: builder.query<UserStatistics, string>({
      query: (userId) => `/api/analysis-results/user/${userId}/statistics`,
      transformResponse: (response: ApiResponse<UserStatistics>) =>
        response.data,
      providesTags: (result, error, userId) => [
        { type: "AnalysisResult", id: `stats-${userId}` },
      ],
    }),
    getScoreTrends: builder.query<ScoreTrend[], { userId: string; days?: number }>({
      query: ({ userId, days = 30 }) =>
        `/api/analysis-results/user/${userId}/trends?days=${days}`,
      transformResponse: (response: ApiResponse<ScoreTrend[]>) =>
        response.data ?? [],
      providesTags: (result, error, { userId }) => [
        { type: "AnalysisResult", id: `trends-${userId}` },
      ],
    }),
    getWeakAreas: builder.query<WeakArea[], string>({
      query: (userId) => `/api/analysis-results/user/${userId}/weak-areas`,
      transformResponse: (response: ApiResponse<WeakArea[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "AnalysisResult", id: `weak-${userId}` },
      ],
    }),
    getStrengths: builder.query<Strength[], string>({
      query: (userId) => `/api/analysis-results/user/${userId}/strengths`,
      transformResponse: (response: ApiResponse<Strength[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "AnalysisResult", id: `strength-${userId}` },
      ],
    }),
  }),
});

export const {
  useGetAnalysisByIdQuery,
  useGetAnalysisByRecordingQuery,
  useGetUserAnalysisResultsQuery,
  useGetUserStatisticsQuery,
  useGetScoreTrendsQuery,
  useGetWeakAreasQuery,
  useGetStrengthsQuery,
} = analysisResultsApi;



