"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import type { UserStatistics } from "@/store/api/statisticsApi";

type RecentActivityProps = {
  statistics: UserStatistics;
};

export default function RecentActivity({ statistics }: RecentActivityProps) {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} ${t("dashboard.daysAgo", "ngày trước")}`;
    if (hours > 0) return `${hours} ${t("dashboard.hoursAgo", "giờ trước")}`;
    if (minutes > 0)
      return `${minutes} ${t("dashboard.minutesAgo", "phút trước")}`;
    return t("dashboard.justNow", "Vừa xong");
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-600 dark:text-gray-400";
    if (score >= 7) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 5) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBg = (score: number | null) => {
    if (!score) return "bg-gray-100 dark:bg-gray-800";
    if (score >= 7) return "bg-emerald-100 dark:bg-emerald-900/30";
    if (score >= 5) return "bg-amber-100 dark:bg-amber-900/30";
    return "bg-rose-100 dark:bg-rose-900/30";
  };

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("dashboard.recentActivity", "Hoạt động gần đây")}
        </h3>
        <Link
          href="/learning-history"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          {t("dashboard.viewAll", "Xem tất cả")}
        </Link>
      </div>

      {statistics.recentRecordings.length === 0 ? (
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
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("dashboard.noActivity", "Chưa có hoạt động nào")}
          </p>
          <Link
            href="/practice-by-questions"
            className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            {t("dashboard.startPracticing", "Bắt đầu luyện tập →")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {statistics.recentRecordings.map((recording) => (
            <div
              key={recording.id}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                <svg
                  className="h-5 w-5 text-brand-600 dark:text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                  {recording.questionText}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(recording.recordedAt)}
                </p>
              </div>
              {recording.overallScore !== null && (
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${getScoreBg(
                    recording.overallScore
                  )}`}
                >
                  <span
                    className={`text-sm font-bold ${getScoreColor(
                      recording.overallScore
                    )}`}
                  >
                    {recording.overallScore.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




