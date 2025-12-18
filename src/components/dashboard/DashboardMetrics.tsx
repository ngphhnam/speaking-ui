"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { UserStatistics } from "@/store/api/statisticsApi";

type DashboardMetricsProps = {
  statistics: UserStatistics;
};

export default function DashboardMetrics({
  statistics,
}: DashboardMetricsProps) {
  const { t } = useTranslation();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
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

  const metrics = [
    {
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      label: t("dashboard.totalQuestions", "Tổng câu hỏi"),
      value: statistics.totalQuestions.toString(),
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-100 dark:bg-brand-900/30",
    },
    {
      icon: (
        <svg
          className="h-6 w-6"
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
      ),
      label: t("dashboard.totalRecordings", "Tổng bài làm"),
      value: statistics.totalRecordings.toString(),
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      label: t("dashboard.averageScore", "Điểm trung bình"),
      value: statistics.averageScore
        ? statistics.averageScore.toFixed(1)
        : "N/A",
      color: getScoreColor(statistics.averageScore),
      bg: getScoreBg(statistics.averageScore),
    },
    {
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      label: t("dashboard.practiceTime", "Thời gian luyện"),
      value: formatTime(statistics.totalPracticeTime),
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${metric.bg}`}>
            <div className={metric.color}>{metric.icon}</div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metric.label}
            </p>
            <p className={`mt-2 text-3xl font-bold ${metric.color}`}>
              {metric.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}







