import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface SpeakingSessionDto {
  id: string;
  userId: string;
  sessionType: "practice" | "mock_test" | "guided";
  status: "active" | "completed" | "cancelled";
  topicId: string | null;
  startedAt: string;
  completedAt: string | null;
  totalDurationSeconds: number;
  questionsAnswered: number;
  averageScore: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// DTO used for learning history list (paginated)
export interface SpeakingSessionHistoryItem {
  id: string;
  topic: string;
  level: string;
  bandScore: number;
  status: string;
  totalDurationSeconds: number | null;
  overallBandScore: number;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface SessionStatistics {
  totalSessions: number;
  completedSessions: number;
  activeSessions: number;
  totalPracticeTime: number;
  averageSessionDuration: number;
  totalQuestionsAnswered: number;
  averageScore: number;
  lastSessionDate: string | null;
}

export interface GetSessionsParams {
  userId?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export const speakingSessionApi = createApi({
  reducerPath: "speakingSessionApi",
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
  tagTypes: ["SpeakingSession"],
  endpoints: (builder) => ({
    // Paginated speaking sessions for learning history
    getAllSessions: builder.query<
      PaginatedResult<SpeakingSessionHistoryItem>,
      { userId: string; pageNum?: number; pageSize?: number }
    >({
      query: ({ userId, pageNum = 1, pageSize = 5 }) => {
        const searchParams = new URLSearchParams();
        searchParams.append("userId", userId);
        searchParams.append("pageNum", pageNum.toString());
        // Backend expects "PageSize" (capital S) based on provided example URL
        searchParams.append("PageSize", pageSize.toString());
        return `/api/session/speaking-session?${searchParams.toString()}`;
      },
      transformResponse: (
        response: ApiResponse<PaginatedResult<SpeakingSessionHistoryItem>>
      ) => response.data,
      providesTags: ["SpeakingSession"],
    }),
    getSessionById: builder.query<SpeakingSessionDto, string>({
      query: (sessionId) => `/api/session/speaking-session/${sessionId}`,
      transformResponse: (response: ApiResponse<SpeakingSessionDto>) =>
        response.data,
      providesTags: (result, error, sessionId) => [
        { type: "SpeakingSession", id: sessionId },
      ],
    }),
    getUserSessionStatistics: builder.query<SessionStatistics, string>({
      query: (userId) =>
        `/api/session/speaking-session/user/${userId}/statistics`,
      transformResponse: (response: ApiResponse<SessionStatistics>) =>
        response.data,
      providesTags: (result, error, userId) => [
        { type: "SpeakingSession", id: `stats-${userId}` },
      ],
    }),
    getActiveSessions: builder.query<SpeakingSessionDto[], string>({
      query: (userId) => `/api/session/speaking-session/user/${userId}/active`,
      transformResponse: (response: ApiResponse<SpeakingSessionDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "SpeakingSession", id: `active-${userId}` },
      ],
    }),
    getCompletedSessions: builder.query<SpeakingSessionDto[], string>({
      query: (userId) =>
        `/api/session/speaking-session/user/${userId}/completed`,
      transformResponse: (response: ApiResponse<SpeakingSessionDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "SpeakingSession", id: `completed-${userId}` },
      ],
    }),
  }),
});

export const {
  useGetAllSessionsQuery,
  useGetSessionByIdQuery,
  useGetUserSessionStatisticsQuery,
  useGetActiveSessionsQuery,
  useGetCompletedSessionsQuery,
} = speakingSessionApi;



