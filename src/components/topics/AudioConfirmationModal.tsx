"use client";

import { useTranslation } from "react-i18next";
import Button from "@/components/ui/button/Button";

type AudioConfirmationModalProps = {
  isOpen: boolean;
  audioBlob: Blob | null;
  duration: number;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

export default function AudioConfirmationModal({
  isOpen,
  audioBlob,
  duration,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: AudioConfirmationModalProps) {
  const { t } = useTranslation();

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Audio icon */}
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-brand-600 dark:text-brand-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-semibold text-gray-900 dark:text-white">
          {t("topics.audioRecorded", "Audio recorded")}
        </h2>
        <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {t(
            "topics.audioConfirmationMessage",
            "Your recording is ready. Do you want to send it for scoring or record again?"
          )}
        </p>

        {/* Audio info */}
        {audioBlob && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/60">
            <div className="space-y-2 text-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t("topics.recordingTime", "Recording time")}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                  {formatTime(duration)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t("topics.fileSize", "File size")}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatFileSize(audioBlob.size)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t("topics.recordAgain", "Record again")}
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={onConfirm}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {t("topics.sendForScoring", "Send for scoring")}
          </Button>
        </div>
      </div>
    </div>
  );
}












