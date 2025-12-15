import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface RecordingDto {
  id: string;
  sessionId: string;
  userId: string;
  questionId: string;
  audioUrl: string;
  audioFormat: string;
  fileSizeBytes: number;
  durationSeconds: number | null;
  transcriptionText: string;
  transcriptionLanguage: string;
  processingStatus: string;
  refinedText: string;
  recordedAt: string;
  processedAt: string;
  createdAt: string;
}

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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export const recordingApi = createApi({
  reducerPath: "recordingApi",
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
  tagTypes: ["Recording", "AnalysisResult"],
  endpoints: (builder) => ({
    getRecordingsByQuestion: builder.query<RecordingDto[], string>({
      query: (questionId) => `/api/recordings?questionId=${questionId}`,
      transformResponse: (response: ApiResponse<RecordingDto[]>) => {
        // Handle both single recording and array of recordings
        if (Array.isArray(response.data)) {
          return response.data;
        }
        return [response.data];
      },
      providesTags: (result, error, questionId) => [
        { type: "Recording", id: questionId },
      ],
    }),
    getRecordingById: builder.query<RecordingDto, string>({
      query: (recordingId) => `/api/recordings/${recordingId}`,
      transformResponse: (response: ApiResponse<RecordingDto>) => response.data,
      providesTags: (result, error, recordingId) => [
        { type: "Recording", id: recordingId },
      ],
    }),
    getAnalysisResultByRecording: builder.query<AnalysisResultDto, string>({
      query: (recordingId) => `/api/analysis-results/recording/${recordingId}`,
      transformResponse: (response: ApiResponse<AnalysisResultDto>) =>
        response.data,
      providesTags: (result, error, recordingId) => [
        { type: "AnalysisResult", id: recordingId },
      ],
    }),
    getRecordingsByUser: builder.query<RecordingDto[], string>({
      query: (userId) => `/api/recordings/user/${userId}`,
      transformResponse: (response: ApiResponse<RecordingDto[]>) => {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        return [response.data];
      },
      providesTags: (result, error, userId) => [
        { type: "Recording", id: userId },
      ],
    }),
    deleteRecording: builder.mutation<{ message: string }, string>({
      query: (recordingId) => ({
        url: `/api/recordings/${recordingId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: (result, error, recordingId) => [
        { type: "Recording", id: recordingId },
      ],
    }),
    refineResponse: builder.mutation<
      any,
      { recordingId: string; targetBandScore?: number; focusAreas?: string[] }
    >({
      query: ({ recordingId, targetBandScore, focusAreas }) => ({
        url: `/api/recordings/${recordingId}/refine`,
        method: "POST",
        body: { targetBandScore, focusAreas },
      }),
      transformResponse: (response: ApiResponse<any>) => response.data,
      invalidatesTags: (result, error, { recordingId }) => [
        { type: "Recording", id: recordingId },
        { type: "AnalysisResult", id: recordingId },
      ],
    }),
    getRefinementSuggestions: builder.query<any, string>({
      query: (recordingId) => `/api/recordings/${recordingId}/refinement-suggestions`,
      transformResponse: (response: ApiResponse<any>) => response.data,
      providesTags: (result, error, recordingId) => [
        { type: "Recording", id: recordingId },
      ],
    }),
  }),
});

export const {
  useGetRecordingsByQuestionQuery,
  useGetRecordingByIdQuery,
  useGetAnalysisResultByRecordingQuery,
  useGetRecordingsByUserQuery,
  useDeleteRecordingMutation,
  useRefineResponseMutation,
  useGetRefinementSuggestionsQuery,
} = recordingApi;


