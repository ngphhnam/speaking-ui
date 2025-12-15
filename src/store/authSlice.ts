import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthResponse } from "@/store/types";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  user: AuthResponse["user"] | null;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.expiresAt = action.payload.expiresAt;
      state.user = action.payload.user;
    },
    updateUser: (state, action: PayloadAction<AuthResponse["user"]>) => {
      state.user = action.payload;
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.expiresAt = null;
      state.user = null;
    },
  },
});

export const { setCredentials, updateUser, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

