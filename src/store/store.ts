import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import { authApi } from "@/store/api/authApi";
import { topicApi } from "@/store/api/topicApi";
import { questionApi } from "@/store/api/questionApi";
import { answerApi } from "@/store/api/answerApi";
import { userApi } from "@/store/api/userApi";
import { generateApi } from "@/store/api/generateApi";
import { recordingApi } from "@/store/api/recordingApi";
import { statisticsApi } from "@/store/api/statisticsApi";
import { analysisResultsApi } from "@/store/api/analysisResultsApi";
import { mockTestApi } from "@/store/api/mockTestApi";
import { userProgressApi } from "@/store/api/userProgressApi";
import { leaderboardApi } from "@/store/api/leaderboardApi";
import { userSettingsApi } from "@/store/api/userSettingsApi";
import { vocabularyApi } from "@/store/api/vocabularyApi";
import { userVocabularyApi } from "@/store/api/userVocabularyApi";
import { achievementApi } from "@/store/api/achievementApi";
import { speakingSessionApi } from "@/store/api/speakingSessionApi";
import { userDraftsApi } from "@/store/api/userDraftsApi";
import { adminApi } from "@/store/api/adminApi";
import { healthApi } from "@/store/api/healthApi";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
      [topicApi.reducerPath]: topicApi.reducer,
      [questionApi.reducerPath]: questionApi.reducer,
      [answerApi.reducerPath]: answerApi.reducer,
      [userApi.reducerPath]: userApi.reducer,
      [generateApi.reducerPath]: generateApi.reducer,
      [recordingApi.reducerPath]: recordingApi.reducer,
      [statisticsApi.reducerPath]: statisticsApi.reducer,
      [analysisResultsApi.reducerPath]: analysisResultsApi.reducer,
      [mockTestApi.reducerPath]: mockTestApi.reducer,
      [userProgressApi.reducerPath]: userProgressApi.reducer,
      [leaderboardApi.reducerPath]: leaderboardApi.reducer,
      [userSettingsApi.reducerPath]: userSettingsApi.reducer,
      [vocabularyApi.reducerPath]: vocabularyApi.reducer,
      [userVocabularyApi.reducerPath]: userVocabularyApi.reducer,
      [achievementApi.reducerPath]: achievementApi.reducer,
      [speakingSessionApi.reducerPath]: speakingSessionApi.reducer,
      [userDraftsApi.reducerPath]: userDraftsApi.reducer,
      [adminApi.reducerPath]: adminApi.reducer,
      [healthApi.reducerPath]: healthApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        topicApi.middleware,
        questionApi.middleware,
        answerApi.middleware,
        userApi.middleware,
        generateApi.middleware,
        recordingApi.middleware,
        statisticsApi.middleware,
        analysisResultsApi.middleware,
        mockTestApi.middleware,
        userProgressApi.middleware,
        leaderboardApi.middleware,
        userSettingsApi.middleware,
        vocabularyApi.middleware,
        userVocabularyApi.middleware,
        achievementApi.middleware,
        speakingSessionApi.middleware,
        userDraftsApi.middleware,
        adminApi.middleware,
        healthApi.middleware
      ),
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

