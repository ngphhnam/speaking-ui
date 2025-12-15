"use client";

import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/modal";
import {
  useGetRecordingByIdQuery,
  useGetAnalysisResultByRecordingQuery,
} from "@/store/api/recordingApi";

type AnalysisDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recordingId: string;
  questionText: string;
};

export default function AnalysisDetailModal({
  isOpen,
  onClose,
  recordingId,
  questionText,
}: AnalysisDetailModalProps) {
  const { t } = useTranslation();

  const {
    data: recording,
    isLoading: isLoadingRecording,
    error: recordingError,
  } = useGetRecordingByIdQuery(recordingId, {
    skip: !isOpen,
  });

  const {
    data: analysis,
    isLoading: isLoadingAnalysis,
    error: analysisError,
  } = useGetAnalysisResultByRecordingQuery(recordingId, {
    skip: !isOpen,
  });

  const isLoading = isLoadingRecording || isLoadingAnalysis;
  const error = recordingError || analysisError;

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

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("analysis.detailTitle", "Chi tiết phân tích")}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {questionText}
          </p>
          {recording && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {formatDate(recording.recordedAt)}
            </p>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-rose-50 p-4 text-center text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
            {t(
              "analysis.loadError",
              "Không thể tải kết quả phân tích. Vui lòng thử lại."
            )}
          </div>
        )}

        {!isLoading && !error && recording && analysis && (
          <div className="max-h-[75vh] space-y-6 overflow-y-auto pr-2">
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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

            {/* Transcription */}
            {recording.transcriptionText && (
              <div className="space-y-3 rounded-xl border-2 border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("analysis.transcription", "Bản ghi âm của bạn")}
                </h3>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {recording.transcriptionText}
                  </p>
                </div>
                {recording.refinedText &&
                  recording.refinedText !== recording.transcriptionText && (
                    <>
                      <h4 className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("analysis.refinedText", "Bản chỉnh sửa")}
                      </h4>
                      <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          {recording.refinedText}
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

            {/* Audio Player */}
            {recording.audioUrl && (
              <div className="rounded-xl border-2 border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  {t("analysis.audioRecording", "Bản ghi âm")}
                </h3>
                <audio controls className="w-full">
                  <source src={recording.audioUrl} type={`audio/${recording.audioFormat}`} />
                  {t("analysis.audioNotSupported", "Trình duyệt không hỗ trợ phát audio.")}
                </audio>
              </div>
            )}
          </div>
        )}

        {!isLoading &&
          !error &&
          recording &&
          !analysis &&
          recording.processingStatus !== "completed" && (
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
    </Modal>
  );
}




