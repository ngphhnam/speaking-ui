import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";
import type { ApiResponse } from "@/store/types";
import type { UserDto } from "@/store/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export type UsersListResponse = {
  items: UserDto[];
  page: number;
  pageSize: number;
  totalCount: number;
};

export type GetUsersParams = {
  page?: number;
  pageSize?: number;
};

export const userApi = createApi({
  reducerPath: "userApi",
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
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query<UsersListResponse, GetUsersParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString());
        return `/api/admin/users?${searchParams.toString()}`;
      },
      transformResponse: (response: ApiResponse<UsersListResponse>) => response.data,
      providesTags: ["User"],
    }),
  }),
});

export const { useGetUsersQuery } = userApi;









