import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface MockTestDto {
  id: string;
  userId: string;
  testName: string;
  testStatus: "InProgress" | "Completed" | "Cancelled";
  part1QuestionCount: number;
  part2QuestionCount: number;
  part3QuestionCount: number;
  currentPart: number;
  startedAt: string;
  completedAt: string | null;
  part1CompletedAt: string | null;
  part2CompletedAt: string | null;
  part3CompletedAt: string | null;
  overallScore: number | null;
  part1Score: number | null;
  part2Score: number | null;
  part3Score: number | null;
  totalDurationSeconds: number;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
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
    completeMockTest: builder.mutation<MockTestDto, string>({
      query: (mockTestId) => ({
        url: `/api/mock-tests/${mockTestId}/complete`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<MockTestDto>) => response.data,
      invalidatesTags: (result, error, mockTestId) => [
        { type: "MockTest", id: mockTestId },
        "MockTest",
      ],
    }),
    getUserMockTestHistory: builder.query<MockTestDto[], string>({
      query: (userId) => `/api/mock-tests/user/${userId}/history`,
      transformResponse: (response: ApiResponse<MockTestDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "MockTest", id: `history-${userId}` },
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
  useSubmitPartMutation,
  useCompleteMockTestMutation,
  useGetUserMockTestHistoryQuery,
  useDeleteMockTestMutation,
} = mockTestApi;



