"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

type NoteTakingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStartRecording: () => void;
  questionText?: string;
};

const PREPARATION_TIME_SECONDS = 60; // 1 minute

export default function NoteTakingModal({
  isOpen,
  onClose,
  onStartRecording,
  questionText,
}: NoteTakingModalProps) {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState(PREPARATION_TIME_SECONDS);
  const [notes, setNotes] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && !hasStarted) {
      setTimeRemaining(PREPARATION_TIME_SECONDS);
      setNotes("");
      setHasStarted(true);
      
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            // Auto-start recording when time is up
            setTimeout(() => {
              onStartRecording();
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, hasStarted, onStartRecording]);

  useEffect(() => {
    if (!isOpen) {
      setHasStarted(false);
      setTimeRemaining(PREPARATION_TIME_SECONDS);
      setNotes("");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isOpen]);

  const handleStartEarly = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onStartRecording();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl p-6"
    >
      <div className="space-y-4">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          {t("topics.noteTakingTitle", "Preparing Your Answer - Part 2")}
        </h2>
        {/* Question Display */}
        {questionText && (
          <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-800 dark:bg-brand-900/20">
            <p className="mb-2 text-sm font-semibold text-brand-800 dark:text-brand-200">
              {t("topics.question", "Question")}:
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {questionText}
            </p>
          </div>
        )}

        {/* Countdown Timer */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative">
            <div
              className={`text-6xl font-bold ${
                timeRemaining <= 10
                  ? "text-rose-600 dark:text-rose-400"
                  : timeRemaining <= 30
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-brand-600 dark:text-brand-400"
              } transition-colors duration-300`}
            >
              {formatTime(timeRemaining)}
            </div>
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <div
                className={`h-24 w-24 rounded-full border-4 ${
                  timeRemaining <= 10
                    ? "border-rose-200 dark:border-rose-800"
                    : timeRemaining <= 30
                    ? "border-amber-200 dark:border-amber-800"
                    : "border-brand-200 dark:border-brand-800"
                } animate-pulse`}
              />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {t(
              "topics.preparationTimeRemaining",
              "Time remaining to prepare your notes"
            )}
          </p>
        </div>

        {/* Notes Textarea */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("topics.yourNotes", "Your Notes")} ({t("topics.optional", "optional")}):
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t(
              "topics.notesPlaceholder",
              "Write down key points, vocabulary, or ideas you want to remember..."
            )}
            className="min-h-[200px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            disabled={timeRemaining === 0}
          />
        </div>

        {/* Instructions */}
        <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs dark:border-blue-800 dark:bg-blue-900/20">
          <p className="font-semibold text-blue-800 dark:text-blue-200">
            {t("topics.instructions", "Instructions")}:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-blue-700 dark:text-blue-300">
            <li>
              {t(
                "topics.part2NoteTakingTip1",
                "You have 1 minute to prepare your answer"
              )}
            </li>
            <li>
              {t(
                "topics.part2NoteTakingTip2",
                "Use this time to organize your thoughts and take notes"
              )}
            </li>
            <li>
              {t(
                "topics.part2NoteTakingTip3",
                "Recording will start automatically when time is up, or you can start early"
              )}
            </li>
            <li>
              {t(
                "topics.part2NoteTakingTip4",
                "You should speak for 1-2 minutes about the topic"
              )}
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {t("topics.cancel", "Cancel")}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleStartEarly}
            disabled={timeRemaining === 0}
            className="flex-1 bg-brand-500 text-white hover:bg-brand-600"
          >
            {timeRemaining === 0
              ? t("topics.timeUp", "Time's Up!")
              : t("topics.startRecording", "Start Recording Now")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
