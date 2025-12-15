"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

type TestStatus = "not_started" | "in_progress" | "completed";

export default function MockTestShell() {
  const { t } = useTranslation();
  const [testStatus, setTestStatus] = useState<TestStatus>("not_started");

  const mockTests = [
    {
      id: "1",
      title: "IELTS Speaking Mock Test #1",
      description: "Full test with Part 1, Part 2, and Part 3",
      duration: "11-14 minutes",
      difficulty: "Intermediate",
      topics: ["Daily Routine", "Hobbies", "Technology"],
      completed: true,
      lastScore: 7.5,
      attempts: 3,
    },
    {
      id: "2",
      title: "IELTS Speaking Mock Test #2",
      description: "Full test with Part 1, Part 2, and Part 3",
      duration: "11-14 minutes",
      difficulty: "Advanced",
      topics: ["Education", "Environment", "Social Issues"],
      completed: false,
      lastScore: null,
      attempts: 0,
    },
    {
      id: "3",
      title: "IELTS Speaking Mock Test #3",
      description: "Full test with Part 1, Part 2, and Part 3",
      duration: "11-14 minutes",
      difficulty: "Beginner",
      topics: ["Family", "Food", "Travel"],
      completed: true,
      lastScore: 6.0,
      attempts: 1,
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "intermediate":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "advanced":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-600 dark:text-gray-400";
    if (score >= 7) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 5) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("mockTest.title", "Thi thử IELTS Speaking")}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t(
              "mockTest.subtitle",
              "Làm bài thi thử đầy đủ để đánh giá trình độ của bạn"
            )}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-purple-50 p-6 dark:border-brand-800 dark:from-brand-900/40 dark:to-purple-900/40">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-900">
            <svg
              className="h-6 w-6 text-brand-600 dark:text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t("mockTest.infoTitle", "Về bài thi thử")}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t(
                "mockTest.infoDescription",
                "Mỗi bài thi thử bao gồm 3 phần: Part 1 (4-5 phút), Part 2 (3-4 phút), và Part 3 (4-5 phút). Bạn sẽ được chấm điểm tự động và nhận phản hồi chi tiết sau khi hoàn thành."
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  {t("mockTest.feature1", "Chấm điểm tự động")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  {t("mockTest.feature2", "Phản hồi chi tiết")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  {t("mockTest.feature3", "Lưu lịch sử")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Tests Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {mockTests.map((test) => (
          <div
            key={test.id}
            className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {test.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {test.description}
                </p>
              </div>
              {test.completed && test.lastScore && (
                <div className="ml-4 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <span
                    className={`text-lg font-bold ${getScoreColor(
                      test.lastScore
                    )}`}
                  >
                    {test.lastScore.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getDifficultyColor(
                  test.difficulty
                )}`}
              >
                {test.difficulty}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <svg
                  className="mr-1 inline h-3.5 w-3.5"
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
                {test.duration}
              </span>
              {test.attempts > 0 && (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {test.attempts}{" "}
                  {test.attempts === 1
                    ? t("mockTest.attempt", "lần")
                    : t("mockTest.attempts", "lần")}
                </span>
              )}
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                {t("mockTest.topics", "Chủ đề:")}
              </p>
              <div className="flex flex-wrap gap-2">
                {test.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/mock-test/${test.id}`}
                className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                {test.completed
                  ? t("mockTest.retake", "Làm lại")
                  : t("mockTest.start", "Bắt đầu")}
              </Link>
              {test.completed && (
                <Link
                  href={`/mock-test/${test.id}/results`}
                  className="flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:text-brand-400"
                >
                  <svg
                    className="h-4 w-4"
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
                  {t("mockTest.viewResults", "Kết quả")}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {t("mockTest.moreComing", "Thêm bài thi thử sẽ được cập nhật sớm!")}
        </p>
      </div>
    </div>
  );
}

