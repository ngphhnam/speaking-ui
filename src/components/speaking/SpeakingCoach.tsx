"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ApiError,
  scoreSpeech,
  ScoreSpeechResponse,
  SpeakingLevel,
} from "@/lib/api/speaking";
import { readSelectedTopic } from "@/store/topics";

const speakingLevels: { value: SpeakingLevel; label: string; helper: string }[] = [
  { value: "beginner", label: "Beginner", helper: "Simple sentence focus" },
  {
    value: "intermediate",
    label: "Intermediate",
    helper: "Balanced vocabulary and structure",
  },
  {
    value: "advanced",
    label: "Advanced",
    helper: "Complex structures and nuance",
  },
];

const SpeakingCoach = () => {
  const [scoreForm, setScoreForm] = useState({
    transcription: "",
    topic: "",
    level: "intermediate" as SpeakingLevel,
  });
  const [scoreResult, setScoreResult] = useState<ScoreSpeechResponse | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const selected = readSelectedTopic();
    if (!selected) return;
    setScoreForm((prev) => ({
      ...prev,
      topic: selected.title || prev.topic,
    }));
  }, []);

  const onScoreSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!scoreForm.transcription.trim()) {
      setScoreError("Please provide a transcription to score.");
      return;
    }
    setScoreError(null);
    setScoreLoading(true);
    try {
      const response = await scoreSpeech({
        transcription: scoreForm.transcription.trim(),
        topic: scoreForm.topic.trim() || undefined,
        level: scoreForm.level,
      });
      setScoreResult(response);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.payload && typeof error.payload === "object"
            ? JSON.stringify(error.payload)
            : error.message
          : "Unable to score response. Please try again.";
      setScoreError(message);
    } finally {
      setScoreLoading(false);
    }
  };

  const handleStartRecording = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as Window & { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecordingError(
        "Speech recognition is not supported in this browser. Please use Chrome on desktop."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setScoreForm((prev) => ({
          ...prev,
          transcription: transcript,
        }));
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setRecordingError(
            "Microphone access was denied. Please allow access and try again."
          );
        } else {
          setRecordingError("Speech recognition error. Please try again.");
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setRecordingError(null);
      setIsRecording(true);
    } catch {
      setRecordingError("Unable to start recording. Please try again.");
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const scoreMetrics = useMemo(() => {
    if (!scoreResult) {
      return [];
    }
    return [
      { label: "Band Score", value: scoreResult.bandScore },
      { label: "Pronunciation", value: scoreResult.pronunciationScore },
      { label: "Grammar", value: scoreResult.grammarScore },
      { label: "Vocabulary", value: scoreResult.vocabularyScore },
      { label: "Fluency", value: scoreResult.fluencyScore },
    ];
  }, [scoreResult]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          Speaking Practice
        </p>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          Real-time IELTS scoring & grammar feedback
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300">
          Answer the question out loud, let the app transcribe your response, and
          send it to the IELTS scoring API for instant feedback.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 space-y-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Score a speaking response
            </h2>
            <p className="text-sm text-gray-500">
              Calls `POST /api/score` from the Llama service.
            </p>
          </div>
          <form className="space-y-4" onSubmit={onScoreSubmit}>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Transcription
                </label>
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${
                    isRecording
                      ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200"
                      : "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isRecording ? "bg-rose-500" : "bg-brand-500"
                    }`}
                  />
                  {isRecording ? "Stop recording" : "Record answer"}
                </button>
              </div>
              <textarea
                className="min-h-[180px] w-full rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                value={scoreForm.transcription}
                onChange={(event) =>
                  setScoreForm((prev) => ({
                    ...prev,
                    transcription: event.target.value,
                  }))
                }
                placeholder="Paste your transcribed answer or type manually…"
              />
              {recordingError && (
                <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                  {recordingError}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Topic (optional)
                </label>
                <input
                  type="text"
                  value={scoreForm.topic}
                  onChange={(event) =>
                    setScoreForm((prev) => ({ ...prev, topic: event.target.value }))
                  }
                  placeholder="Education, Travel, Technology…"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Level
                </label>
                <div className="flex gap-2">
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                    value={scoreForm.level}
                    onChange={(event) =>
                      setScoreForm((prev) => ({
                        ...prev,
                        level: event.target.value as SpeakingLevel,
                      }))
                    }
                  >
                    {speakingLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {speakingLevels.find((level) => level.value === scoreForm.level)
                    ?.helper ?? ""}
                </p>
              </div>
            </div>

            {scoreError && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {scoreError}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={scoreLoading}
            >
              {scoreLoading ? "Scoring…" : "Score response"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 space-y-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Scoring breakdown
            </h2>
            <p className="text-sm text-gray-500">
              Displays the JSON payload returned by Llama.
            </p>
          </div>

          {scoreResult ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {scoreMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-950"
                  >
                    <p className="text-sm text-gray-500">{metric.label}</p>
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                      {metric.value.toFixed(1)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
                <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                  Overall feedback
                </p>
                <p>{scoreResult.overallFeedback}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              Run a scoring request to see the breakdown here.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SpeakingCoach;

