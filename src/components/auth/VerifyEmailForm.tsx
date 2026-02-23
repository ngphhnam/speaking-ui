"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyEmailMutation } from "@/store/api/authApi";
import { useTranslation } from "react-i18next";
import { LanguageToggleButton } from "@/components/common/LanguageToggleButton";
import { getErrorMessage } from "@/utils/errorHandler";
import { decodeJWT } from "@/utils/jwt";

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const { t } = useTranslation();

  // Extract token and email from URL query params
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      // Decode JWT to extract email
      const decoded = decodeJWT(tokenParam);
      if (decoded && typeof decoded.email === "string") {
        setEmail(decoded.email);
        setIsValidating(false);
      } else {
        setFormError(
          t(
            "auth.invalidToken",
            "Invalid verification link. Please check your email for a new link."
          )
        );
        setIsValidating(false);
      }
    } else {
      setFormError(
        t(
          "auth.missingToken",
          "Verification link is missing. Please check your email."
        )
      );
      setIsValidating(false);
    }
  }, [searchParams, t]);

  // Countdown timer for redirect
  useEffect(() => {
    if (isVerifiedSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVerifiedSuccess, countdown]);

  const isSubmitDisabled = useMemo(() => {
    return (
      !verificationCode.trim() ||
      verificationCode.length !== 6 ||
      !email ||
      !token ||
      isLoading ||
      isValidating
    );
  }, [verificationCode, email, token, isLoading, isValidating]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !token) {
      setFormError(
        t(
          "auth.missingInfo",
          "Missing verification information. Please check your email for a new link."
        )
      );
      return;
    }

    if (verificationCode.length !== 6) {
      setFormError(
        t(
          "auth.invalidCode",
          "Please enter a valid 6-digit verification code."
        )
      );
      return;
    }

    setFormError(null);
    try {
      await verifyEmail({
        email,
        code: verificationCode.trim(),
        token,
      }).unwrap();
      // Show success message
      setCountdown(5);
      setIsVerifiedSuccess(true);
      // Auto redirect after 5 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 5000);
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          t,
          t("auth.verificationError", "Failed to verify email. Please try again.")
        )
      );
    }
  };

  if (isValidating) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("auth.validatingLink", "Validating verification link...")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isVerifiedSuccess) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
          <div className="flex items-center justify-between">
            <div className="w-24"></div>
            <LanguageToggleButton />
          </div>
        </div>
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <div className="mb-5 sm:mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/20">
                <svg
                  className="h-8 w-8 text-success-600 dark:text-success-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                {t("auth.verificationSuccessTitle")}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {t("auth.verificationSuccessMessage")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("auth.redirectingMessage", { seconds: countdown })
                  .split(/\{\{seconds\}\}/)
                  .map((part, index, array) => (
                    <React.Fragment key={index}>
                      {part}
                      {index < array.length - 1 && (
                        <span className="font-semibold text-brand-600 dark:text-brand-400 mx-1">
                          {countdown}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-success-200 bg-success-50 p-4 dark:bg-success-900/10 dark:border-success-800">
                <p className="text-sm text-success-800 dark:text-success-300">
                  {t("auth.verificationSuccessDescription")}
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                {t("auth.goToDashboard")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <div className="flex items-center justify-between">
          <Link
            href="/signin"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            {t("auth.backToSignIn", "Back to sign in")}
          </Link>
          <LanguageToggleButton />
        </div>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("auth.verifyEmailTitle", "Verify Your Email")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {email
                ? t("auth.verifyEmailSubtitle", {
                    email: email,
                  })
                : t("auth.verifyEmailSubtitleGeneric")}
            </p>
          </div>

          {formError && (
            <div className="mb-4 p-3 text-sm text-error-600 bg-error-50 rounded-lg border border-error-200 dark:bg-error-900/20 dark:text-error-400 dark:border-error-800">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <Label htmlFor="verificationCode">
                {t("auth.verificationCode", "Verification Code")}
              </Label>
              <Input
                type="text"
                id="verificationCode"
                name="verificationCode"
                placeholder={t(
                  "auth.codePlaceholder",
                  "Enter 6-digit code"
                )}
                value={verificationCode}
                onChange={(e) => {
                  // Only allow digits and limit to 6 characters
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setVerificationCode(value);
                  setFormError(null);
                }}
                disabled={isLoading || !email || !token}
                error={!!formError}
                className="text-center text-2xl tracking-widest font-semibold"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full"
              isLoading={isLoading}
            >
              {t("auth.verifyEmail", "Verify Email")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("auth.didntReceiveCode", "Didn't receive the code?")}{" "}
              <Link
                href="/signup"
                className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                {t("auth.signUpAgain", "Sign up again")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
