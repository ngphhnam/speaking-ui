"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import type { UserStatistics } from "@/store/api/statisticsApi";

type WeakTopicsProps = {
  statistics: UserStatistics;
};

export default function WeakTopics({ statistics }: WeakTopicsProps) {
  const { t } = useTranslation();

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 5) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 7) return "bg-emerald-100 dark:bg-emerald-900/30";
    if (score >= 5) return "bg-amber-100 dark:bg-amber-900/30";
    return "bg-rose-100 dark:bg-rose-900/30";
  };

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("dashboard.weakTopics", "Chủ đề cần cải thiện")}
        </h3>
        <svg
          className="h-5 w-5 text-amber-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {statistics.weakTopics.length === 0 ? (
        <div className="py-8 text-center">
          <svg
            className="mx-auto mb-3 h-12 w-12 text-gray-400 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t(
              "dashboard.noWeakTopics",
              "Không có chủ đề yếu. Bạn đang làm rất tốt!"
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {statistics.weakTopics.map((topic) => (
            <Link
              key={topic.topicId}
              href={`/topics/${topic.topicId}`}
              className="group block rounded-lg border border-gray-200 bg-gray-50 p-4 transition hover:border-brand-500 hover:bg-white dark:border-gray-800 dark:bg-gray-800/50 dark:hover:border-brand-500"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {topic.topicTitle}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {topic.totalAttempts}{" "}
                    {t("dashboard.attempts", "lần thử")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${getScoreBg(
                      topic.averageScore
                    )}`}
                  >
                    <span className={`text-sm font-bold ${getScoreColor(topic.averageScore)}`}>
                      {topic.averageScore.toFixed(1)}
                    </span>
                  </div>
                  <svg
                    className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-600 dark:group-hover:text-brand-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}













