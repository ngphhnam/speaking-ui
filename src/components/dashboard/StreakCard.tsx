"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import type { UserStatistics } from "@/store/api/statisticsApi";

type StreakCardProps = {
  statistics: UserStatistics;
};

export default function StreakCard({ statistics }: StreakCardProps) {
  const { t } = useTranslation();

  const getStreakMessage = (days: number) => {
    if (days === 0) {
      return t("dashboard.noStreak", "Bắt đầu chuỗi ngày học của bạn!");
    }
    if (days === 1) {
      return t("dashboard.keepGoing", "Tiếp tục phát huy!");
    }
    if (days < 7) {
      return t("dashboard.goodStart", "Bạn đang làm rất tốt!");
    }
    if (days < 30) {
      return t("dashboard.impressive", "Ấn tượng! Tiếp tục nhé!");
    }
    return t("dashboard.amazing", "Tuyệt vời! Bạn là một tấm gương!");
  };

  const getStreakIcon = (days: number) => {
    if (days === 0) return "🚀";
    if (days < 7) return "🔥";
    if (days < 30) return "⭐";
    return "🏆";
  };

  return (
    <div className="rounded-xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-brand-100/50 p-6 shadow-sm dark:border-brand-800 dark:from-brand-900/40 dark:to-brand-900/20">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm dark:bg-gray-900">
          {getStreakIcon(statistics.streakDays)}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("dashboard.streak", "Chuỗi ngày học")}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {getStreakMessage(statistics.streakDays)}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 text-center shadow-sm dark:bg-gray-900">
        <div className="text-5xl font-bold text-brand-600 dark:text-brand-400">
          {statistics.streakDays}
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {statistics.streakDays === 1
            ? t("dashboard.day", "ngày")
            : t("dashboard.days", "ngày")}
        </p>
      </div>

      {statistics.lastPracticeDate && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {t("dashboard.lastPractice", "Lần cuối:")} {new Date(statistics.lastPracticeDate).toLocaleDateString("vi-VN")}
          </span>
        </div>
      )}
    </div>
  );
}







