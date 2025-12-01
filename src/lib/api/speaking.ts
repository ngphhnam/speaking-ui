type RequestOptions = RequestInit & { skipAuth?: boolean };

const LLAMA_BASE_URL =
  process.env.NEXT_PUBLIC_LLAMA_API_BASE_URL ?? "http://localhost:11435";
const LANGUAGE_TOOL_BASE_URL =
  process.env.NEXT_PUBLIC_LANGUAGE_TOOL_API_BASE_URL ?? "http://localhost:8010";

export type SpeakingLevel = "beginner" | "intermediate" | "advanced";

export type ScoreSpeechPayload = {
  transcription: string;
  topic?: string;
  level?: SpeakingLevel;
};

export type ScoreSpeechResponse = {
  bandScore: number;
  pronunciationScore: number;
  grammarScore: number;
  vocabularyScore: number;
  fluencyScore: number;
  overallFeedback: string;
};

export type GrammarRequestPayload = {
  text: string;
  language?: string;
};

export type GrammarResponse = {
  language: {
    name: string;
    code: string;
  };
  matches: GrammarMatch[];
};

export type GrammarMatch = {
  message: string;
  shortMessage?: string;
  replacements: { value: string }[];
  offset: number;
  length: number;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  rule: {
    id: string;
    description: string;
  };
};

export type HealthResponse = {
  status: string;
  service: string;
  version?: string;
  available?: boolean;
  ollama_available?: boolean;
};

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const withJsonHeaders = (options: RequestInit = {}): RequestInit => ({
  headers: {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  },
  ...options,
});

const request = async <T>(url: string, options?: RequestOptions): Promise<T> => {
  const response = await fetch(url, options);

  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      payload = await response.text();
    }
    throw new ApiError(
      `Request to ${url} failed with status ${response.status}`,
      response.status,
      payload
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const scoreSpeech = (payload: ScoreSpeechPayload) =>
  request<ScoreSpeechResponse>(`${LLAMA_BASE_URL}/api/score`, {
    method: "POST",
    ...withJsonHeaders({ body: JSON.stringify(payload) }),
  });

export const getLlamaHealth = () =>
  request<HealthResponse>(`${LLAMA_BASE_URL}/health`, {
    cache: "no-store",
  });

export const checkGrammar = (payload: GrammarRequestPayload) =>
  request<GrammarResponse>(`${LANGUAGE_TOOL_BASE_URL}/v2/check/json`, {
    method: "POST",
    ...withJsonHeaders({ body: JSON.stringify(payload) }),
  });

export const getLanguageToolHealth = () =>
  request<HealthResponse>(`${LANGUAGE_TOOL_BASE_URL}/health`, {
    cache: "no-store",
  });

