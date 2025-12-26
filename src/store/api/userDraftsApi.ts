import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface UserDraftDto {
  id: string;
  userId: string;
  questionId: string;
  draftContent: string;
  outlineStructure: string | null;
  lastEditedAt: string;
  createdAt: string;
  question?: any;
}

export interface SaveDraftRequest {
  questionId: string;
  draftContent: string;
  outlineStructure?: string;
}

export interface UpdateDraftRequest {
  draftContent?: string;
  outlineStructure?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export const userDraftsApi = createApi({
  reducerPath: "userDraftsApi",
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
  tagTypes: ["UserDraft"],
  endpoints: (builder) => ({
    getUserDrafts: builder.query<UserDraftDto[], string>({
      query: (userId) => `/api/userdrafts/user/${userId}`,
      transformResponse: (response: ApiResponse<UserDraftDto[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: "UserDraft", id: userId },
      ],
    }),
    getDraftByQuestion: builder.query<
      UserDraftDto,
      { userId: string; questionId: string }
    >({
      query: ({ userId, questionId }) =>
        `/api/userdrafts/user/${userId}/question/${questionId}`,
      transformResponse: (response: ApiResponse<UserDraftDto>) =>
        response.data,
      providesTags: (result, error, { userId, questionId }) => [
        { type: "UserDraft", id: `${userId}-${questionId}` },
      ],
    }),
    saveDraft: builder.mutation<UserDraftDto, SaveDraftRequest>({
      query: (body) => ({
        url: "/api/userdrafts",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<UserDraftDto>) =>
        response.data,
      invalidatesTags: ["UserDraft"],
    }),
    updateDraft: builder.mutation<
      UserDraftDto,
      { draftId: string; data: UpdateDraftRequest }
    >({
      query: ({ draftId, data }) => ({
        url: `/api/userdrafts/${draftId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<UserDraftDto>) =>
        response.data,
      invalidatesTags: (result, error, { draftId }) => [
        { type: "UserDraft", id: draftId },
        "UserDraft",
      ],
    }),
    deleteDraft: builder.mutation<{ message: string }, string>({
      query: (draftId) => ({
        url: `/api/userdrafts/${draftId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: ["UserDraft"],
    }),
  }),
});

export const {
  useGetUserDraftsQuery,
  useGetDraftByQuestionQuery,
  useSaveDraftMutation,
  useUpdateDraftMutation,
  useDeleteDraftMutation,
} = userDraftsApi;












