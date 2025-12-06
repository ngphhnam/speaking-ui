"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type RecordingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function RecordingModal({ isOpen, onClose }: RecordingModalProps) {
  const { t } = useTranslation();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        {/* Compact Recording Indicator */}
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-white px-4 py-3 shadow-2xl dark:border-rose-800 dark:bg-gray-900">
          {/* Recording Icon with Pulse */}
          <div className="relative flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-rose-500 animate-pulse flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />
          </div>

          {/* Timer and Info */}
          <div className="flex flex-col min-w-[120px]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                {t("topics.recordingModalTitle", "Recording")}
              </span>
              <span className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                {formatTime(seconds)}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              {t("topics.recordingModalSubtitle", "Tap to end")}
            </p>
          </div>

          {/* End Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {t("topics.endRecording", "End")}
          </button>
        </div>
      </div>
    </div>
  );
}


