import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

export const getApiErrorMessage = (error: unknown): string => {
  if (!error) {
    return "An unknown error occurred. Please try again.";
  }

  const fetchError = error as FetchBaseQueryError & {
    data?: unknown;
    status?: number | string;
  };

  if (typeof fetchError?.status !== "undefined") {
    const data = fetchError.data;

    if (typeof data === "string") {
      return data;
    }

    if (typeof data === "object" && data !== null) {
      if ("detail" in data && typeof data.detail === "string") {
        return data.detail;
      }
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }
      if (Array.isArray(data)) {
        return data.join(", ");
      }
    }

    return `Request failed with status ${fetchError.status}`;
  }

  const serialized = error as SerializedError;
  if (serialized?.message) {
    return serialized.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unexpected error. Please try again.";
};




