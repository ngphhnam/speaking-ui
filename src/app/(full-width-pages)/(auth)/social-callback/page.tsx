"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSocialLoginMutation } from "@/store/api/authApi";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/utils/errorHandler";

export default function SocialCallbackPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const [socialLogin, { isLoading, error }] = useSocialLoginMutation();

  useEffect(() => {
    if (status !== "authenticated") return;
    const user = session?.user;
    const email = user?.email;
    if (!email) return;

    const callback = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get("redirect");
      const redirectTo = redirect ? decodeURIComponent(redirect) : "/dashboard";

      try {
        await socialLogin({
          email,
          name: user?.name ?? email,
          avatar: user?.image ?? null,
          provider: (user as any)?.provider ?? "unknown",
        }).unwrap();

        router.replace(redirectTo);
      } catch {
        // error is handled via `error` state; keep user on this page
      }
    };

    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const errorMessage =
    error ? getErrorMessage(error, t, t("auth.signInError", "Unable to sign in. Please try again.")) : null;

  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
        <h1 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          {t("auth.socialSigningIn", "Signing you in...")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading || status === "loading"
            ? t("auth.pleaseWait", "Please wait a moment.")
            : t("auth.continue", "Continue")}
        </p>
        {errorMessage && (
          <p className="mt-4 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}

