"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import {
  MockTestQuestionDto,
  useCompleteMockTestMutation,
  useGetMockTestByIdQuery,
  useSubmitPartMutation,
  useSubmitQuestionMutation,
} from "@/store/api/mockTestApi";
import { useSubmitMockTestAnswerMutation } from "@/store/api/answerApi";
import {
  StructureItem,
  VocabularyItem,
  useGenerateAnswerMutation,
  useGenerateStructuresMutation,
  useGenerateVocabularyMutation,
} from "@/store/api/generateApi";
import { useSaveGeneratedVocabularyMutation } from "@/store/api/userVocabularyApi";
import { getErrorMessage } from "@/utils/errorHandler";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";

type RecordingState = "idle" | "recording" | "recorded" | "uploading" | "submitted";
type AnswerSubmitStatus = "idle" | "uploading" | "submitted" | "failed";
type GenerateModalType = "answer" | "structures" | "vocabulary";

const PART2_PREP_SECONDS = 60;
const storageKeyFor = (mockTestId: string) => `mock-test-runner:${mockTestId}`;

function formatSeconds(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function flattenQuestions(mockTest: {
  part1Questions: MockTestQuestionDto[];
  part2Questions: MockTestQuestionDto[];
  part3Questions: MockTestQuestionDto[];
}) {
  return [
    ...mockTest.part1Questions,
    ...mockTest.part2Questions,
    ...mockTest.part3Questions,
  ];
}

export default function MockTestRunner({ mockTestId }: { mockTestId: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  // Persist immediately to avoid UI jumping back to the first question during refetch/remount.
  // (useEffect persistence can lag behind quick re-renders while background submit triggers cache invalidation)
  const persistProgressNow = (
    base: {
      currentQuestionId: string | null;
      prepSecondsLeft: number;
      isPrepRunning: boolean;
    },
    overrides?: Partial<{
      currentQuestionId: string | null;
      prepSecondsLeft: number;
      isPrepRunning: boolean;
    }>
  ) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        storageKeyFor(mockTestId),
        JSON.stringify({ ...base, ...(overrides ?? {}) })
      );
    } catch {
      // ignore quota errors
    }
  };

  const {
    data: mockTest,
    isLoading,
    error,
    refetch,
  } = useGetMockTestByIdQuery(mockTestId);

  const [submitMockTestAnswer] = useSubmitMockTestAnswerMutation();
  const [submitQuestion] = useSubmitQuestionMutation();
  const [submitPart, { isLoading: isSubmittingPart }] = useSubmitPartMutation();
  const [completeMockTest, { isLoading: isCompleting }] =
    useCompleteMockTestMutation();

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState<number>(PART2_PREP_SECONDS);
  const [isPrepRunning, setIsPrepRunning] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordStartAtRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordedDurationSec, setRecordedDurationSec] = useState<number>(0);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [answerSubmitByQuestion, setAnswerSubmitByQuestion] = useState<
    Record<
      string,
      { status: AnswerSubmitStatus; recordingId?: string; error?: string }
    >
  >({});
  const [answerAudioByQuestion, setAnswerAudioByQuestion] = useState<
    Record<string, Blob | File>
  >({});

  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);

  // Generate content states (per question)
  const [generateModalType, setGenerateModalType] =
    useState<GenerateModalType | null>(null);
  const [modalTargetBand, setModalTargetBand] = useState<number>(7);
  const [modalStructureCount, setModalStructureCount] = useState<number>(5);
  const [modalVocabularyCount, setModalVocabularyCount] = useState<number>(6);
  const [generatedAnswerByQuestion, setGeneratedAnswerByQuestion] = useState<
    Record<string, string>
  >({});
  const [generatedAnswerMetaByQuestion, setGeneratedAnswerMetaByQuestion] =
    useState<Record<string, { band: number }>>({});
  const [generatedStructuresByQuestion, setGeneratedStructuresByQuestion] =
    useState<Record<string, StructureItem[]>>({});
  const [generatedStructuresMetaByQuestion, setGeneratedStructuresMetaByQuestion] =
    useState<Record<string, { band: number; count: number }>>({});
  const [generatedVocabByQuestion, setGeneratedVocabByQuestion] = useState<
    Record<string, VocabularyItem[]>
  >({});
  const [generatedVocabMetaByQuestion, setGeneratedVocabMetaByQuestion] = useState<
    Record<string, { band: number; count: number }>
  >({});

  const [generateAnswer, { isLoading: isGeneratingAnswer }] =
    useGenerateAnswerMutation();
  const [generateStructures, { isLoading: isGeneratingStructures }] =
    useGenerateStructuresMutation();
  const [generateVocabulary, { isLoading: isGeneratingVocabulary }] =
    useGenerateVocabularyMutation();
  const [saveGeneratedVocabulary] = useSaveGeneratedVocabularyMutation();
  const [isSavingVocabByKey, setIsSavingVocabByKey] = useState<Record<string, boolean>>(
    {}
  );
  const [savedVocabByKey, setSavedVocabByKey] = useState<Record<string, boolean>>(
    {}
  );

  const openGenerateModal = (type: GenerateModalType) => {
    setGenerateModalType(type);
  };

  const closeGenerateModal = () => {
    setGenerateModalType(null);
  };

  const handleConfirmGenerate = async () => {
    if (!generateModalType || !currentQuestion) return;
    try {
      const partNumber =
        currentQuestion.questionType === "PART1"
          ? 1
          : currentQuestion.questionType === "PART2"
          ? 2
          : 3;

      if (generateModalType === "answer") {
        const res = await generateAnswer({
          question: currentQuestion.questionText,
          partNumber,
          targetBand: modalTargetBand,
        }).unwrap();
        setGeneratedAnswerByQuestion((prev) => ({
          ...prev,
          [currentQuestion.id]: res.answer,
        }));
        setGeneratedAnswerMetaByQuestion((prev) => ({
          ...prev,
          [currentQuestion.id]: { band: modalTargetBand },
        }));
      }

      if (generateModalType === "structures") {
        const res = await generateStructures({
          question: currentQuestion.questionText,
          partNumber,
          targetBand: modalTargetBand,
          count: modalStructureCount,
        }).unwrap();
        setGeneratedStructuresByQuestion((prev) => ({
          ...prev,
          [currentQuestion.id]: res.structures ?? [],
        }));
        setGeneratedStructuresMetaByQuestion((prev) => ({
          ...prev,
          [currentQuestion.id]: { band: modalTargetBand, count: modalStructureCount },
        }));
      }

      if (generateModalType === "vocabulary") {
        const res = await generateVocabulary({
          question: currentQuestion.questionText,
          targetBand: modalTargetBand,
          count: modalVocabularyCount,
        }).unwrap();
        setGeneratedVocabByQuestion((prev) => ({
          ...prev,
          [currentQuestion.id]: res.vocabulary ?? [],
        }));
        setGeneratedVocabMetaByQuestion((prev) => ({
          ...prev,
          [currentQuestion.id]: { band: modalTargetBand, count: modalVocabularyCount },
        }));
      }
    } catch (e) {
      setSubmissionError(
        getErrorMessage(
          e,
          t,
          t(
            "mockTest.unableToGenerate",
            "Không thể generate nội dung lúc này. Vui lòng thử lại."
          )
        )
      );
    } finally {
      closeGenerateModal();
    }
  };

  const allQuestions = useMemo(() => {
    if (!mockTest) return [];
    return flattenQuestions(mockTest);
  }, [mockTest]);

  const currentQuestion = useMemo(() => {
    if (!currentQuestionId) return null;
    return allQuestions.find((q) => q.id === currentQuestionId) ?? null;
  }, [allQuestions, currentQuestionId]);

  const answeredSet = useMemo(() => {
    const ids = new Set<string>();
    (mockTest?.answeredQuestionIds ?? []).forEach((id: string) => ids.add(id));
    Object.entries(answerSubmitByQuestion).forEach(([id, v]) => {
      if (v.status === "uploading" || v.status === "submitted") ids.add(id);
    });
    return ids;
  }, [mockTest?.answeredQuestionIds, answerSubmitByQuestion]);

  const nextUnanswered = useMemo(() => {
    for (const q of allQuestions) {
      if (!answeredSet.has(q.id)) return q;
    }
    return null;
  }, [allQuestions, answeredSet]);

  // Restore progress from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKeyFor(mockTestId));
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        currentQuestionId?: string | null;
        prepSecondsLeft?: number;
        isPrepRunning?: boolean;
      };

      if (typeof parsed.currentQuestionId === "string") {
        setCurrentQuestionId(parsed.currentQuestionId);
      }
      if (typeof parsed.prepSecondsLeft === "number") {
        setPrepSecondsLeft(parsed.prepSecondsLeft);
      }
      if (typeof parsed.isPrepRunning === "boolean") {
        setIsPrepRunning(parsed.isPrepRunning);
      }
    } catch {
      // ignore corrupted storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockTestId]);

  // Persist progress to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        storageKeyFor(mockTestId),
        JSON.stringify({
          currentQuestionId,
          prepSecondsLeft,
          isPrepRunning,
        })
      );
    } catch {
      // ignore quota errors
    }
  }, [mockTestId, currentQuestionId, prepSecondsLeft, isPrepRunning]);

  // Initialize current question (or resume after refresh)
  useEffect(() => {
    if (!mockTest || allQuestions.length === 0) return;

    if (mockTest.status === "completed") {
      router.replace(`/mock-test/${mockTestId}/results`);
      return;
    }

    // If backend already says all questions answered but test not completed yet,
    // we should finalize instead of looping back to the first question.
    if (!nextUnanswered && (mockTest.answeredQuestionIds?.length ?? 0) >= allQuestions.length) {
      // keep currentQuestionId stable (prefer last question) and finalize in background
      const lastId = allQuestions[allQuestions.length - 1]?.id ?? null;
      setCurrentQuestionId(lastId);
      persistProgressNow(
        { currentQuestionId, prepSecondsLeft, isPrepRunning },
        { currentQuestionId: lastId }
      );
      finalizeMockTestInBackground();
      return;
    }

    if (!currentQuestionId) {
      const nextId = nextUnanswered?.id ?? allQuestions[0]?.id ?? null;
      setCurrentQuestionId(nextId);
      persistProgressNow(
        { currentQuestionId, prepSecondsLeft, isPrepRunning },
        { currentQuestionId: nextId }
      );
    }
  }, [
    mockTest,
    allQuestions.length,
    currentQuestionId,
    nextUnanswered,
    router,
    mockTestId,
  ]);

  // Validate restored currentQuestionId after questions arrive
  useEffect(() => {
    if (!mockTest || allQuestions.length === 0) return;
    if (!currentQuestionId) return;
    const exists = allQuestions.some((q) => q.id === currentQuestionId);
    if (!exists) {
      const nextId = nextUnanswered?.id ?? allQuestions[0]?.id ?? null;
      setCurrentQuestionId(nextId);
      persistProgressNow(
        { currentQuestionId, prepSecondsLeft, isPrepRunning },
        { currentQuestionId: nextId }
      );
    }
  }, [mockTest, allQuestions, currentQuestionId, nextUnanswered]);

  // If currentQuestionId points to a question that is already answered, auto-jump to the first unanswered one.
  // This prevents "answered questions showing again" after refresh / background refetch.
  useEffect(() => {
    if (!mockTest || allQuestions.length === 0) return;
    if (mockTest.status === "completed") return;
    if (!currentQuestionId) return;
    if (isFinalizing) return;
    if (!nextUnanswered) return;

    if (answeredSet.has(currentQuestionId) && nextUnanswered.id !== currentQuestionId) {
      setCurrentQuestionId(nextUnanswered.id);
      persistProgressNow(
        { currentQuestionId, prepSecondsLeft, isPrepRunning },
        { currentQuestionId: nextUnanswered.id }
      );
    }
  }, [
    mockTest,
    allQuestions.length,
    currentQuestionId,
    answeredSet,
    nextUnanswered,
    isFinalizing,
    prepSecondsLeft,
    isPrepRunning,
  ]);

  // Part 2 preparation timer
  useEffect(() => {
    if (!currentQuestion) return;
    if (currentQuestion.questionType !== "PART2") {
      setIsPrepRunning(false);
      setPrepSecondsLeft(PART2_PREP_SECONDS);
      return;
    }

    if (!isPrepRunning) return;

    const id = window.setInterval(() => {
      setPrepSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [currentQuestion, isPrepRunning]);

  const cleanupRecorder = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupRecorder();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetRecorded = () => {
    setSubmissionError(null);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordedDurationSec(0);
    setRecordingState("idle");
  };

  const advanceToNextQuestion = (fromQuestionId: string) => {
    const idx = allQuestions.findIndex((q) => q.id === fromQuestionId);
    let next: MockTestQuestionDto | null = null;
    for (let i = idx + 1; i < allQuestions.length; i++) {
      const candidate = allQuestions[i];
      if (!answeredSet.has(candidate.id)) {
        next = candidate;
        break;
      }
    }
    // If this is the last question overall, don't move to null (which causes re-init loop).
    if (!next) {
      const nextId = nextUnanswered?.id ?? fromQuestionId;
      setCurrentQuestionId(nextId);
      persistProgressNow(
        { currentQuestionId, prepSecondsLeft, isPrepRunning },
        { currentQuestionId: nextId }
      );
      resetRecorded();
      return;
    }

    setCurrentQuestionId(next.id);
    persistProgressNow(
      { currentQuestionId, prepSecondsLeft, isPrepRunning },
      {
        currentQuestionId: next.id,
        prepSecondsLeft: next.questionType === "PART2" ? PART2_PREP_SECONDS : prepSecondsLeft,
        isPrepRunning: next.questionType === "PART2" ? true : isPrepRunning,
      }
    );
    resetRecorded();

    // If entering part 2, reset prep
    if (next?.questionType === "PART2") {
      setPrepSecondsLeft(PART2_PREP_SECONDS);
      setIsPrepRunning(true);
    }
  };

  const submitAnswerInBackground = (questionId: string, audio: Blob | File) => {
    setAnswerAudioByQuestion((prev) => ({ ...prev, [questionId]: audio }));
    setAnswerSubmitByQuestion((prev) => ({
      ...prev,
      [questionId]: { status: "uploading" },
    }));

    submitMockTestAnswer({ mockTestId, questionId, audio })
      .unwrap()
      .then((res) => {
        setAnswerSubmitByQuestion((prev) => ({
          ...prev,
          [questionId]: {
            status: "submitted",
            recordingId: res.recordingId,
          },
        }));

        // Optional progress tracking
        submitQuestion({ mockTestId, questionId }).catch(() => {});
      })
      .catch((e) => {
        setAnswerSubmitByQuestion((prev) => ({
          ...prev,
          [questionId]: {
            status: "failed",
            error: getErrorMessage(
              e,
              t,
              t("mockTest.submitFailed", "Submit thất bại. Vui lòng thử lại.")
            ),
          },
        }));
      });

    // Submit part in background when finishing a part (don't block UI)
    if (isLastInPartById(questionId)) {
      const part = partNumberForQuestionId(questionId);
      submitPart({ mockTestId, part }).catch(() => {});
    }

    // Finalize in background when finishing the last question overall
    if (isLastOverallById(questionId)) {
      finalizeMockTestInBackground();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (same intent as TopicDetail)
    const validAudioTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/webm",
      "audio/ogg",
      "audio/m4a",
      "audio/aac",
    ];
    if (
      !validAudioTypes.includes(file.type) &&
      !file.name.match(/\.(mp3|wav|webm|ogg|m4a|aac)$/i)
    ) {
      setSubmissionError(
        t(
          "mockTest.invalidAudioFile",
          "File audio không hợp lệ. Vui lòng upload MP3, WAV, WebM, OGG, M4A, hoặc AAC."
        )
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      resetRecorded();
      cleanupRecorder();

      const url = URL.createObjectURL(file);
      setAudioBlob(file);
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setRecordingState("recorded");
      setRecordedDurationSec(0);
      setSubmissionError(null);

      // Auto-submit in background and immediately advance
      if (currentQuestion) {
        submitAnswerInBackground(currentQuestion.id, file);
        advanceToNextQuestion(currentQuestion.id);
      }
    } catch (err) {
      setSubmissionError(
        getErrorMessage(
          err,
          t,
          t("mockTest.uploadError", "Upload audio thất bại. Vui lòng thử lại.")
        )
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startRecording = async () => {
    if (!currentQuestion) return;
    if (recordingState === "recording") return;
    setSubmissionError(null);

    try {
      // Part 2: require prep to finish
      if (currentQuestion.questionType === "PART2" && prepSecondsLeft > 0) {
        setIsPrepRunning(true);
        return;
      }

      resetRecorded();
      cleanupRecorder();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recordStartAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm;codecs=opus",
        });
        const duration = Math.floor((Date.now() - recordStartAtRef.current) / 1000);
        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setRecordedDurationSec(duration);
        setRecordingState("recorded");

        // release mic
        cleanupRecorder();

        // Auto-submit in background and immediately advance
        submitAnswerInBackground(currentQuestion.id, blob);
        advanceToNextQuestion(currentQuestion.id);
      };

      recorder.onerror = () => {
        setSubmissionError(
          t("mockTest.recordingError", "Có lỗi khi ghi âm. Vui lòng thử lại.")
        );
        setRecordingState("idle");
        cleanupRecorder();
      };

      recorder.start();
      setRecordingState("recording");
    } catch (e) {
      setSubmissionError(
        getErrorMessage(
          e,
          t,
          t("mockTest.micDenied", "Không thể truy cập micro. Vui lòng cấp quyền.")
        )
      );
      setRecordingState("idle");
      cleanupRecorder();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const currentIndex = useMemo(() => {
    if (!currentQuestion) return 0;
    return Math.max(0, allQuestions.findIndex((q) => q.id === currentQuestion.id));
  }, [allQuestions, currentQuestion]);

  const totalQuestions = allQuestions.length;

  const partOfCurrent = currentQuestion?.questionType ?? "PART1";
  const answeredCount = answeredSet.size;

  const isAllAnswered = totalQuestions > 0 && answeredCount >= totalQuestions;

  const getPartNumber = (qt: MockTestQuestionDto["questionType"]) =>
    qt === "PART1" ? 1 : qt === "PART2" ? 2 : 3;

  const isLastQuestionInPart = useMemo(() => {
    if (!currentQuestion) return false;
    const idx = allQuestions.findIndex((q) => q.id === currentQuestion.id);
    const next = allQuestions[idx + 1];
    return !next || next.questionType !== currentQuestion.questionType;
  }, [allQuestions, currentQuestion]);

  const isLastQuestionOverall = useMemo(() => {
    if (!currentQuestion) return false;
    return allQuestions[allQuestions.length - 1]?.id === currentQuestion.id;
  }, [allQuestions, currentQuestion]);

  // NOTE: We no longer block UI on submit; submissions run in background.

  const partNumberForQuestionId = (questionId: string): 1 | 2 | 3 => {
    const q = allQuestions.find((x) => x.id === questionId);
    if (!q) return 1;
    return q.questionType === "PART1" ? 1 : q.questionType === "PART2" ? 2 : 3;
  };

  const isLastInPartById = (questionId: string) => {
    const idx = allQuestions.findIndex((q) => q.id === questionId);
    if (idx < 0) return false;
    const next = allQuestions[idx + 1];
    return !next || next.questionType !== allQuestions[idx].questionType;
  };

  const isLastOverallById = (questionId: string) =>
    allQuestions[allQuestions.length - 1]?.id === questionId;

  const finalizeMockTestInBackground = async () => {
    if (isFinalizing) return;
    setIsFinalizing(true);
    setFinalizeError(null);
    try {
      // Always submit part 3 then complete (backend decides readiness)
      await submitPart({ mockTestId, part: 3 }).unwrap();
      await completeMockTest(mockTestId).unwrap();
      try {
        window.localStorage.removeItem(storageKeyFor(mockTestId));
      } catch {
        // ignore
      }
      router.replace(`/mock-test/${mockTestId}/results`);
    } catch (e) {
      setFinalizeError(
        getErrorMessage(
          e,
          t,
          t("mockTest.completeFailed", "Không thể hoàn tất bài thi. Vui lòng thử lại.")
        )
      );
      setIsFinalizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-gray-500">
        {t("mockTest.loading", "Đang tải mock test...")}
      </div>
    );
  }

  if (error || !mockTest) {
    return (
      <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
        <div className="font-semibold">
          {t("mockTest.loadFailedTitle", "Không thể tải mock test")}
        </div>
        <div>{getErrorMessage(error, t)}</div>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
        >
          {t("common.retry", "Thử lại")}
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
        {isAllAnswered ? (
          <div className="space-y-3">
            <div className="font-semibold text-gray-900 dark:text-white">
              {t("mockTest.finalizingTitle", "Đang hoàn tất Mock Test...")}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {t(
                "mockTest.finalizingDesc",
                "Bạn đã trả lời hết câu hỏi. Hệ thống đang tổng hợp và hoàn tất bài thi."
              )}
            </div>
            {finalizeError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
                {finalizeError}
              </div>
            ) : null}
            <button
              onClick={() => finalizeMockTestInBackground()}
              className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              {t("mockTest.finishNow", "Hoàn tất ngay")}
            </button>
          </div>
        ) : (
          t("mockTest.noQuestion", "Không tìm thấy câu hỏi.")
        )}
      </div>
    );
  }

  const timeLimit = currentQuestion.timeLimitSeconds ?? 0;
  const canRecord =
    recordingState !== "uploading" &&
    recordingState !== "recording" &&
    !(currentQuestion.questionType === "PART2" && prepSecondsLeft > 0);

  return (
    <div className="space-y-6">
      {/* Generate Options Modal (like Topic practice flow) */}
      <Modal
        isOpen={generateModalType !== null}
        onClose={closeGenerateModal}
        className="max-w-[500px] p-6"
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {generateModalType === "answer" &&
            t("mockTest.generateAnswer", "Generate Answer")}
          {generateModalType === "structures" &&
            t("mockTest.generateStructures", "Generate Structures")}
          {generateModalType === "vocabulary" &&
            t("mockTest.generateVocabulary", "Generate Vocabulary")}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("mockTest.targetBand", "Target Band")}
            </label>
            <select
              value={modalTargetBand}
              onChange={(e) => setModalTargetBand(parseFloat(e.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
          </div>

          {generateModalType === "structures" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("mockTest.structureCount", "Structure Count")}
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={modalStructureCount}
                onChange={(e) =>
                  setModalStructureCount(parseInt(e.target.value) || 6)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          ) : null}

          {generateModalType === "vocabulary" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("mockTest.vocabularyCount", "Vocabulary Count")}
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={modalVocabularyCount}
                onChange={(e) =>
                  setModalVocabularyCount(parseInt(e.target.value) || 12)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={closeGenerateModal}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirmGenerate}
            disabled={
              (generateModalType === "answer" && isGeneratingAnswer) ||
              (generateModalType === "structures" && isGeneratingStructures) ||
              (generateModalType === "vocabulary" && isGeneratingVocabulary)
            }
          >
            {t("mockTest.generate", "Generate")}
          </Button>
        </div>
      </Modal>
      <div className="rounded-xl border-2 border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("mockTest.progress", "Tiến độ")}: {answeredCount}/{totalQuestions}
            </div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {t("mockTest.part", "Phần")} {getPartNumber(partOfCurrent)} ·{" "}
              {t("mockTest.question", "Câu")} {currentIndex + 1}/{totalQuestions}
            </div>
          </div>

          <button
            onClick={() => router.push("/mock-test")}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-brand-500 dark:hover:text-brand-400"
          >
            {t("mockTest.backToList", "Quay lại")}
          </button>
        </div>
      </div>

      <div className="rounded-xl border-2 border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              {currentQuestion.questionType}
            </div>
            <h2 className="mt-3 whitespace-pre-wrap text-lg font-semibold text-gray-900 dark:text-white">
              {currentQuestion.questionText}
            </h2>
          </div>

          {timeLimit > 0 ? (
            <div className="flex-shrink-0 rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 dark:bg-gray-950 dark:text-gray-200">
              {t("mockTest.timeLimit", "Time limit")}: {formatSeconds(timeLimit)}
            </div>
          ) : null}
        </div>

        {currentQuestion.questionType === "PART2" ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
            <div className="font-semibold">
              {t("mockTest.part2Prep", "Part 2 - Thời gian chuẩn bị")}
            </div>
            <div className="mt-1">
              {prepSecondsLeft > 0
                ? t("mockTest.prepRemaining", "Còn lại") +
                  `: ${formatSeconds(prepSecondsLeft)}`
                : t("mockTest.prepDone", "Bạn có thể bắt đầu ghi âm.")}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {prepSecondsLeft > 0 ? (
                <button
                  onClick={() => setIsPrepRunning(true)}
                  className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  {isPrepRunning
                    ? t("mockTest.prepRunning", "Đang đếm ngược...")
                    : t("mockTest.startPrep", "Bắt đầu đếm ngược")}
                </button>
              ) : null}
              {prepSecondsLeft > 0 ? (
                <button
                  onClick={() => {
                    setIsPrepRunning(false);
                    setPrepSecondsLeft(0);
                  }}
                  className="rounded-lg border border-amber-300 bg-transparent px-3 py-2 text-sm font-semibold text-amber-800 dark:text-amber-200"
                >
                  {t("mockTest.skipPrep", "Bỏ qua")}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {submissionError ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
            {submissionError}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={recordingState === "recording" ? stopRecording : startRecording}
            disabled={
              isFinalizing ||
              recordingState === "uploading" ||
              (recordingState !== "recording" && !canRecord)
            }
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {recordingState === "recording"
              ? t("mockTest.stop", "Dừng ghi âm")
              : t("mockTest.record", "Ghi âm")}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.webm,.ogg,.m4a,.aac"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isFinalizing || recordingState === "uploading" || recordingState === "recording"}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-brand-500 dark:hover:text-brand-400"
          >
            {t("mockTest.uploadAudio", "Upload audio")}
          </button>

          {recordingState === "recorded" ? (
            <button
              onClick={resetRecorded}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-brand-500 dark:hover:text-brand-400"
            >
              {t("mockTest.reRecord", "Ghi lại")}
            </button>
          ) : null}

          {recordingState === "recorded" ? (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t("mockTest.recordedDuration", "Đã ghi")}{" "}
              {formatSeconds(recordedDurationSec)}
            </div>
          ) : null}

          {recordingState === "submitted" ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
              ✓ {t("mockTest.submitted", "Đã submit")}
            </span>
          ) : null}
        </div>

        {audioUrl ? (
          <div className="mt-4">
            <audio controls src={audioUrl} className="w-full" />
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            {t(
              "mockTest.noScoresYet",
              "Lưu ý: Bạn sẽ KHÔNG thấy điểm ngay khi submit. Điểm chỉ có sau khi hoàn thành Part 3."
            )}
          </div>

          <button
            onClick={() => {
              advanceToNextQuestion(currentQuestion.id);
            }}
            disabled={isFinalizing || isLastQuestionOverall}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-brand-500 dark:hover:text-brand-400"
          >
            {t("mockTest.next", "Câu tiếp theo")}
          </button>
        </div>

        {isFinalizing ? (
          <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800 dark:border-brand-900/40 dark:bg-brand-900/20 dark:text-brand-200">
            <div className="font-semibold">
              {t("mockTest.finalizingInline", "Đang hoàn tất bài thi...")}
            </div>
            <div className="mt-1 text-xs">
              {t(
                "mockTest.finalizingInlineDesc",
                "Bạn đã trả lời hết. Hệ thống đang submit part và complete ở nền."
              )}
            </div>
            {finalizeError ? (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs">{finalizeError}</div>
                <button
                  onClick={() => finalizeMockTestInBackground()}
                  className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  {t("common.retry", "Thử lại")}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Background submission status */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-semibold text-gray-900 dark:text-white">
            {t("mockTest.bgUploadTitle", "Trạng thái upload")}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {t("mockTest.bgUploadHint", "Bạn có thể làm câu tiếp theo trong khi hệ thống upload ngầm.")}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            Uploading:{" "}
            {Object.values(answerSubmitByQuestion).filter((v) => v.status === "uploading").length}
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
            Submitted:{" "}
            {Object.values(answerSubmitByQuestion).filter((v) => v.status === "submitted").length}
          </span>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-rose-900/30 dark:text-rose-200">
            Failed:{" "}
            {Object.values(answerSubmitByQuestion).filter((v) => v.status === "failed").length}
          </span>
        </div>

        {Object.entries(answerSubmitByQuestion).some(([, v]) => v.status === "failed") ? (
          <div className="mt-3 space-y-2">
            {Object.entries(answerSubmitByQuestion)
              .filter(([, v]) => v.status === "failed")
              .map(([qid, v]) => (
                <div
                  key={qid}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200"
                >
                  <div className="min-w-0">
                    <div className="font-semibold">
                      {t("mockTest.question", "Câu")} #{qid.slice(0, 6)}
                    </div>
                    <div className="mt-1">{v.error ?? "Failed"}</div>
                  </div>
                  <button
                    onClick={() => {
                      const audio = answerAudioByQuestion[qid];
                      if (audio) submitAnswerInBackground(qid, audio);
                    }}
                    className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    {t("common.retry", "Thử lại")}
                  </button>
                </div>
              ))}
          </div>
        ) : null}
      </div>

      {/* Generate + sample + vocab */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("mockTest.generateTitle", "Generate & Sample")}
          </h3>
        </div>

        {currentQuestion.keyVocabulary && currentQuestion.keyVocabulary.length > 0 ? (
          <div className="mt-4">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("mockTest.keyVocabulary", "Key vocabulary")}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {currentQuestion.keyVocabulary.map((w) => (
                <span
                  key={w}
                  className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => openGenerateModal("answer")}
            disabled={isGeneratingAnswer}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGeneratingAnswer
              ? t("mockTest.generating", "Đang generate...")
              : t("mockTest.generateAnswer", "Generate Answer")}
          </Button>

          <Button
            variant="outline"
            onClick={() => openGenerateModal("structures")}
            disabled={isGeneratingStructures}
          >
            {isGeneratingStructures
              ? t("mockTest.generating", "Đang generate...")
              : t("mockTest.generateStructures", "Generate Structures")}
          </Button>

          <Button
            variant="outline"
            onClick={() => openGenerateModal("vocabulary")}
            disabled={isGeneratingVocabulary}
          >
            {isGeneratingVocabulary
              ? t("mockTest.generating", "Đang generate...")
              : t("mockTest.generateVocabulary", "Generate Vocabulary")}
          </Button>
        </div>

        {/* Generated outputs */}
        {generatedAnswerByQuestion[currentQuestion.id] ? (
          <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-950">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("mockTest.generatedSampleAnswer", "Generated Sample Answer")} (Band{" "}
              {generatedAnswerMetaByQuestion[currentQuestion.id]?.band ?? modalTargetBand})
            </div>
            <div className="mt-2 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
              {generatedAnswerByQuestion[currentQuestion.id]}
            </div>
          </div>
        ) : null}

        {(generatedStructuresByQuestion[currentQuestion.id] ?? []).length > 0 ? (
          <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-950">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("mockTest.generatedStructures", "Generated Structures")} (Band{" "}
              {generatedStructuresMetaByQuestion[currentQuestion.id]?.band ??
                modalTargetBand}
              )
            </div>
            <div className="mt-2 space-y-2">
              {(generatedStructuresByQuestion[currentQuestion.id] ?? []).map((s, idx) => (
                <div key={idx} className="rounded border border-gray-200 bg-white p-3 text-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="font-semibold text-gray-900 dark:text-white">{s.pattern}</div>
                  <div className="mt-1 text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Example:</span> {s.example}
                  </div>
                  <div className="mt-1 text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Usage:</span> {s.usage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {(generatedVocabByQuestion[currentQuestion.id] ?? []).length > 0 ? (
          <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-950">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("mockTest.generatedVocabulary", "Generated Vocabulary")} (Band{" "}
              {generatedVocabMetaByQuestion[currentQuestion.id]?.band ?? modalTargetBand})
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(generatedVocabByQuestion[currentQuestion.id] ?? []).map((v, idx) => (
                <div
                  key={idx}
                  className="rounded border border-gray-200 bg-white p-3 text-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {v.word}
                        </span>
                        {v.pronunciation ? (
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                            {v.pronunciation}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      title={t("common.save", "Lưu")}
                      disabled={
                        isSavingVocabByKey[`${currentQuestion.id}:${v.word}`] ||
                        savedVocabByKey[`${currentQuestion.id}:${v.word}`]
                      }
                      onClick={async () => {
                        const key = `${currentQuestion.id}:${v.word}`;
                        if (!v.word || !v.definition) {
                          alert(
                            t(
                              "mockTest.vocabMissingRequired",
                              "Thiếu word/definition nên chưa lưu được."
                            )
                          );
                          return;
                        }
                        try {
                          setIsSavingVocabByKey((prev) => ({ ...prev, [key]: true }));
                          await saveGeneratedVocabulary({
                            word: v.word,
                            definition: v.definition,
                            example: v.example,
                            pronunciation: v.pronunciation,
                            vietnamese_meaning: v.vietnameseMeaning,
                          }).unwrap();
                          setSavedVocabByKey((prev) => ({ ...prev, [key]: true }));
                        } catch (e) {
                          alert(getErrorMessage(e, t));
                        } finally {
                          setIsSavingVocabByKey((prev) => ({ ...prev, [key]: false }));
                        }
                      }}
                      className="flex-shrink-0 rounded-md bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-600"
                    >
                      {savedVocabByKey[`${currentQuestion.id}:${v.word}`]
                        ? t("common.saved", "Đã lưu")
                        : isSavingVocabByKey[`${currentQuestion.id}:${v.word}`]
                        ? t("common.saving", "Đang lưu...")
                        : t("common.save", "Lưu")}
                    </button>
                  </div>
                  {v.definition ? (
                    <div className="mt-1 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Def:</span> {v.definition}
                    </div>
                  ) : null}
                  {v.example ? (
                    <div className="mt-1 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Ex:</span> {v.example}
                    </div>
                  ) : null}
                  {v.vietnameseMeaning ? (
                    <div className="mt-1 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">VI:</span> {v.vietnameseMeaning}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

