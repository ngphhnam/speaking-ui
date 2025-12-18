import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface VocabularyDto {
  id: string;
  word: string;
  phonetic: string | null;
  partOfSpeech: string;
  definitionEn: string;
  definitionVi: string | null;
  ieltsBandLevel: number;
  topicCategories: string[];
  exampleSentences: string[];
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  usageNotes: string | null;
  difficultyLevel: string;
  frequency: number;
  audioUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVocabularyRequest {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definitionEn: string;
  definitionVi?: string;
  ieltsBandLevel?: number;
  topicCategories?: string[];
  exampleSentences?: string[];
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
  usageNotes?: string;
  difficultyLevel?: string;
}

export interface UpdateVocabularyRequest {
  word?: string;
  phonetic?: string;
  partOfSpeech?: string;
  definitionEn?: string;
  definitionVi?: string;
  ieltsBandLevel?: number;
  topicCategories?: string[];
  exampleSentences?: string[];
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
  usageNotes?: string;
  difficultyLevel?: string;
  isActive?: boolean;
}

export interface VocabularyQueryParams {
  minBand?: number;
  maxBand?: number;
  topicCategory?: string;
  search?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export const vocabularyApi = createApi({
  reducerPath: "vocabularyApi",
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
  tagTypes: ["Vocabulary"],
  endpoints: (builder) => ({
    getAllVocabulary: builder.query<VocabularyDto[], VocabularyQueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.minBand) searchParams.append("minBand", params.minBand.toString());
        if (params.maxBand) searchParams.append("maxBand", params.maxBand.toString());
        if (params.topicCategory) searchParams.append("topicCategory", params.topicCategory);
        if (params.search) searchParams.append("search", params.search);
        return `/api/vocabulary?${searchParams.toString()}`;
      },
      transformResponse: (response: ApiResponse<VocabularyDto[]>) =>
        response.data ?? [],
      providesTags: ["Vocabulary"],
    }),
    getVocabularyById: builder.query<VocabularyDto, string>({
      query: (vocabularyId) => `/api/vocabulary/${vocabularyId}`,
      transformResponse: (response: ApiResponse<VocabularyDto>) =>
        response.data,
      providesTags: (result, error, vocabularyId) => [
        { type: "Vocabulary", id: vocabularyId },
      ],
    }),
    searchVocabulary: builder.query<VocabularyDto[], string>({
      query: (searchTerm) => {
        const params = new URLSearchParams();
        params.append("q", searchTerm);
        return `/api/vocabulary/search?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<VocabularyDto[]>) =>
        response.data ?? [],
      providesTags: ["Vocabulary"],
    }),
    createVocabulary: builder.mutation<VocabularyDto, CreateVocabularyRequest>({
      query: (body) => ({
        url: "/api/vocabulary",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<VocabularyDto>) =>
        response.data,
      invalidatesTags: ["Vocabulary"],
    }),
    updateVocabulary: builder.mutation<
      VocabularyDto,
      { vocabularyId: string; data: UpdateVocabularyRequest }
    >({
      query: ({ vocabularyId, data }) => ({
        url: `/api/vocabulary/${vocabularyId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<VocabularyDto>) =>
        response.data,
      invalidatesTags: (result, error, { vocabularyId }) => [
        { type: "Vocabulary", id: vocabularyId },
      ],
    }),
    deleteVocabulary: builder.mutation<{ message: string }, string>({
      query: (vocabularyId) => ({
        url: `/api/vocabulary/${vocabularyId}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: ["Vocabulary"],
    }),
  }),
});

export const {
  useGetAllVocabularyQuery,
  useGetVocabularyByIdQuery,
  useSearchVocabularyQuery,
  useCreateVocabularyMutation,
  useUpdateVocabularyMutation,
  useDeleteVocabularyMutation,
} = vocabularyApi;







