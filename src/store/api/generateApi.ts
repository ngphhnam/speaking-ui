import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

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

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: unknown | null;
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
  definition?: string;
  example?: string;
  pronunciation?: string;
  vietnameseMeaning?: string;
};

export type GenerateVocabularyRequest = {
  question: string;
  targetBand: number;
  count: number;
};

export type GenerateVocabularyResponse = {
  vocabulary: VocabularyItem[];
};

function normalizeVocabularyItems(input: unknown): VocabularyItem[] {
  const arr = Array.isArray(input) ? input : [];
  return arr
    .map((raw: any): VocabularyItem | null => {
      if (typeof raw === "string") {
        const w = raw.trim();
        return w ? { word: w } : null;
      }
      if (!raw || typeof raw !== "object") return null;

      // Accept common variants: { word }, { term }, { vocabulary }, etc.
      const word =
        (typeof raw.word === "string" && raw.word) ||
        (typeof raw.term === "string" && raw.term) ||
        (typeof raw.vocabulary === "string" && raw.vocabulary) ||
        "";
      const w = String(word).trim();
      if (!w) return null;

      const definition =
        typeof raw.definition === "string"
          ? raw.definition
          : typeof raw.meaning === "string"
          ? raw.meaning
          : typeof raw.explanation === "string"
          ? raw.explanation
          : undefined;

      const example =
        typeof raw.example === "string"
          ? raw.example
          : typeof raw.sample === "string"
          ? raw.sample
          : undefined;

      const pronunciation =
        typeof raw.pronunciation === "string"
          ? raw.pronunciation
          : typeof raw.pronounce === "string"
          ? raw.pronounce
          : undefined;

      const vietnameseMeaning =
        typeof raw.vietnamese_meaning === "string"
          ? raw.vietnamese_meaning
          : typeof raw.vietnameseMeaning === "string"
          ? raw.vietnameseMeaning
          : undefined;

      return { word: w, definition, example, pronunciation, vietnameseMeaning };
    })
    .filter((x): x is VocabularyItem => Boolean(x));
}

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
    baseUrl: API_BASE_URL,
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
        url: "/api/v1/generate/structures",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<GenerateStructuresResponse>) => {
        return response.data;
      },
    }),
    generateAnswer: builder.mutation<
      GenerateAnswerResponse,
      GenerateAnswerRequest
    >({
      query: (body) => ({
        url: "/api/v1/generate/answers",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<GenerateAnswerResponse>) => {
        return response.data;
      },
    }),
    generateVocabulary: builder.mutation<
      GenerateVocabularyResponse,
      GenerateVocabularyRequest
    >({
      query: (body) => ({
        url: "/api/v1/generate/vocabulary",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<any>) => {
        const data = response?.data as any;
        // Expected: { vocabulary: VocabularyItem[] }
        // Tolerate: { vocabulary: string[] } or even direct array payloads.
        const vocabRaw = Array.isArray(data) ? data : data?.vocabulary;
        return { vocabulary: normalizeVocabularyItems(vocabRaw) };
      },
    }),
    improveAnswer: builder.mutation<
      ImproveAnswerResponse,
      ImproveAnswerRequest
    >({
      query: (body) => ({
        url: "/api/v1/improve",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ImproveAnswerResponse>) => {
        return response.data;
      },
    }),
  }),
});

export const {
  useGenerateStructuresMutation,
  useGenerateAnswerMutation,
  useGenerateVocabularyMutation,
  useImproveAnswerMutation,
} = generateApi;

