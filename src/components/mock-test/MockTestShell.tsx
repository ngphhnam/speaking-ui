"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type MockTestDto,
  useGetMyMockTestHistoryQuery,
  useStartMockTestMutation,
} from "@/store/api/mockTestApi";
import { getErrorMessage } from "@/utils/errorHandler";

export default function MockTestShell() {
  const { t } = useTranslation();
  const router = useRouter();
  const [startMockTest, { isLoading: isStarting }] = useStartMockTestMutation();
  const {
    data: history,
    isLoading: isLoadingHistory,
    error: historyError,
    refetch,
  } = useGetMyMockTestHistoryQuery();

  const handleStart = async () => {
    try {
      const started = await startMockTest({
        part1QuestionCount: 3,
        part2QuestionCount: 1,
        part3QuestionCount: 4,
      }).unwrap();
      router.push(`/mock-test/${started.id}`);
    } catch (e) {
      alert(
        getErrorMessage(
          e,
          t,
          t("mockTest.startFailed", "Không thể bắt đầu mock test. Vui lòng thử lại.")
        )
      );
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleStart}
          disabled={isStarting}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          {isStarting
            ? t("mockTest.starting", "Đang bắt đầu...")
            : t("mockTest.start", "Bắt đầu Mock Test")}
        </button>

        <button
          onClick={() => refetch()}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-brand-500 dark:hover:text-brand-400"
        >
          {t("mockTest.refresh", "Tải lại lịch sử")}
        </button>
      </div>

      {/* History */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("mockTest.historyTitle", "Lịch sử Mock Test")}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t(
            "mockTest.historyDesc",
            "Bạn có thể tiếp tục bài đang làm hoặc xem kết quả bài đã hoàn thành."
          )}
        </p>

        {historyError ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
            {getErrorMessage(
              historyError,
              t,
              t("mockTest.historyFailed", "Không thể tải lịch sử.")
            )}
          </div>
        ) : null}

        {isLoadingHistory ? (
          <div className="mt-4 text-sm text-gray-500">
            {t("mockTest.loadingHistory", "Đang tải...")}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {(history ?? []).length === 0 ? (
              <div className="text-sm text-gray-500">
                {t("mockTest.noHistory", "Chưa có mock test nào.")}
              </div>
            ) : (
              (history ?? []).map((test: MockTestDto) => (
                <div
                  key={test.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t("mockTest.test", "Mock Test")} #{test.id.slice(0, 6)}
                      </div>
                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {t("mockTest.startedAt", "Bắt đầu")}{" "}
                        {new Date(test.startedAt).toLocaleString()}
                </div>
            </div>

                    {test.status === "completed" && test.overallScore != null ? (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <span
                          className={`text-base font-bold ${getScoreColor(
                            test.overallScore
                )}`}
              >
                          {Number(test.overallScore).toFixed(1)}
              </span>
                      </div>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                        {t("mockTest.inProgress", "Đang làm")}
                </span>
              )}
            </div>

                  <div className="mt-3 flex gap-2">
              <Link
                href={`/mock-test/${test.id}`}
                      className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                      {test.status === "completed"
                  ? t("mockTest.retake", "Làm lại")
                        : t("mockTest.continue", "Tiếp tục")}
              </Link>
                    {test.status === "completed" ? (
                <Link
                  href={`/mock-test/${test.id}/results`}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-brand-500 dark:hover:text-brand-400"
                >
                  {t("mockTest.viewResults", "Kết quả")}
                </Link>
                    ) : null}
            </div>
          </div>
              ))
            )}
      </div>
        )}
      </div>
    </div>
  );
}

