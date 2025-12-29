"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useGetUserStatisticsQuery } from "@/store/api/statisticsApi";
import type { RootState } from "@/store/store";
import Link from "next/link";

export default function StreakBadge() {
  const { t } = useTranslation();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  
  const { data: statistics } = useGetUserStatisticsQuery(
    userId || "",
    { skip: !userId }
  );

  const streakDays = statistics?.streakDays ?? 0;

  if (!userId || streakDays === 0) {
    return null;
  }

  return (
    <Link
      href="/dashboard"
      className="group flex items-center gap-2 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-2 transition hover:from-orange-100 hover:to-amber-100 dark:border-orange-800 dark:from-orange-900/20 dark:to-amber-900/20 dark:hover:from-orange-900/30 dark:hover:to-amber-900/30"
      title={t("header.streakTooltip", "Chuỗi ngày học tập")}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-xl">🔥</span>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
            {t("header.streak", "Chuỗi")}
          </span>
          <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
            {streakDays} {streakDays === 1 ? t("header.day", "ngày") : t("header.days", "ngày")}
          </span>
        </div>
      </div>
    </Link>
  );
}

