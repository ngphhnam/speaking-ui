"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { QuestionScore } from "@/store/api/mockTestApi";
import {
  useGetAnalysisResultByRecordingQuery,
  useGetRecordingByIdQuery,
} from "@/store/api/recordingApi";
import { getErrorMessage } from "@/utils/errorHandler";

const formatScore = (score: number | null | undefined) => {
  if (typeof score !== "number" || Number.isNaN(score)) return "—";
  return score.toFixed(1);
};

const toAudioSrc = (audioUrl: string) => {
  // If backend returns a relative path, prefix with API base URL so browser can load it
  if (/^https?:\/\//i.test(audioUrl)) return audioUrl;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return audioUrl;
  const baseTrimmed = base.replace(/\/+$/, "");
  const urlTrimmed = audioUrl.startsWith("/") ? audioUrl : `/${audioUrl}`;
  return `${baseTrimmed}${urlTrimmed}`;
};

export default function MockTestQuestionScoreItem({
  questionText,
  qs,
  isOpen,
  onToggle,
}: {
  questionText: string;
  qs: QuestionScore;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();

  const {
    data: recording,
    isLoading: isLoadingRecording,
    error: recordingError,
  } = useGetRecordingByIdQuery(qs.recordingId, {
    skip: !isOpen || !qs.recordingId,
  });

  const {
    data: analysis,
    isLoading: isLoadingAnalysis,
    error: analysisError,
  } = useGetAnalysisResultByRecordingQuery(qs.recordingId, {
    skip: !isOpen || !qs.recordingId,
  });

  const title = useMemo(() => {
    const firstLine = (questionText ?? "Question").split("\n")[0]?.trim();
    return firstLine || "Question";
  }, [questionText]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-wrap items-center justify-between gap-3 p-3 text-left"
      >
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </div>
          <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 sm:grid-cols-5">
            <div>
              <span className="font-semibold">Overall:</span>{" "}
              {formatScore(qs.overallBandScore)}
            </div>
            <div>
              <span className="font-semibold">Fluency:</span>{" "}
              {formatScore(qs.fluencyScore)}
            </div>
            <div>
              <span className="font-semibold">Vocab:</span>{" "}
              {formatScore(qs.vocabularyScore)}
            </div>
            <div>
              <span className="font-semibold">Grammar:</span>{" "}
              {formatScore(qs.grammarScore)}
            </div>
            <div>
              <span className="font-semibold">Pronun:</span>{" "}
              {formatScore(qs.pronunciationScore)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
          {isOpen ? t("common.collapse", "Thu gọn") : t("common.expand", "Xem chi tiết")}
        </div>
      </button>

      {isOpen ? (
        <div className="border-t border-gray-200 p-3 dark:border-gray-800">
          {(isLoadingRecording || isLoadingAnalysis) && (
            <div className="text-xs text-gray-500">
              {t("mockTest.loadingDetail", "Đang tải chi tiết...")}
            </div>
          )}

          {recordingError || analysisError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
              {getErrorMessage(
                recordingError || analysisError,
                t,
                t("mockTest.loadDetailFailed", "Không thể tải chi tiết câu hỏi.")
              )}
            </div>
          ) : null}

          {recording ? (
            <div className="mt-2">
              {recording.audioUrl ? (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {t("mockTest.audio", "Audio")}
                  </div>
                  <audio
                    controls
                    src={toAudioSrc(recording.audioUrl)}
                    className="mt-2 w-full"
                  />
                </div>
              ) : null}

              <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                {t("mockTest.transcription", "Transcription")}
              </div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
                {recording.transcriptionText || "—"}
              </div>
            </div>
          ) : null}

          {analysis ? (
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {t("mockTest.feedback", "Feedback")}
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
                  {analysis.feedbackSummary || "—"}
                </div>
              </div>

              {analysis.strengths ? (
                <div>
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                    {t("mockTest.strengths", "Strengths")}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
                    {analysis.strengths}
                  </div>
                </div>
              ) : null}

              {analysis.improvements ? (
                <div>
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-200">
                    {t("mockTest.improvements", "Improvements")}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
                    {analysis.improvements}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {!isLoadingRecording && !isLoadingAnalysis && !recording && !analysis ? (
            <div className="text-xs text-gray-500">
              {t("mockTest.noDetail", "Chưa có dữ liệu chi tiết.")}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

