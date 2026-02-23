"use client";

import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SpeakingSessionHistoryItem } from "@/store/api/speakingSessionApi";
import { useGetSessionByIdQuery } from "@/store/api/speakingSessionApi";
import {
  useGetAnalysisResultByRecordingQuery,
  useGetRecordingsBySessionQuery,
  useGetRecordingsByUserQuery,
  useGetRecordingByIdQuery,
  type RecordingDto,
} from "@/store/api/recordingApi";
import { getErrorMessage } from "@/utils/errorHandler";

const formatScore = (score: number | null | undefined) => {
  if (typeof score !== "number" || Number.isNaN(score)) return "—";
  return score.toFixed(1);
};

export default function LearningHistorySessionItem({
  session,
  isOpen,
  onToggle,
  userId,
}: {
  session: SpeakingSessionHistoryItem;
  isOpen: boolean;
  onToggle: () => void;
  userId: string;
}) {
  const { t } = useTranslation();
  const [openRecordingId, setOpenRecordingId] = useState<string | null>(null);
  const [useUserFallback, setUseUserFallback] = useState(false);

  const {
    data: sessionDetail,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useGetSessionByIdQuery(session.id, { skip: !isOpen });

  const {
    data: recordingsBySession,
    isLoading: isLoadingRecordingsBySession,
    error: recordingsBySessionError,
  } = useGetRecordingsBySessionQuery(session.id, { skip: !isOpen || useUserFallback });

  const {
    data: userRecordings,
    isLoading: isLoadingUserRecordings,
    error: userRecordingsError,
  } = useGetRecordingsByUserQuery(userId, { skip: !isOpen || !useUserFallback });

  const recordings = useMemo(() => {
    if (!isOpen) return [];
    if (useUserFallback) {
      return (userRecordings ?? []).filter((r) => r.sessionId === session.id);
    }
    return recordingsBySession ?? [];
  }, [isOpen, useUserFallback, userRecordings, recordingsBySession, session.id]);


  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-start gap-4 p-5 text-left transition hover:border-brand-500"
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
            {formatScore(session.overallBandScore)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-2">
            {session.topic || "N/A"}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t("learningHistory.status", "Trạng thái")}:{" "}
            <span className="capitalize">{session.status}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {isOpen
              ? t("common.collapse", "Thu gọn")
              : t("common.expand", "Xem chi tiết")}
          </div>
        </div>
      </button>

      {isOpen ? (
        <div className="border-t border-gray-200 p-5 dark:border-gray-800">
          {(isLoadingSession || isLoadingRecordingsBySession || isLoadingUserRecordings) && (
            <div className="text-sm text-gray-500">
              {t("learningHistory.loadingDetail", "Đang tải chi tiết...")}
            </div>
          )}

          {sessionError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
              {getErrorMessage(sessionError, t)}
            </div>
          ) : null}

          {recordingsBySessionError && !useUserFallback ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
              <div className="font-semibold">
                {t("learningHistory.recordingsEndpointMissing", "Chưa hỗ trợ lấy recordings theo session")}
              </div>
              <div className="mt-1">
                {t(
                  "learningHistory.recordingsFallbackHint",
                  "Mình sẽ fallback bằng cách tải recordings của user rồi lọc theo session."
                )}
              </div>
              <button
                type="button"
                onClick={() => setUseUserFallback(true)}
                className="mt-3 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white"
              >
                {t("learningHistory.useFallback", "Dùng fallback")}
              </button>
            </div>
          ) : null}

          {userRecordingsError ? (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
              {getErrorMessage(userRecordingsError, t)}
            </div>
          ) : null}

          {(() => {
            // Calculate values with fallbacks
            const questionsAnswered = sessionDetail?.questionsAnswered ?? recordings.length;
            const averageScore = sessionDetail?.averageScore ?? session.overallBandScore;

            return (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-950">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {t("learningHistory.questionsAnswered", "Số câu đã trả lời")}
                  </div>
                  <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                    {questionsAnswered > 0 ? questionsAnswered : "—"}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-950">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {t("learningHistory.avgScore", "Điểm TB")}
                  </div>
                  <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                    {averageScore != null ? formatScore(averageScore) : "—"}
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="mt-4">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("learningHistory.recordings", "Bài ghi âm")}
            </div>
            {recordings.length === 0 ? (
              <div className="mt-2 text-sm text-gray-500">
                {t("learningHistory.noRecordingsForSession", "Không có recording nào cho session này.")}
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                {recordings.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenRecordingId((prev) => (prev === r.id ? null : r.id))
                      }
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          Recording #{r.id.slice(0, 6)}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {t("learningHistory.processingStatus", "Trạng thái")}:{" "}
                          {r.processingStatus}
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {openRecordingId === r.id
                          ? t("common.collapse", "Thu gọn")
                          : t("common.expand", "Xem chi tiết")}
                      </div>
                    </button>

                    {openRecordingId === r.id ? (
                      <RecordingDetailContent recording={r} />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Component to display recording detail with full analysis
function RecordingDetailContent({
  recording,
}: {
  recording: Partial<RecordingDto> & { id: string; questionId: string };
}) {
  const { t } = useTranslation();

  const {
    data: fullRecording,
    isLoading: isLoadingRecording,
    error: recordingError,
  } = useGetRecordingByIdQuery(recording.id, {
    skip: !recording.id,
  });

  const {
    data: analysis,
    isLoading: isLoadingAnalysis,
    error: analysisError,
  } = useGetAnalysisResultByRecordingQuery(recording.id, {
    skip: !recording.id,
  });

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 5) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 7)
      return "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
    if (score >= 5)
      return "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800";
    return "bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800";
  };

  const isLoading = isLoadingRecording || isLoadingAnalysis;
  const error = recordingError || analysisError;

  // Use full recording data if available, otherwise fallback to basic recording
  const displayRecording = fullRecording || recording;

  return (
    <div className="mt-3 space-y-4 border-t border-gray-200 pt-4 dark:border-gray-800">
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
          {getErrorMessage(error, t)}
        </div>
      )}

      {!isLoading && !error && displayRecording && analysis && (
        <div className="space-y-4">
          {/* Overall Score */}
          <div
            className={`rounded-xl border-2 p-6 text-center ${getScoreBgColor(
              analysis.overallBandScore
            )}`}
          >
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("analysis.overallScore", "Điểm tổng quan")}
            </p>
            <p
              className={`text-5xl font-bold ${getScoreColor(
                analysis.overallBandScore
              )}`}
            >
              {analysis.overallBandScore.toFixed(1)}
            </p>
          </div>

          {/* Individual Scores */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border-2 border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                {t("analysis.fluency", "Lưu loát")}
              </p>
              <p
                className={`text-2xl font-bold ${getScoreColor(
                  analysis.fluencyScore
                )}`}
              >
                {analysis.fluencyScore.toFixed(1)}
              </p>
            </div>
            <div className="rounded-lg border-2 border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                {t("analysis.vocabulary", "Từ vựng")}
              </p>
              <p
                className={`text-2xl font-bold ${getScoreColor(
                  analysis.vocabularyScore
                )}`}
              >
                {analysis.vocabularyScore.toFixed(1)}
              </p>
            </div>
            <div className="rounded-lg border-2 border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                {t("analysis.grammar", "Ngữ pháp")}
              </p>
              <p
                className={`text-2xl font-bold ${getScoreColor(
                  analysis.grammarScore
                )}`}
              >
                {analysis.grammarScore.toFixed(1)}
              </p>
            </div>
            <div className="rounded-lg border-2 border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                {t("analysis.pronunciation", "Phát âm")}
              </p>
              <p
                className={`text-2xl font-bold ${getScoreColor(
                  analysis.pronunciationScore
                )}`}
              >
                {analysis.pronunciationScore.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Audio Player */}
          {displayRecording.audioUrl && (
            <div className="rounded-xl border-2 border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                {t("analysis.audioRecording", "Bản ghi âm")}
              </h3>
              <audio controls className="w-full">
                <source
                  src={displayRecording.audioUrl}
                  type={`audio/${displayRecording.audioFormat || "mp3"}`}
                />
                {t("analysis.audioNotSupported", "Trình duyệt không hỗ trợ phát audio.")}
              </audio>
            </div>
          )}

          {/* Transcription */}
          {displayRecording.transcriptionText && (
            <div className="space-y-3 rounded-xl border-2 border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("analysis.transcription", "Bản ghi âm của bạn")}
              </h3>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {displayRecording.transcriptionText}
                </p>
              </div>
              {displayRecording.refinedText &&
                displayRecording.refinedText !== displayRecording.transcriptionText && (
                  <>
                    <h4 className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("analysis.refinedText", "Bản chỉnh sửa")}
                    </h4>
                    <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {displayRecording.refinedText}
                      </p>
                    </div>
                  </>
                )}
            </div>
          )}

          {/* Feedback Summary */}
          {analysis.feedbackSummary && (
            <div className="space-y-3 rounded-xl border-2 border-brand-200 bg-white p-5 dark:border-brand-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("analysis.feedback", "Nhận xét tổng quan")}
              </h3>
              <div className="rounded-lg bg-brand-50/50 p-4 dark:bg-brand-900/10">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {analysis.feedbackSummary}
                </p>
              </div>
            </div>
          )}

          {/* Strengths */}
          {analysis.strengths && (
            <div className="space-y-3 rounded-xl border-2 border-emerald-200 bg-white p-5 dark:border-emerald-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("analysis.strengths", "Điểm mạnh")}
              </h3>
              <div className="rounded-lg bg-emerald-50/50 p-4 dark:bg-emerald-900/10">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {analysis.strengths}
                </p>
              </div>
            </div>
          )}

          {/* Improvements */}
          {analysis.improvements && (
            <div className="space-y-3 rounded-xl border-2 border-amber-200 bg-white p-5 dark:border-amber-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("analysis.improvements", "Cần cải thiện")}
              </h3>
              <div className="rounded-lg bg-amber-50/50 p-4 dark:bg-amber-900/10">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {analysis.improvements}
                </p>
              </div>
            </div>
          )}

          {/* Grammar Corrections */}
          {analysis.corrections && analysis.corrections.length > 0 && (
            <div className="space-y-3 rounded-xl border-2 border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t(
                  "analysis.corrections",
                  `Sửa lỗi (${analysis.corrections.length})`
                )}
              </h3>
              <div className="space-y-3">
                {analysis.corrections.map((correction, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                  >
                    <div className="mb-2 flex flex-wrap items-start gap-2">
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                        <span className="mr-1">✗</span>
                        {correction.original}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <span className="mr-1">✓</span>
                        {correction.corrected}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {correction.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammar Issues */}
          {analysis.grammarIssues && (
            <div className="space-y-3 rounded-xl border-2 border-blue-200 bg-white p-5 dark:border-blue-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("analysis.grammarIssues", "Vấn đề ngữ pháp")}
              </h3>
              <div className="rounded-lg bg-blue-50/50 p-4 dark:bg-blue-900/10">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {analysis.grammarIssues}
                </p>
              </div>
            </div>
          )}

          {/* Pronunciation Issues */}
          {analysis.pronunciationIssues && (
            <div className="space-y-3 rounded-xl border-2 border-purple-200 bg-white p-5 dark:border-purple-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("analysis.pronunciationIssues", "Vấn đề phát âm")}
              </h3>
              <div className="rounded-lg bg-purple-50/50 p-4 dark:bg-purple-900/10">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {analysis.pronunciationIssues}
                </p>
              </div>
            </div>
          )}

          {/* Vocabulary Suggestions */}
          {analysis.vocabularySuggestions && (
            <div className="space-y-3 rounded-xl border-2 border-indigo-200 bg-white p-5 dark:border-indigo-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("analysis.vocabularySuggestions", "Gợi ý từ vựng")}
              </h3>
              <div className="rounded-lg bg-indigo-50/50 p-4 dark:bg-indigo-900/10">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {analysis.vocabularySuggestions}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading &&
        !error &&
        displayRecording &&
        !analysis &&
        displayRecording.processingStatus !== "completed" && (
          <div className="rounded-lg bg-amber-50 p-8 text-center dark:bg-amber-900/20">
            <svg
              className="mx-auto mb-4 h-12 w-12 animate-spin text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {t(
                "analysis.processing",
                "Đang xử lý và chấm điểm bài làm của bạn. Vui lòng đợi trong giây lát..."
              )}
            </p>
          </div>
        )}
    </div>
  );
}

