"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  useGetTopicByIdQuery,
  useGetQuestionsQuery,
  useGenerateOutlineForQuestionMutation,
} from "@/store/api/contentApi";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import { isFetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useRef, useState } from "react";

type TopicDetailProps = {
  topicId: string;
};

const partLabels: Record<number, string> = {
  1: "Part 1: Introduction & Interview",
  2: "Part 2: Long Turn",
  3: "Part 3: Discussion",
};

const difficultyColors: Record<string, string> = {
  beginner:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  intermediate:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  advanced:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const normalizeSuggestedStructure = (value?: string | null): string[] => {
  if (!value) return [];

  let v = value.trim();

  // Some data comes double-quoted with escaped newlines, e.g.
  // "\"Intro \\n Detail \\n Personal connection\""
  if (v.startsWith('"') && v.endsWith('"')) {
    v = v.slice(1, -1);
  }

  // Replace escaped newlines with real ones
  v = v.replace(/\\n/g, "\n");

  return v
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

export default function TopicDetail({ topicId }: TopicDetailProps) {
  const {
    data: topic,
    isLoading: isTopicLoading,
    error: topicError,
  } = useGetTopicByIdQuery(topicId);

  const {
    data: questions,
    isLoading: isQuestionsLoading,
    error: questionsError,
  } = useGetQuestionsQuery({ topicId, includeInactive: false });

  const isLoading = isTopicLoading || isQuestionsLoading;

  const hasError = topicError || questionsError;

  const errorMessage = useMemo(() => {
    const error = topicError ?? questionsError;
    if (!error) return null;
    if (isFetchBaseQueryError(error)) {
      if (error.status === "FETCH_ERROR") {
        return "Unable to connect to the server. Please check that the API is running.";
      }
      return `Request failed with status ${error.status}`;
    }
    return "Something went wrong while loading the topic.";
  }, [topicError, questionsError]);

  const totalQuestions = questions?.length ?? 0;

  const aggregatedStats = useMemo(() => {
    if (!questions || questions.length === 0) {
      return {
        totalAttempts: 0,
        avgScore: null as number | null,
        avgTimeLimit: null as number | null,
      };
    }

    const totalAttempts = questions.reduce(
      (sum, q) => sum + (q.attemptsCount ?? 0),
      0
    );

    const scores = questions
      .map((q) => q.avgScore)
      .filter((s): s is number => typeof s === "number");

    const avgScore =
      scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : null;

    const timeLimits = questions
      .map((q) => q.timeLimitSeconds)
      .filter((t) => typeof t === "number" && !Number.isNaN(t));

    const avgTimeLimit =
      timeLimits.length > 0
        ? Math.round(
            timeLimits.reduce((sum, t) => sum + t, 0) / timeLimits.length
          )
        : null;

    return {
      totalAttempts,
      avgScore,
      avgTimeLimit,
    };
  }, [questions]);

  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [answerTextByQuestion, setAnswerTextByQuestion] = useState<Record<string, string>>(
    {}
  );
  const [outlineByQuestion, setOutlineByQuestion] = useState<Record<string, string>>({});
  const [isScoringByQuestion, setIsScoringByQuestion] = useState<Record<string, boolean>>(
    {}
  );
  const [scoreResultByQuestion, setScoreResultByQuestion] = useState<
    Record<
      string,
      | {
          bandScore: number;
          pronunciationScore?: number;
          grammarScore?: number;
          vocabularyScore?: number;
          fluencyScore?: number;
          overallFeedback?: string;
        }
      | null
    >
  >({});

  const [isRecordingByQuestion, setIsRecordingByQuestion] = useState<
    Record<string, boolean>
  >({});
  const [recordingErrorByQuestion, setRecordingErrorByQuestion] = useState<
    Record<string, string | null>
  >({});

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [generateOutline, { isLoading: isGeneratingOutline }] =
    useGenerateOutlineForQuestionMutation();

  const handleToggleQuestion = (questionId: string) => {
    setExpandedQuestionId((current) => (current === questionId ? null : questionId));
  };

  const handleGenerateOutline = async (questionId: string) => {
    try {
      const outline = await generateOutline({
        questionId,
        userLevel: topic?.difficultyLevel ?? "intermediate",
        detailLevel: "medium",
      }).unwrap();

      const formatted =
        [
          outline.outline.introduction && `Introduction: ${outline.outline.introduction}`,
          ...outline.outline.mainPoints.map(
            (p, index) =>
              `Main point ${index + 1}: ${p.point}${
                p.details ? ` – ${p.details}` : ""
              }`
          ),
          outline.outline.conclusion && `Conclusion: ${outline.outline.conclusion}`,
        ]
          .filter(Boolean)
          .join("\n") || "No outline generated.";

      setOutlineByQuestion((prev) => ({
        ...prev,
        [questionId]: formatted,
      }));
    } catch (error) {
      setOutlineByQuestion((prev) => ({
        ...prev,
        [questionId]:
          "Unable to generate outline at the moment. Please try again in a few seconds.",
      }));
    }
  };

  const handleScoreAnswer = async (questionId: string) => {
    const text = answerTextByQuestion[questionId]?.trim();
    if (!text) return;

    try {
      setIsScoringByQuestion((prev) => ({ ...prev, [questionId]: true }));

      const response = await fetch("http://localhost:11434/api/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcription: text,
          topic: topic?.title ?? "General",
          level: topic?.difficultyLevel ?? "intermediate",
        }),
      });

      if (!response.ok) {
        throw new Error(`Scoring request failed with status ${response.status}`);
      }

      const result = (await response.json()) as {
        bandScore: number;
        pronunciationScore?: number;
        grammarScore?: number;
        vocabularyScore?: number;
        fluencyScore?: number;
        overallFeedback?: string;
      };

      setScoreResultByQuestion((prev) => ({
        ...prev,
        [questionId]: result,
      }));
    } catch {
      setScoreResultByQuestion((prev) => ({
        ...prev,
        [questionId]: {
          bandScore: 0,
          overallFeedback:
            "Unable to score your answer right now. Please ensure the Llama scoring service is running.",
        },
      }));
    } finally {
      setIsScoringByQuestion((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  };

  const handleStartRecording = (questionId: string) => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor =
      (window as Window & { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setRecordingErrorByQuestion((prev) => ({
        ...prev,
        [questionId]:
          "Speech recognition is not supported in this browser. Please use Chrome on desktop.",
      }));
      return;
    }

    try {
      // Stop any existing recording first
      stopRecording();

      const recognition = new SpeechRecognitionCtor();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i += 1) {
          transcript += event.results[i][0].transcript;
        }
        setAnswerTextByQuestion((prev) => ({
          ...prev,
          [questionId]: transcript,
        }));
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const message =
          event.error === "not-allowed" || event.error === "permission-denied"
            ? "Microphone access was denied. Please allow access and try again."
            : "Speech recognition error. Please try again.";
        setRecordingErrorByQuestion((prev) => ({
          ...prev,
          [questionId]: message,
        }));
        setIsRecordingByQuestion((prev) => ({
          ...prev,
          [questionId]: false,
        }));
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecordingByQuestion((prev) => ({
          ...prev,
          [questionId]: false,
        }));
        stopRecording();
      };

      recognitionRef.current = recognition;
      recognition.start();

      setRecordingErrorByQuestion((prev) => ({
        ...prev,
        [questionId]: null,
      }));
      setIsRecordingByQuestion((prev) => ({
        ...prev,
        [questionId]: true,
      }));
    } catch {
      setRecordingErrorByQuestion((prev) => ({
        ...prev,
        [questionId]: "Unable to start recording. Please try again.",
      }));
      setIsRecordingByQuestion((prev) => ({
        ...prev,
        [questionId]: false,
      }));
      stopRecording();
    }
  };

  const handleToggleRecording = (questionId: string) => {
    const isRecording = isRecordingByQuestion[questionId];
    if (isRecording) {
      stopRecording();
      setIsRecordingByQuestion((prev) => ({
        ...prev,
        [questionId]: false,
      }));
    } else {
      handleStartRecording(questionId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-800 mb-2" />
            <div className="h-4 w-72 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="h-10 w-32 rounded bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:col-span-2">
            <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-800 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800"
                />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-800 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-4 rounded bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!topic && !isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
          We can’t seem to find the page you are looking for!
        </h1>
        <p className="mb-6 max-w-md text-sm text-gray-600 dark:text-gray-400">
          The topic might have been deleted, or the link you followed may be
          incorrect.
        </p>
        <Link href="/topics">
          <Button>Back to Topics</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/topics"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeftIcon className="mr-1 h-4 w-4" />
            Back to topics
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {topic?.title ?? "Topic"}
          </h1>
          {topic?.description && (
            <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              {topic.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {topic?.partNumber && (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                {partLabels[topic.partNumber] ??
                  `Part ${topic.partNumber.toString()}`}
              </span>
            )}
            {topic?.difficultyLevel && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  difficultyColors[
                    topic.difficultyLevel.toLowerCase() as keyof typeof difficultyColors
                  ] ??
                  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {topic.difficultyLevel}
              </span>
            )}
            {topic?.topicCategory && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {topic.topicCategory}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {topic?.avgUserRating && (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span>Average Rating</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-lg font-semibold text-gray-900 dark:text-white">
                <span>★</span>
                <span>{topic.avgUserRating.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasError && errorMessage && (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-800 dark:border-error-900 dark:bg-error-900/30 dark:text-error-300">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[2fr,minmax(260px,1fr)]">
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Questions in this topic
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {totalQuestions} question
                {totalQuestions !== 1 ? "s" : ""}
              </span>
            </div>

            {totalQuestions === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This topic doesn&apos;t have any questions yet.
              </p>
            ) : (
              <div className="space-y-4">
                {questions!.map((question) => {
                  const structureLines = normalizeSuggestedStructure(
                    question.suggestedStructure
                  );
                  const isExpanded = expandedQuestionId === question.id;
                  const answerText = answerTextByQuestion[question.id] ?? "";
                  const outlineText = outlineByQuestion[question.id];
                  const scoreResult = scoreResultByQuestion[question.id];
                  const isScoring = isScoringByQuestion[question.id] ?? false;
                  const isRecording = isRecordingByQuestion[question.id] ?? false;
                  const recordingError = recordingErrorByQuestion[question.id] ?? null;

                  return (
                    <div
                      key={question.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm shadow-sm transition hover:border-brand-400 hover:bg-white dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-brand-500"
                      onClick={() => handleToggleQuestion(question.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {question.questionText}
                        </p>
                        {question.questionType && (
                          <span className="whitespace-nowrap rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {question.questionType}
                          </span>
                        )}
                      </div>

                      {structureLines.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Suggested structure
                          </p>
                          <ul className="ml-4 list-disc space-y-1 text-xs text-gray-700 dark:text-gray-300">
                            {structureLines.map((line, index) => (
                              <li key={index}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {question.keyVocabulary &&
                        question.keyVocabulary.length > 0 && (
                          <div className="mt-3">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Key vocabulary
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {question.keyVocabulary.map((word) => (
                                <span
                                  key={word}
                                  className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                                >
                                  {word}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                        <span>
                          Time limit:{" "}
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {question.timeLimitSeconds}s
                          </span>
                        </span>
                        <span>
                          Attempts:{" "}
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {question.attemptsCount}
                          </span>
                        </span>
                        {typeof question.avgScore === "number" && (
                          <span>
                            Avg score:{" "}
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {question.avgScore.toFixed(1)}
                            </span>
                          </span>
                        )}
                      </div>

                      {isExpanded && (
                        <div
                          className="mt-4 space-y-3 border-t border-dashed border-gray-200 pt-3 dark:border-gray-700"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isGeneratingOutline}
                              onClick={() => handleGenerateOutline(question.id)}
                            >
                              {isGeneratingOutline
                                ? "Generating outline..."
                                : "Suggest outline"}
                            </Button>
                            {/* Placeholder for future sample-answer endpoint */}
                          </div>

                          {outlineText && (
                            <div className="rounded-lg border border-brand-100 bg-brand-50/60 p-3 text-xs text-gray-800 dark:border-brand-900/40 dark:bg-brand-900/20 dark:text-gray-100">
                              <p className="mb-1 font-semibold text-brand-800 dark:text-brand-200">
                                Suggested outline
                              </p>
                              <pre className="whitespace-pre-wrap text-[11px] leading-relaxed">
                                {outlineText}
                              </pre>
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="mb-1 flex items-center justify-between gap-3">
                              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Your answer
                              </label>
                              <button
                                type="button"
                                onClick={() => handleToggleRecording(question.id)}
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                                  isRecording
                                    ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200"
                                    : "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isRecording ? "bg-rose-500" : "bg-brand-500"
                                  }`}
                                />
                                {isRecording ? "Stop recording" : "Record answer"}
                              </button>
                            </div>
                            <textarea
                              className="min-h-[120px] w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-900 outline-none ring-brand-200 focus:border-brand-500 focus:ring-2 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                              placeholder="Type or paste your answer here..."
                              value={answerText}
                              onChange={(event) =>
                                setAnswerTextByQuestion((prev) => ({
                                  ...prev,
                                  [question.id]: event.target.value,
                                }))
                              }
                            />
                            {recordingError && (
                              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                                {recordingError}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={!answerText.trim() || isScoring}
                              isLoading={isScoring}
                              onClick={() => handleScoreAnswer(question.id)}
                            >
                              Submit for scoring
                            </Button>
                            {scoreResult && (
                              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                                Band score:{" "}
                                <span className="font-semibold">
                                  {scoreResult.bandScore.toFixed(1)}
                                </span>
                              </span>
                            )}
                          </div>

                          {scoreResult?.overallFeedback && (
                            <div className="rounded-lg border border-gray-200 bg-gray-100 p-3 text-[11px] text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                              <p className="mb-1 font-semibold">Feedback</p>
                              <p>{scoreResult.overallFeedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
              Topic overview
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-gray-500 dark:text-gray-400">
                  Total questions
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {totalQuestions}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-500 dark:text-gray-400">
                  Total attempts
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {aggregatedStats.totalAttempts}
                </dd>
              </div>
              {aggregatedStats.avgScore !== null && (
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">
                    Average score
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {aggregatedStats.avgScore.toFixed(1)}
                  </dd>
                </div>
              )}
              {aggregatedStats.avgTimeLimit !== null && (
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">
                    Avg. time limit
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {aggregatedStats.avgTimeLimit}s
                  </dd>
                </div>
              )}
              {topic?.keywords && topic.keywords.length > 0 && (
                <div>
                  <dt className="mb-1 text-gray-500 dark:text-gray-400">
                    Topic keywords
                  </dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {topic.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}


