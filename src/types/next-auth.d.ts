import type { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      provider?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string | null;
  }
}

