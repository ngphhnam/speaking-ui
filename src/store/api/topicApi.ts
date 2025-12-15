import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  TopicDto,
  CreateTopicRequest,
  UpdateTopicRequest,
} from "@/store/types/topics";
import type { ApiResponse } from "@/store/types";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export const topicApi = createApi({
  reducerPath: "topicApi",
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
  tagTypes: ["Topic"],
  endpoints: (builder) => ({
    getTopics: builder.query<
      TopicDto[],
      { partNumber?: number; category?: string; includeInactive?: boolean }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.partNumber) searchParams.append("partNumber", params.partNumber.toString());
        if (params.category) searchParams.append("category", params.category);
        if (params.includeInactive)
          searchParams.append("includeInactive", "true");
        return `/api/topics?${searchParams.toString()}`;
      },
      // Backend returns a paginated response: { data: { items: TopicDto[], ... }, ... }
      transformResponse: (
        response: ApiResponse<{
          items: TopicDto[];
          page: number;
          pageSize: number;
          totalCount: number;
        }>
      ) => response.data?.items ?? [],
      providesTags: ["Topic"],
    }),
    getTopicById: builder.query<TopicDto, string>({
      query: (id) => `/api/topics/${id}`,
      transformResponse: (response: ApiResponse<TopicDto>) => response.data,
      providesTags: (result, error, id) => [{ type: "Topic", id }],
    }),
    getTopicBySlug: builder.query<TopicDto, string>({
      query: (slug) => `/api/topics/slug/${slug}`,
      transformResponse: (response: ApiResponse<TopicDto>) => response.data,
      providesTags: (result) => [{ type: "Topic", id: result?.id }],
    }),
    getPopularTopics: builder.query<TopicDto[], number | void>({
      query: (limit = 10) => `/api/topics/popular?limit=${limit}`,
      transformResponse: (response: ApiResponse<TopicDto[]>) => response.data ?? [],
      providesTags: ["Topic"],
    }),
    getRecommendedTopics: builder.query<TopicDto[], void>({
      query: () => "/api/topics/recommended",
      transformResponse: (response: ApiResponse<TopicDto[]>) => response.data ?? [],
      providesTags: ["Topic"],
    }),
    rateTopic: builder.mutation<{ message: string }, { topicId: string; rating: number }>({
      query: ({ topicId, rating }) => ({
        url: `/api/topics/${topicId}/rate`,
        method: "POST",
        body: { rating },
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) => response.data,
      invalidatesTags: (result, error, { topicId }) => [{ type: "Topic", id: topicId }],
    }),
    getTopicStatistics: builder.query<any, string>({
      query: (topicId) => `/api/topics/${topicId}/statistics`,
      transformResponse: (response: ApiResponse<any>) => response.data,
      providesTags: (result, error, topicId) => [{ type: "Topic", id: topicId }],
    }),
    createTopic: builder.mutation<TopicDto, CreateTopicRequest>({
      query: (body) => ({
        url: "/api/topics",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<TopicDto>) => response.data,
      invalidatesTags: ["Topic"],
    }),
    updateTopic: builder.mutation<TopicDto, { id: string; data: UpdateTopicRequest }>({
      query: ({ id, data }) => ({
        url: `/api/topics/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<TopicDto>) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: "Topic", id }],
    }),
    deleteTopic: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/topics/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Topic"],
    }),
  }),
});

export const {
  useGetTopicsQuery,
  useGetTopicByIdQuery,
  useGetTopicBySlugQuery,
  useGetPopularTopicsQuery,
  useGetRecommendedTopicsQuery,
  useRateTopicMutation,
  useGetTopicStatisticsQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} = topicApi;

