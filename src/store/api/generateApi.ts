import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const LLAMA_BASE_URL =
  process.env.NEXT_PUBLIC_LLAMA_API_BASE_URL ?? "http://localhost:11435";

export type StructureItem = {
  pattern: string;
  example: string;
  usage: string;
};

export type GenerateStructuresRequest = {
  question: string;
  partNumber: number;
  targetBand: number;
  count: number;
};

export type GenerateStructuresResponse = {
  structures: StructureItem[];
};

export type GenerateAnswerRequest = {
  question: string;
  partNumber: number;
  targetBand: number;
};

export type GenerateAnswerResponse = {
  answer: string;
};

export type VocabularyItem = {
  word: string;
  definition: string;
  example: string;
  pronunciation: string;
};

export type GenerateVocabularyRequest = {
  question: string;
  targetBand: number;
  count: number;
};

export type GenerateVocabularyResponse = {
  vocabulary: VocabularyItem[];
};

export type ImprovementItem = {
  type: "pronunciation" | "fluency" | "vocabulary" | "grammar";
  original: string;
  improved: string;
  reason: string;
};

export type ImproveAnswerRequest = {
  transcription: string;
  questionText: string;
  language?: string;
};

export type ImproveAnswerResponse = {
  original: string;
  improved: string;
  improvements: ImprovementItem[];
  explanation: string;
  vocabularySuggestions: VocabularyItem[];
  structureSuggestions: StructureItem[];
};

export const generateApi = createApi({
  reducerPath: "generateApi",
  baseQuery: fetchBaseQuery({
    baseUrl: LLAMA_BASE_URL,
    prepareHeaders: () => {
      const headers = new Headers();
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    generateStructures: builder.mutation<
      GenerateStructuresResponse,
      GenerateStructuresRequest
    >({
      query: (body) => ({
        url: "/api/v2/generate/structures",
        method: "POST",
        body,
      }),
    }),
    generateAnswer: builder.mutation<
      GenerateAnswerResponse,
      GenerateAnswerRequest
    >({
      query: (body) => ({
        url: "/api/v2/generate/answers",
        method: "POST",
        body,
      }),
    }),
    generateVocabulary: builder.mutation<
      GenerateVocabularyResponse,
      GenerateVocabularyRequest
    >({
      query: (body) => ({
        url: "/api/v2/generate/vocabulary",
        method: "POST",
        body,
      }),
    }),
    improveAnswer: builder.mutation<
      ImproveAnswerResponse,
      ImproveAnswerRequest
    >({
      query: (body) => ({
        url: "/api/v2/improve",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGenerateStructuresMutation,
  useGenerateAnswerMutation,
  useGenerateVocabularyMutation,
  useImproveAnswerMutation,
} = generateApi;

