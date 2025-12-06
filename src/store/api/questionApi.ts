import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  QuestionDto,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  OutlineDto,
} from "@/store/types/topics";
import type { ApiResponse } from "@/store/types";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export const questionApi = createApi({
  reducerPath: "questionApi",
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
  tagTypes: ["Question"],
  endpoints: (builder) => ({
    getQuestions: builder.query<QuestionDto[], { topicId?: string; includeInactive?: boolean }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.topicId) searchParams.append("topicId", params.topicId);
        if (params.includeInactive) searchParams.append("includeInactive", "true");
        return `/api/questions?${searchParams.toString()}`;
      },
      transformResponse: (response: ApiResponse<QuestionDto[]>) => response.data ?? [],
      providesTags: ["Question"],
    }),
    getQuestionById: builder.query<QuestionDto, string>({
      query: (id) => `/api/questions/${id}`,
      providesTags: (result, error, id) => [{ type: "Question", id }],
    }),
    generateOutlineForQuestion: builder.mutation<
      OutlineDto,
      { questionId: string; userLevel?: string; detailLevel?: "low" | "medium" | "high" }
    >({
      query: ({ questionId, userLevel, detailLevel }) => ({
        url: `/api/questions/${questionId}/outline/generate`,
        method: "POST",
        body: {
          userLevel,
          preferences: detailLevel
            ? {
                includeExamples: true,
                detailLevel,
              }
            : undefined,
        },
      }),
    }),
    getRandomQuestionByTopic: builder.query<QuestionDto, string>({
      query: (topicId) => `/api/questions/topic/${topicId}/random`,
      providesTags: ["Question"],
    }),
    createQuestion: builder.mutation<QuestionDto, CreateQuestionRequest>({
      query: (body) => ({
        url: "/api/questions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Question"],
      // Note: If you need to invalidate Topic cache, you'll need to use a shared tag or invalidate manually
    }),
    updateQuestion: builder.mutation<QuestionDto, { id: string; data: UpdateQuestionRequest }>({
      query: ({ id, data }) => ({
        url: `/api/questions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Question", id }],
    }),
    deleteQuestion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/questions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Question"],
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useGetQuestionByIdQuery,
  useGenerateOutlineForQuestionMutation,
  useGetRandomQuestionByTopicQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = questionApi;

