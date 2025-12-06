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
        if (params.includeInactive) searchParams.append("includeInactive", "true");
        return `/api/topics?${searchParams.toString()}`;
      },
      transformResponse: (response: ApiResponse<TopicDto[]>) => response.data ?? [],
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
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} = topicApi;

