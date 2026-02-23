"use client";

import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  type MockTestDto,
  type MockTestScores,
  useGetMockTestByIdQuery,
  useGetQuestionScoresQuery,
} from "@/store/api/mockTestApi";
import { getErrorMessage } from "@/utils/errorHandler";
import MockTestQuestionScoreItem from "@/components/mock-test/MockTestQuestionScoreItem";

const scoreColor = (score: number | null | undefined) => {
  const s = typeof score === "number" ? score : null;
  if (s == null) return "text-gray-600 dark:text-gray-400";
  if (s >= 7) return "text-emerald-600 dark:text-emerald-400";
  if (s >= 5) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
};

const formatScore = (score: number | null | undefined) => {
  if (typeof score !== "number" || Number.isNaN(score)) return "—";
  return score.toFixed(1);
};

export default function MockTestResults({ mockTestId }: { mockTestId: string }) {
  const { t } = useTranslation();
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);

  const {
    data: mockTestRaw,
    isLoading: isLoadingMockTest,
    error: mockTestError,
  } = useGetMockTestByIdQuery(mockTestId);

  const mockTest = mockTestRaw as MockTestDto | undefined;

  const {
    data: scoresRaw,
    isLoading: isLoadingScores,
    error: scoresError,
    refetch: refetchScores,
  } = useGetQuestionScoresQuery(mockTestId, {
    skip: !mockTest || mockTest.status !== "completed",
  });

  const scores = scoresRaw as MockTestScores | undefined;

  const part1 = scores?.part1;
  const part2 = scores?.part2;
  const part3 = scores?.part3;

  const questionTextById = useMemo(() => {
    const map = new Map<string, string>();
    (mockTest?.part1Questions ?? []).forEach((q) => map.set(q.id, q.questionText));
    (mockTest?.part2Questions ?? []).forEach((q) => map.set(q.id, q.questionText));
    (mockTest?.part3Questions ?? []).forEach((q) => map.set(q.id, q.questionText));
    return map;
  }, [mockTest]);

  if (isLoadingMockTest) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-gray-500">
        {t("mockTest.loadingResults", "Đang tải kết quả...")}
      </div>
    );
  }

  if (mockTestError || !mockTest) {
    return (
      <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
        <div className="font-semibold">
          {t("mockTest.resultsLoadFailed", "Không thể tải kết quả")}
        </div>
        <div>{getErrorMessage(mockTestError, t)}</div>
        <Link
          href="/mock-test"
          className="inline-flex rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
        >
          {t("mockTest.backToList", "Quay lại")}
        </Link>
      </div>
    );
  }

  if (mockTest.status !== "completed") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
        <div className="font-semibold">
          {t("mockTest.notCompletedTitle", "Chưa có điểm")}
        </div>
        <div className="mt-1 text-gray-600 dark:text-gray-400">
          {t(
            "mockTest.notCompletedDesc",
            "Bạn chỉ xem được điểm sau khi hoàn thành Part 3 và Complete mock test."
          )}
        </div>
        <div className="mt-4">
          <Link
            href={`/mock-test/${mockTestId}`}
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            {t("mockTest.continue", "Tiếp tục làm bài")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("mockTest.resultsTitle", "Kết quả Mock Test")}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t("mockTest.resultsSubtitle", "Điểm chỉ xuất hiện sau khi complete.")}
            </p>
          </div>

          <Link
            href="/mock-test"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-brand-500 dark:hover:text-brand-400"
          >
            {t("mockTest.backToList", "Quay lại")}
          </Link>
        </div>
      </div>

      {scoresError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
          <div className="font-semibold">
            {t("mockTest.scoresFailed", "Không thể tải điểm chi tiết")}
          </div>
          <div className="mt-1">{getErrorMessage(scoresError, t)}</div>
          <button
            onClick={() => refetchScores()}
            className="mt-3 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
          >
            {t("common.retry", "Thử lại")}
          </button>
        </div>
      ) : null}

      {isLoadingScores || !scores ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          {t("mockTest.loadingScores", "Đang tải điểm...")}
        </div>
      ) : (
        <>
          {!part1 || !part2 || !part3 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
              {t(
                "mockTest.scoresIncomplete",
                "Dữ liệu điểm chi tiết chưa đầy đủ. Vui lòng tải lại hoặc thử lại sau."
              )}
            </div>
          ) : null}

          {scores && typeof scores.overallScore !== "number" ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
              {t(
                "mockTest.scoresShapeWarning",
                "Điểm tổng đang chưa sẵn sàng. Trang sẽ hiển thị tạm thời bằng dữ liệu từ mockTest."
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {t("mockTest.overall", "Overall")}
              </div>
              {/** Prefer scores.overallScore; fallback to mockTest.overallScore */}
              {(() => {
                const overall =
                  typeof scores.overallScore === "number"
                    ? scores.overallScore
                    : mockTest.overallScore;
                return (
              <div
                className={`mt-2 text-3xl font-bold ${scoreColor(
                  overall
                )}`}
              >
                {formatScore(overall)}
              </div>
                );
              })()}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Part 1
              </div>
              <div
                className={`mt-2 text-2xl font-bold ${scoreColor(
                  part1?.averageScore
                )}`}
              >
                {formatScore(part1?.averageScore)}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Part 2
              </div>
              <div
                className={`mt-2 text-2xl font-bold ${scoreColor(
                  part2?.averageScore
                )}`}
              >
                {formatScore(part2?.averageScore)}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Part 3
              </div>
              <div
                className={`mt-2 text-2xl font-bold ${scoreColor(
                  part3?.averageScore
                )}`}
              >
                {formatScore(part3?.averageScore)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("mockTest.detailScores", "Điểm từng câu hỏi")}
            </h3>

            <div className="mt-4 space-y-4">
              {(
                [
                  { label: "Part 1", data: part1?.questionScores ?? [] },
                  { label: "Part 2", data: part2?.questionScores ?? [] },
                  { label: "Part 3", data: part3?.questionScores ?? [] },
                ] as const
              ).map((section) => (
                <div key={section.label} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {section.label}
                  </div>
                  <div className="mt-3 space-y-3">
                    {section.data.length === 0 ? (
                      <div className="text-xs text-gray-500">
                        {t("mockTest.noQuestionScores", "Chưa có điểm cho phần này.")}
                      </div>
                    ) : (
                      section.data.map((qs) => (
                        <MockTestQuestionScoreItem
                          key={qs.questionId}
                          qs={qs}
                          questionText={questionTextById.get(qs.questionId) ?? "Question"}
                          isOpen={openQuestionId === qs.questionId}
                          onToggle={() =>
                            setOpenQuestionId((prev) =>
                              prev === qs.questionId ? null : qs.questionId
                            )
                          }
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

