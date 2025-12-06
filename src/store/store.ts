import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import { authApi } from "@/store/api/authApi";
import { topicApi } from "@/store/api/topicApi";
import { questionApi } from "@/store/api/questionApi";
import { answerApi } from "@/store/api/answerApi";
import { userApi } from "@/store/api/userApi";
import { generateApi } from "@/store/api/generateApi";

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
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        topicApi.middleware,
        questionApi.middleware,
        answerApi.middleware,
        userApi.middleware,
        generateApi.middleware
      ),
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

