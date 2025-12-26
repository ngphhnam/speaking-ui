"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { useGetUserStatisticsQuery, type UserStatistics } from "@/store/api/statisticsApi";
import DashboardMetrics from "./DashboardMetrics";
import ProgressChart from "./ProgressChart";
import SkillsRadar from "./SkillsRadar";
import WeakTopics from "./WeakTopics";
import RecentActivity from "./RecentActivity";
import StreakCard from "./StreakCard";
import Link from "next/link";

// Dữ liệu mẫu khi API lỗi
const getMockStatistics = (): UserStatistics => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  return {
    totalQuestions: 156,
    totalRecordings: 42,
    averageScore: 6.8,
    totalPracticeTime: 1240, // phút
    streakDays: 7,
    lastPracticeDate: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 giờ trước
    scoresBySkill: {
      fluency: 6.5,
      vocabulary: 7.2,
      grammar: 6.8,
      pronunciation: 6.9,
    },
    progressByMonth: [
      {
        month: threeMonthsAgo.toLocaleDateString("vi-VN", { month: "short", year: "numeric" }),
        averageScore: 5.8,
        totalRecordings: 8,
      },
      {
        month: twoMonthsAgo.toLocaleDateString("vi-VN", { month: "short", year: "numeric" }),
        averageScore: 6.2,
        totalRecordings: 12,
      },
      {
        month: lastMonth.toLocaleDateString("vi-VN", { month: "short", year: "numeric" }),
        averageScore: 6.5,
        totalRecordings: 15,
      },
      {
        month: now.toLocaleDateString("vi-VN", { month: "short", year: "numeric" }),
        averageScore: 6.8,
        totalRecordings: 7,
      },
    ],
    weakTopics: [
      {
        topicId: "1",
        topicTitle: "Work & Career",
        averageScore: 5.2,
        totalAttempts: 5,
      },
      {
        topicId: "2",
        topicTitle: "Environment",
        averageScore: 5.8,
        totalAttempts: 3,
      },
      {
        topicId: "3",
        topicTitle: "Technology",
        averageScore: 6.1,
        totalAttempts: 4,
      },
    ],
    recentRecordings: [
      {
        id: "1",
        questionId: "q1",
        questionText: "Describe a time when you had to solve a difficult problem.",
        recordedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        overallScore: 7.2,
      },
      {
        id: "2",
        questionId: "q2",
        questionText: "What are the advantages and disadvantages of working from home?",
        recordedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        overallScore: 6.8,
      },
      {
        id: "3",
        questionId: "q3",
        questionText: "How do you think technology will change education in the future?",
        recordedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        overallScore: 6.5,
      },
      {
        id: "4",
        questionId: "q4",
        questionText: "Describe a place you visited that made a strong impression on you.",
        recordedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        overallScore: 7.0,
      },
      {
        id: "5",
        questionId: "q5",
        questionText: "What role does music play in your life?",
        recordedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        overallScore: 6.9,
      },
    ],
  };
};

export default function DashboardShell() {
  const { t } = useTranslation();
  const { data: statistics, isLoading, error } = useGetUserStatisticsQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  // Sử dụng dữ liệu mẫu nếu API lỗi hoặc không có dữ liệu
  const displayStatistics: UserStatistics = statistics || getMockStatistics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("dashboard.title", "Bảng điều khiển")}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t(
              "dashboard.subtitle",
              "Theo dõi tiến độ học tập và cải thiện kỹ năng của bạn"
            )}
          </p>
        </div>
        <Link
          href="/practice-by-questions"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          <svg
            className="h-5 w-5"
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
          {t("dashboard.startPractice", "Bắt đầu luyện tập")}
        </Link>
      </div>

      {/* Thông báo khi đang dùng dữ liệu mẫu */}
      {error && (
        <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {t("dashboard.apiError", "API đang gặp sự cố")}
              </p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                {t(
                  "dashboard.usingMockData",
                  "Đang hiển thị dữ liệu mẫu để bạn có thể xem giao diện dashboard."
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics */}
      <DashboardMetrics statistics={displayStatistics} />

      {/* Streak + Skills */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <StreakCard statistics={displayStatistics} />
        </div>
        <div className="lg:col-span-2">
          <SkillsRadar statistics={displayStatistics} />
        </div>
      </div>

      {/* Progress Chart */}
      <ProgressChart statistics={displayStatistics} />

      {/* Weak Topics + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WeakTopics statistics={displayStatistics} />
        <RecentActivity statistics={displayStatistics} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/learning-history"
          className="group rounded-xl border-2 border-gray-200 bg-white p-6 transition hover:border-brand-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <svg
                className="h-6 w-6 text-purple-600 dark:text-purple-400"
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
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("dashboard.learningHistory", "Lịch sử học tập")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("dashboard.viewAllRecordings", "Xem tất cả bài làm")}
              </p>
            </div>
            <svg
              className="ml-auto h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-600 dark:group-hover:text-brand-400"
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
        </Link>

        <Link
          href="/mock-test"
          className="group rounded-xl border-2 border-gray-200 bg-white p-6 transition hover:border-brand-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <svg
                className="h-6 w-6 text-amber-600 dark:text-amber-400"
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
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("dashboard.mockTest", "Thi thử")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("dashboard.takeFullTest", "Làm bài thi đầy đủ")}
              </p>
            </div>
            <svg
              className="ml-auto h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-600 dark:group-hover:text-brand-400"
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
        </Link>

        <Link
          href="/my-profile"
          className="group rounded-xl border-2 border-gray-200 bg-white p-6 transition hover:border-brand-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <svg
                className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("dashboard.myProfile", "Hồ sơ của tôi")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("dashboard.editProfile", "Chỉnh sửa thông tin")}
              </p>
            </div>
            <svg
              className="ml-auto h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-600 dark:group-hover:text-brand-400"
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
        </Link>
      </div>
    </div>
  );
}





