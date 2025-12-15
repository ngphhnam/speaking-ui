"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/modal";
import {
  useGetRecordingsByQuestionQuery,
  useGetAnalysisResultByRecordingQuery,
  type RecordingDto,
} from "@/store/api/recordingApi";
import AnalysisDetailModal from "./AnalysisDetailModal";

type RecordingsHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  questionText: string;
};

export default function RecordingsHistoryModal({
  isOpen,
  onClose,
  questionId,
  questionText,
}: RecordingsHistoryModalProps) {
  const { t } = useTranslation();
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(
    null
  );

  const {
    data: recordings,
    isLoading,
    error,
  } = useGetRecordingsByQuestionQuery(questionId, {
    skip: !isOpen,
  });

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

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRecordingClick = (recordingId: string) => {
    setSelectedRecordingId(recordingId);
  };

  const handleCloseAnalysisDetail = () => {
    setSelectedRecordingId(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen && !selectedRecordingId} onClose={onClose}>
        <div className="max-h-[85vh] w-full max-w-4xl overflow-hidden p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("recordings.historyTitle", "Lịch sử trả lời")}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {questionText}
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-rose-50 p-4 text-center text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
              {t(
                "recordings.loadError",
                "Không thể tải lịch sử trả lời. Vui lòng thử lại."
              )}
            </div>
          )}

          {!isLoading && !error && recordings && recordings.length === 0 && (
            <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-600 dark:bg-gray-800 dark:text-gray-400">
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
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <p>{t("recordings.noRecordings", "Chưa có lần trả lời nào")}</p>
            </div>
          )}

          {!isLoading && !error && recordings && recordings.length > 0 && (
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
              {recordings.map((recording, index) => (
                <RecordingListItem
                  key={recording.id}
                  recording={recording}
                  orderNumber={recordings.length - index}
                  onClick={() => handleRecordingClick(recording.id)}
                  t={t}
                  formatDate={formatDate}
                  formatDuration={formatDuration}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>

      {selectedRecordingId && (
        <AnalysisDetailModal
          isOpen={!!selectedRecordingId}
          onClose={handleCloseAnalysisDetail}
          recordingId={selectedRecordingId}
          questionText={questionText}
        />
      )}
    </>
  );
}

type RecordingListItemProps = {
  recording: RecordingDto;
  orderNumber: number;
  onClick: () => void;
  t: (key: string, defaultValue?: string) => string;
  formatDate: (date: string) => string;
  formatDuration: (seconds: number | null) => string;
};

function RecordingListItem({
  recording,
  orderNumber,
  onClick,
  t,
  formatDate,
  formatDuration,
}: RecordingListItemProps) {
  const {
    data: analysis,
    isLoading,
  } = useGetAnalysisResultByRecordingQuery(recording.id, {
    skip: recording.processingStatus !== "completed",
  });

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-brand-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
              #{orderNumber}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(recording.recordedAt)}
                </span>
                {recording.processingStatus === "completed" && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {t("recordings.completed", "Đã chấm điểm")}
                  </span>
                )}
                {recording.processingStatus === "processing" && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {t("recordings.processing", "Đang xử lý")}
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                {recording.durationSeconds && (
                  <span className="inline-flex items-center gap-1">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                      <path strokeLinecap="round" strokeWidth={2} d="M12 6v6l4 2" />
                    </svg>
                    {t("recordings.duration", "Thời lượng")}: {formatDuration(recording.durationSeconds)}
                  </span>
                )}

                {recording.processingStatus === "completed" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t("recordings.overallScore", "Điểm tổng")}:
                    <span className="ml-1 text-brand-700 dark:text-brand-300">
                      {isLoading
                        ? "..."
                        : analysis?.overallBandScore?.toFixed(1) ?? t("recordings.noScore", "N/A")}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {recording.transcriptionText && (
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {recording.transcriptionText}
              </p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-gray-400 transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

