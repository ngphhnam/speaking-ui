import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ;

export type GrammarCorrection = {
  original: string;
  corrected: string;
  corrections: Array<{
    original: string;
    corrected: string;
    reason: string;
  }>;
  explanation: string;
};

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  totalPracticeDays: number;
  isNewRecord: boolean;
  streakContinued: boolean;
  streakRecovered: boolean;
  streakBroken: boolean;
};

export type SubmitAnswerResponse = {
  recordingId: string;
  analysisResultId: string;
  transcription: string;
  correctedTranscription?: string;
  scores: {
    overallBandScore: number;
    fluencyScore: number;
    vocabularyScore: number;
    grammarScore: number;
    pronunciationScore: number;
  };
  feedback: string;
  grammarReport?: string;
  grammarCorrection?: GrammarCorrection;
  sampleAnswers?: string[] | null;
  keyVocabulary?: string[] | null;
  streak?: StreakData;
};

export type ApiResponseWrapper<T> = {
  success: boolean;
  data: T;
  message: string;
  errorCode?: string | null;
  timestamp: string;
  metadata?: unknown | null;
};

export type SubmitAnswerRequest = {
  audio: Blob;
  questionId: string;
  topic?: string;
  level?: string;
};

// Mock test submit answer response (NO scores/feedback here)
export type SubmitMockTestAnswerResponse = {
  recordingId: string;
  status: "submitted";
  message: string;
};

export type SubmitMockTestAnswerRequest = {
  mockTestId: string;
  audio: Blob | File;
  questionId: string;
};

export const answerApi = createApi({
  reducerPath: "answerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Answer"],
  endpoints: (builder) => ({
    submitAnswer: builder.mutation<SubmitAnswerResponse, SubmitAnswerRequest>({
      query: ({ audio, questionId, topic, level }) => {
        const formData = new FormData();
        formData.append("audio", audio, "recording.webm");
        formData.append("questionId", questionId);
        if (topic) {
          formData.append("topic", topic);
        }
        if (level) {
          formData.append("level", level);
        }
        return {
          url: "/api/answers/submit",
          method: "POST",
          body: formData,
          // Don't set Content-Type header, browser will set it automatically with boundary for FormData
          prepareHeaders: (headers: Headers) => {
            // Remove Content-Type to let browser set it automatically for FormData
            headers.delete("Content-Type");
            return headers;
          },
        };
      },
      transformResponse: (response: ApiResponseWrapper<SubmitAnswerResponse>) => {
        return response.data;
      },
      invalidatesTags: ["Answer"],
    }),

    // Mock test: submit audio answer without returning scores
    submitMockTestAnswer: builder.mutation<
      SubmitMockTestAnswerResponse,
      SubmitMockTestAnswerRequest
    >({
      query: ({ mockTestId, audio, questionId }) => {
        const formData = new FormData();
        formData.append("questionId", questionId);
        const fileName =
          typeof (audio as File)?.name === "string" && (audio as File).name
            ? (audio as File).name
            : "recording.webm";
        formData.append("audio", audio, fileName);

        return {
          url: `/api/answers/submit?mockTestId=${encodeURIComponent(mockTestId)}`,
          method: "POST",
          body: formData,
          // Don't set Content-Type header, browser will set it automatically with boundary for FormData
          prepareHeaders: (headers: Headers) => {
            headers.delete("Content-Type");
            return headers;
          },
        };
      },
      transformResponse: (
        response: ApiResponseWrapper<SubmitMockTestAnswerResponse>
      ) => response.data,
      invalidatesTags: ["Answer"],
    }),
  }),
});

export const { useSubmitAnswerMutation, useSubmitMockTestAnswerMutation } =
  answerApi;

