"use client";

import { useTranslation } from "react-i18next";

type ScoringLoadingModalProps = {
  isOpen: boolean;
};

export default function ScoringLoadingModal({ isOpen }: ScoringLoadingModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Loading spinner */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin dark:border-brand-800 dark:border-t-brand-400"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-brand-600 dark:text-brand-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-semibold text-gray-900 dark:text-white">
          {t("topics.scoringInProgress", "Scoring in progress")}
        </h2>
        <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {t(
            "topics.scoringMessage",
            "Please wait while we analyze your answer. This may take a few moments..."
          )}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-brand-600 animate-bounce dark:bg-brand-400" style={{ animationDelay: "0ms" }}></div>
          <div className="h-2 w-2 rounded-full bg-brand-600 animate-bounce dark:bg-brand-400" style={{ animationDelay: "150ms" }}></div>
          <div className="h-2 w-2 rounded-full bg-brand-600 animate-bounce dark:bg-brand-400" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
}

