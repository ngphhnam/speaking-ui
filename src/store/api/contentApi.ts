import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  TopicDto,
  CreateTopicRequest,
  UpdateTopicRequest,
  QuestionDto,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  OutlineDto,
} from "@/store/types/topics";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export const contentApi = createApi({
  reducerPath: "contentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Topic", "Question"],
  endpoints: (builder) => ({
    // Topics
    getTopics: builder.query<TopicDto[], { partNumber?: number; category?: string; includeInactive?: boolean }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.partNumber) searchParams.append("partNumber", params.partNumber.toString());
        if (params.category) searchParams.append("category", params.category);
        if (params.includeInactive) searchParams.append("includeInactive", "true");
        return `/api/topics?${searchParams.toString()}`;
      },
      providesTags: ["Topic"],
    }),
    getTopicById: builder.query<TopicDto, string>({
      query: (id) => `/api/topics/${id}`,
      providesTags: (result, error, id) => [{ type: "Topic", id }],
    }),
    getTopicBySlug: builder.query<TopicDto, string>({
      query: (slug) => `/api/topics/slug/${slug}`,
      providesTags: (result) => [{ type: "Topic", id: result?.id }],
    }),
    getPopularTopics: builder.query<TopicDto[], number | void>({
      query: (limit = 10) => `/api/topics/popular?limit=${limit}`,
      providesTags: ["Topic"],
    }),
    createTopic: builder.mutation<TopicDto, CreateTopicRequest>({
      query: (body) => ({
        url: "/api/topics",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Topic"],
    }),
    updateTopic: builder.mutation<TopicDto, { id: string; data: UpdateTopicRequest }>({
      query: ({ id, data }) => ({
        url: `/api/topics/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Topic", id }],
    }),
    deleteTopic: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/topics/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Topic"],
    }),

    // Questions
    getQuestions: builder.query<QuestionDto[], { topicId?: string; includeInactive?: boolean }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.topicId) searchParams.append("topicId", params.topicId);
        if (params.includeInactive) searchParams.append("includeInactive", "true");
        return `/api/questions?${searchParams.toString()}`;
      },
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
      invalidatesTags: (result) => [
        "Question",
        { type: "Topic", id: result?.topicId },
      ],
    }),
    updateQuestion: builder.mutation<QuestionDto, { id: string; data: UpdateQuestionRequest }>({
      query: ({ id, data }) => ({
        url: `/api/questions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Question", id },
        { type: "Topic", id: result?.topicId },
      ],
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
  useGetTopicsQuery,
  useGetTopicByIdQuery,
  useGetTopicBySlugQuery,
  useGetPopularTopicsQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
  useGetQuestionsQuery,
  useGetQuestionByIdQuery,
  useGenerateOutlineForQuestionMutation,
  useGetRandomQuestionByTopicQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = contentApi;

