import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface UserSettingsDto {
  id: string;
  userId: string;
  targetBandScore: number | null;
  currentLevel: string | null;
  examDate: string | null;
  preferredTopics: string[];
  studyGoalMinutesPerDay: number | null;
  notificationPreferences: NotificationPreferences;
  practicePreferences: PracticePreferences;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  practiceReminders: boolean;
  achievementNotifications: boolean;
  weeklySummary: boolean;
  streakReminders: boolean;
}

export interface PracticePreferences {
  recordingQuality: string;
  autoSubmit: boolean;
  feedbackDetailLevel: string;
  preferredAIModel: string;
  showHints: boolean;
  enableTimer: boolean;
}

export interface UpdateSettingsRequest {
  targetBandScore?: number;
  currentLevel?: string;
  examDate?: string;
  preferredTopics?: string[];
  studyGoalMinutesPerDay?: number;
}

export interface UpdateNotificationPreferencesRequest {
  emailNotifications?: boolean;
  practiceReminders?: boolean;
  achievementNotifications?: boolean;
  weeklySummary?: boolean;
  streakReminders?: boolean;
}

export interface UpdatePracticePreferencesRequest {
  recordingQuality?: string;
  autoSubmit?: boolean;
  feedbackDetailLevel?: string;
  preferredAIModel?: string;
  showHints?: boolean;
  enableTimer?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode: string | null;
  timestamp: string;
  metadata: any | null;
}

export const userSettingsApi = createApi({
  reducerPath: "userSettingsApi",
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
  tagTypes: ["UserSettings"],
  endpoints: (builder) => ({
    getSettings: builder.query<UserSettingsDto, void>({
      query: () => "/api/user-settings",
      transformResponse: (response: ApiResponse<UserSettingsDto>) =>
        response.data,
      providesTags: ["UserSettings"],
    }),
    updateSettings: builder.mutation<UserSettingsDto, UpdateSettingsRequest>({
      query: (body) => ({
        url: "/api/user-settings",
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<UserSettingsDto>) =>
        response.data,
      invalidatesTags: ["UserSettings"],
    }),
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => "/api/user-settings/notification-preferences",
      transformResponse: (response: ApiResponse<NotificationPreferences>) =>
        response.data,
      providesTags: ["UserSettings"],
    }),
    updateNotificationPreferences: builder.mutation<
      NotificationPreferences,
      UpdateNotificationPreferencesRequest
    >({
      query: (body) => ({
        url: "/api/user-settings/notification-preferences",
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<NotificationPreferences>) =>
        response.data,
      invalidatesTags: ["UserSettings"],
    }),
    getPracticePreferences: builder.query<PracticePreferences, void>({
      query: () => "/api/user-settings/practice-preferences",
      transformResponse: (response: ApiResponse<PracticePreferences>) =>
        response.data,
      providesTags: ["UserSettings"],
    }),
    updatePracticePreferences: builder.mutation<
      PracticePreferences,
      UpdatePracticePreferencesRequest
    >({
      query: (body) => ({
        url: "/api/user-settings/practice-preferences",
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<PracticePreferences>) =>
        response.data,
      invalidatesTags: ["UserSettings"],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useGetPracticePreferencesQuery,
  useUpdatePracticePreferencesMutation,
} = userSettingsApi;












