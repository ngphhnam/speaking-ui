import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ;

export type MockTestStatus = "in_progress" | "completed" | "cancelled";

export type MockTestQuestionDto = {
  id: string;
  questionText: string;
  questionType: "PART1" | "PART2" | "PART3";
  timeLimitSeconds: number;
  keyVocabulary: string[] | null;
};

export interface MockTestDto {
  id: string;
  userId: string;
  status: MockTestStatus;
  startedAt: string;
  completedAt: string | null;
  overallScore: number | null;

  part1Questions: MockTestQuestionDto[];
  part2Questions: MockTestQuestionDto[];
  part3Questions: MockTestQuestionDto[];

  answeredQuestionIds: string[];
  part1CompletedAt: string | null;
  part2CompletedAt: string | null;
  part3CompletedAt: string | null;
}

export interface StartMockTestRequest {
  part1QuestionCount?: number;
  part2QuestionCount?: number;
  part3QuestionCount?: number;
}

export interface SubmitPartRequest {
  part: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export type SubmitQuestionRequest = {
  questionId: string;
};

export type SubmitQuestionResponse = {
  questionId: string;
  answeredCount: number;
  totalQuestions: number;
};

export type QuestionScore = {
  questionId: string;
  hasAnswer: boolean;
  overallBandScore: number;
  fluencyScore: number;
  vocabularyScore: number;
  grammarScore: number;
  pronunciationScore: number;
  recordingId: string;
  analysisResultId: string;
  recordedAt: string;
};

type RawQuestionScore = {
  questionId: string;
  part: number;
  hasAnswer: boolean;
  score: number;
  fluencyScore: number;
  vocabularyScore: number;
  grammarScore: number;
  pronunciationScore: number;
  recordingId: string;
  analysisResultId: string;
  recordedAt: string;
};

export type PartScores = {
  averageScore: number;
  questionScores: QuestionScore[];
};

export type MockTestScores = {
  overallScore: number;
  part1: PartScores;
  part2: PartScores;
  part3: PartScores;
};

function normalizeQuestionScoresPayload(data: unknown): MockTestScores | null {
  const d: any = data as any;

  // Shape: RawQuestionScore[]
  if (Array.isArray(d)) {
    const toQuestionScore = (x: RawQuestionScore): QuestionScore => ({
      questionId: x.questionId,
      hasAnswer: x.hasAnswer,
      overallBandScore: x.score,
      fluencyScore: x.fluencyScore,
      vocabularyScore: x.vocabularyScore,
      grammarScore: x.grammarScore,
      pronunciationScore: x.pronunciationScore,
      recordingId: x.recordingId,
      analysisResultId: x.analysisResultId,
      recordedAt: x.recordedAt,
    });

    const p1 = d.filter((x: RawQuestionScore) => x.part === 1).map(toQuestionScore);
    const p2 = d.filter((x: RawQuestionScore) => x.part === 2).map(toQuestionScore);
    const p3 = d.filter((x: RawQuestionScore) => x.part === 3).map(toQuestionScore);

    const avg = (items: QuestionScore[]) => {
      const nums = items
        .filter((q) => q.hasAnswer)
        .map((q) => q.overallBandScore)
        .filter((n) => typeof n === "number" && !Number.isNaN(n));
      if (nums.length === 0) return 0;
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    };

    const all = [...p1, ...p2, ...p3];
    return {
      overallScore: avg(all),
      part1: { averageScore: avg(p1), questionScores: p1 },
      part2: { averageScore: avg(p2), questionScores: p2 },
      part3: { averageScore: avg(p3), questionScores: p3 },
    };
  }

  // Shape: { questionScores: RawQuestionScore[] }
  if (d?.questionScores && Array.isArray(d.questionScores)) {
    return normalizeQuestionScoresPayload(d.questionScores);
  }

  // Shape: { scores: MockTestScores } or { mockTest, scores }
  if (d?.scores?.overallScore != null) return d.scores as MockTestScores;

  // Shape: MockTestScores
  if (d?.overallScore != null && d?.part1 && d?.part2 && d?.part3) return d as MockTestScores;

  return null;
}

export type CompleteMockTestResponse = {
  mockTest: MockTestDto;
  scores: MockTestScores;
};

export const mockTestApi = createApi({
  reducerPath: "mockTestApi",
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
  tagTypes: ["MockTest"],
  endpoints: (builder) => ({
    startMockTest: builder.mutation<MockTestDto, StartMockTestRequest>({
      query: (body) => ({
        url: "/api/mock-tests/start",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<MockTestDto>) => response.data,
      invalidatesTags: ["MockTest"],
    }),
    getMockTestById: builder.query<MockTestDto, string>({
      query: (mockTestId) => `/api/mock-tests/${mockTestId}`,
      transformResponse: (response: ApiResponse<MockTestDto>) => response.data,
      providesTags: (result, error, mockTestId) => [
        { type: "MockTest", id: mockTestId },
      ],
    }),
    submitQuestion: builder.mutation<
      SubmitQuestionResponse,
      { mockTestId: string; questionId: string }
    >({
      query: ({ mockTestId, questionId }) => ({
        url: `/api/mock-tests/${mockTestId}/submit-question`,
        method: "POST",
        body: { questionId } satisfies SubmitQuestionRequest,
      }),
      transformResponse: (response: ApiResponse<SubmitQuestionResponse>) =>
        response.data,
      invalidatesTags: (result, error, { mockTestId }) => [
        { type: "MockTest", id: mockTestId },
      ],
    }),
    submitPart: builder.mutation<MockTestDto, { mockTestId: string; part: number }>({
      query: ({ mockTestId, part }) => ({
        url: `/api/mock-tests/${mockTestId}/submit-part`,
        method: "POST",
        body: { part },
      }),
      transformResponse: (response: ApiResponse<MockTestDto>) => response.data,
      invalidatesTags: (result, error, { mockTestId }) => [
        { type: "MockTest", id: mockTestId },
      ],
    }),
    completeMockTest: builder.mutation<CompleteMockTestResponse, string>({
      query: (mockTestId) => ({
        url: `/api/mock-tests/${mockTestId}/complete`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<CompleteMockTestResponse>) =>
        response.data,
      invalidatesTags: (result, error, mockTestId) => [
        { type: "MockTest", id: mockTestId },
        "MockTest",
      ],
    }),
    getMyMockTestHistory: builder.query<MockTestDto[], void>({
      query: () => `/api/mock-tests/my-history`,
      transformResponse: (response: ApiResponse<MockTestDto[]>) =>
        response.data ?? [],
      providesTags: [{ type: "MockTest", id: "my-history" }],
    }),
    getQuestionScores: builder.query<MockTestScores, string>({
      query: (mockTestId) => `/api/mock-tests/${mockTestId}/question-scores`,
      transformResponse: (
        response: ApiResponse<
          | MockTestScores
          | { scores: MockTestScores }
          | CompleteMockTestResponse
          | RawQuestionScore[]
          | { questionScores: RawQuestionScore[] }
        >
      ) => {
        const normalized = normalizeQuestionScoresPayload(response.data);
        // As a last resort, return an empty structure (prevents runtime crashes)
        return (
          normalized ?? {
            overallScore: 0,
            part1: { averageScore: 0, questionScores: [] },
            part2: { averageScore: 0, questionScores: [] },
            part3: { averageScore: 0, questionScores: [] },
          }
        );
      },
      providesTags: (result, error, mockTestId) => [
        { type: "MockTest", id: `scores-${mockTestId}` },
      ],
    }),
    deleteMockTest: builder.mutation<{ message: string }, string>({
      query: (mockTestId) => ({
        url: `/api/mock-tests/${mockTestId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: ["MockTest"],
    }),
  }),
});

export const {
  useStartMockTestMutation,
  useGetMockTestByIdQuery,
  useSubmitQuestionMutation,
  useSubmitPartMutation,
  useCompleteMockTestMutation,
  useGetMyMockTestHistoryQuery,
  useGetQuestionScoresQuery,
  useDeleteMockTestMutation,
} = mockTestApi;




















