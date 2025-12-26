import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";
import type { ApiResponse } from "@/store/types";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export type PremiumCheckoutResponse = {
  checkoutUrl: string;
  orderCode: string;
  paymentId: string;
  paymentLinkId: string;
  qrCode: string;
  qrImageUrl: string;
  expiredAt?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  description?: string;
};

type PremiumCheckoutPayload = {
  planCode: string;
  clientReference: string;
  amount?: number;
};

export const paymentApi = createApi({
  reducerPath: "paymentApi",
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
  endpoints: (builder) => ({
    createPremiumCheckout: builder.mutation<
      PremiumCheckoutResponse,
      PremiumCheckoutPayload
    >({
      query: ({ planCode, clientReference, amount }) => ({
        url: "/api/payment/premium/checkout",
        method: "POST",
        body: {
          planCode,
          clientReference,
          ...(amount ? { amount } : {}),
        },
      }),
      transformResponse: (
        response: ApiResponse<PremiumCheckoutResponse>
      ) => response.data,
    }),
  }),
});

export const { useCreatePremiumCheckoutMutation } = paymentApi;


