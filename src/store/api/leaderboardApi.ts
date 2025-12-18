import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  score?: number;
  streak?: number;
  practiceTime?: number;
}

export interface MyRankResponse {
  rank: number;
  totalUsers: number;
  score?: number;
  streak?: number;
  practiceTime?: number;
  percentile: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export const leaderboardApi = createApi({
  reducerPath: "leaderboardApi",
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
  tagTypes: ["Leaderboard"],
  endpoints: (builder) => ({
    getTopScores: builder.query<
      LeaderboardEntry[],
      { period?: "all" | "week" | "month"; limit?: number }
    >({
      query: ({ period = "all", limit = 50 }) => {
        const params = new URLSearchParams();
        params.append("period", period);
        params.append("limit", limit.toString());
        return `/api/leaderboard/top-scores?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<LeaderboardEntry[]>) =>
        response.data ?? [],
      providesTags: ["Leaderboard"],
    }),
    getTopStreaks: builder.query<LeaderboardEntry[], { limit?: number }>({
      query: ({ limit = 50 }) => {
        const params = new URLSearchParams();
        params.append("limit", limit.toString());
        return `/api/leaderboard/top-streaks?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<LeaderboardEntry[]>) =>
        response.data ?? [],
      providesTags: ["Leaderboard"],
    }),
    getTopPracticeTime: builder.query<
      LeaderboardEntry[],
      { period?: "week" | "month" | "all"; limit?: number }
    >({
      query: ({ period = "month", limit = 50 }) => {
        const params = new URLSearchParams();
        params.append("period", period);
        params.append("limit", limit.toString());
        return `/api/leaderboard/top-practice-time?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<LeaderboardEntry[]>) =>
        response.data ?? [],
      providesTags: ["Leaderboard"],
    }),
    getMyRank: builder.query<
      MyRankResponse,
      { category?: "score" | "streak" | "practice-time"; period?: string }
    >({
      query: ({ category = "score", period = "all" }) => {
        const params = new URLSearchParams();
        params.append("category", category);
        params.append("period", period);
        return `/api/leaderboard/my-rank?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<MyRankResponse>) =>
        response.data,
      providesTags: ["Leaderboard"],
    }),
  }),
});

export const {
  useGetTopScoresQuery,
  useGetTopStreaksQuery,
  useGetTopPracticeTimeQuery,
  useGetMyRankQuery,
} = leaderboardApi;






