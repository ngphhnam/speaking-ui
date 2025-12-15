"use client";

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGetUserStatisticsQuery } from "@/store/api/statisticsApi";
import { useGetAllSessionsQuery } from "@/store/api/speakingSessionApi";
import { useAppSelector } from "@/store/hooks";

export default function LearningHistoryShell() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);

  const [filterScore, setFilterScore] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 5;

  const { data: statistics, isLoading: isLoadingStats } =
    useGetUserStatisticsQuery();

  const {
    data: sessionsPage,
    isLoading: isLoadingSessions,
    isFetching: isFetchingSessions,
  } = useGetAllSessionsQuery(
    user
      ? { userId: user.id, pageNum, pageSize }
      : // if user chưa sẵn sàng, không gọi API
        // @ts-expect-error RTK Query will handle undefined gracefully in runtime
        undefined
  );

  const sessions = sessionsPage?.items ?? [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score == null) return "text-gray-600 dark:text-gray-400";
    if (score >= 7) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 5) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBg = (score: number | null | undefined) => {
    if (score == null) return "bg-gray-100 dark:bg-gray-800";
    if (score >= 7) return "bg-emerald-100 dark:bg-emerald-900/30";
    if (score >= 5) return "bg-amber-100 dark:bg-amber-900/30";
    return "bg-rose-100 dark:bg-rose-900/30";
  };

  const filteredSessions = useMemo(() => {
    let list = sessions;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => (s.topic || "N/A").toLowerCase().includes(q));
    }

    if (filterScore !== "all") {
      list = list.filter((s) => {
        if (s.overallBandScore == null) return false;
        if (filterScore === "high") return s.overallBandScore >= 7;
        if (filterScore === "medium")
          return s.overallBandScore >= 5 && s.overallBandScore < 7;
        if (filterScore === "low") return s.overallBandScore < 5;
        return true;
      });
    }

    return list;
  }, [sessions, searchQuery, filterScore]);

  const isLoading = isLoadingStats || isLoadingSessions;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("learningHistory.title", "Lịch sử học tập")}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t(
            "learningHistory.subtitle",
            "Xem lại tất cả các bài làm và theo dõi tiến độ của bạn"
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={t(
                "learningHistory.searchPlaceholder",
                "Tìm kiếm theo chủ đề..."
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Score Filter */}
        <select
          value={filterScore}
          onChange={(e) => setFilterScore(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">
            {t("learningHistory.allScores", "Tất cả điểm")}
          </option>
          <option value="high">
            {t("learningHistory.highScores", "Điểm cao (≥7.0)")}
          </option>
          <option value="medium">
            {t("learningHistory.mediumScores", "Điểm trung bình (5.0-6.9)")}
          </option>
          <option value="low">
            {t("learningHistory.lowScores", "Điểm thấp (<5.0)")}
          </option>
        </select>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("learningHistory.totalRecordings", "Tổng bài làm")}
            </p>
            <p className="mt-2 text-3xl font-bold text-brand-600 dark:text-brand-400">
              {statistics.totalRecordings}
            </p>
          </div>
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("learningHistory.averageScore", "Điểm trung bình")}
            </p>
            <p
              className={`mt-2 text-3xl font-bold ${getScoreColor(
                statistics.averageScore
              )}`}
            >
              {statistics.averageScore
                ? statistics.averageScore.toFixed(1)
                : "N/A"}
            </p>
          </div>
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("learningHistory.practiceTime", "Thời gian luyện")}
            </p>
            <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Math.floor(statistics.totalPracticeTime / 60)}h{" "}
              {statistics.totalPracticeTime % 60}m
            </p>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              {t("learningHistory.noRecordings", "Chưa có buổi luyện tập nào")}
            </p>
          </div>
        ) : (
          filteredSessions.map((session, index) => (
            <div
              key={session.id}
              className="group rounded-xl border-2 border-gray-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                  <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                    #{(sessionsPage?.totalCount ?? 0) - ((pageNum - 1) * pageSize + index)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                    {session.topic || "N/A"}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(session.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("learningHistory.status", "Trạng thái")}:{" "}
                    <span className="capitalize">{session.status}</span>
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  {session.overallBandScore != null && (
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-lg ${getScoreBg(
                        session.overallBandScore
                      )}`}
                    >
                      <span
                        className={`text-lg font-bold ${getScoreColor(
                          session.overallBandScore
                        )}`}
                      >
                        {session.overallBandScore.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {sessionsPage && sessionsPage.totalCount > sessionsPage.pageSize && (
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            disabled={pageNum === 1 || isFetchingSessions}
            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
          >
            {t("common.prev", "Trước")}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("learningHistory.pageInfo", "Trang {{page}} / {{total}}", {
              page: sessionsPage.page,
              total: Math.ceil(
                sessionsPage.totalCount / (sessionsPage.pageSize || pageSize)
              ),
            })}
          </p>
          <button
            type="button"
            disabled={
              pageNum >=
                Math.ceil(
                  sessionsPage.totalCount /
                    (sessionsPage.pageSize || pageSize)
                ) || isFetchingSessions
            }
            onClick={() => setPageNum((p) => p + 1)}
            className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
          >
            {t("common.next", "Tiếp")}
          </button>
        </div>
      )}
    </div>
  );
}

