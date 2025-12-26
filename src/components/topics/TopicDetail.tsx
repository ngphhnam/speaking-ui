"use client";

import Link from "next/link";
import { useMemo, useEffect } from "react";
import { useGetTopicByIdQuery } from "@/store/api/topicApi";
import {
  useGetQuestionsQuery,
  useGenerateOutlineForQuestionMutation,
} from "@/store/api/questionApi";
import { useSubmitAnswerMutation } from "@/store/api/answerApi";
import {
  useGenerateStructuresMutation,
  useGenerateAnswerMutation,
  useGenerateVocabularyMutation,
  useImproveAnswerMutation,
  type StructureItem,
  type VocabularyItem,
  type ImproveAnswerResponse,
} from "@/store/api/generateApi";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import RecordingModal from "./RecordingModal";
import AudioConfirmationModal from "./AudioConfirmationModal";
import ScoringLoadingModal from "./ScoringLoadingModal";
import RecordingsHistoryModal from "./RecordingsHistoryModal";
import { Modal } from "@/components/ui/modal";
import { useAppSelector } from "@/store/hooks";
import { getErrorMessage, isErrorCode } from "@/utils/errorHandler";

type TopicDetailProps = {
  topicId: string;
  questionPartNumber?: number;
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

export default function TopicDetail({ topicId, questionPartNumber }: TopicDetailProps) {
  const { t } = useTranslation();
  const { accessToken } = useAppSelector((state) => state.auth);
  const {
    data: topic,
    isLoading: isTopicLoading,
    error: topicError,
  } = useGetTopicByIdQuery(topicId);

  const {
    data: questions,
    isLoading: isQuestionsLoading,
    error: questionsError,
  } = useGetQuestionsQuery({
    topicId,
    includeInactive: false,
    partNumber: questionPartNumber,
  });

  const isLoading = isTopicLoading || isQuestionsLoading;

  const hasError = topicError || questionsError;

  const errorMessage = useMemo(() => {
    const error = topicError ?? questionsError;
    if (!error) return null;
    // Check if error is a FetchBaseQueryError-like object
    if (error && typeof error === "object" && "status" in error) {
      const fetchError = error as { status: string | number };
      if (fetchError.status === "FETCH_ERROR") {
        return t("topics.unableToConnect", "Unable to connect to the server. Please check that the API is running.");
      }
      return t("topics.requestFailed", { status: fetchError.status });
    }
    return t("topics.somethingWentWrong", "Something went wrong while loading the topic.");
  }, [topicError, questionsError, t]);

  // Ensure questions is always an array and filter by questionType matching topic's partNumber
  const filteredQuestions = useMemo(() => {
    if (!Array.isArray(questions)) return [];
    
    // If topic doesn't have partNumber, return all questions
    if (!topic?.partNumber) return questions;
    
    // Map partNumber to QuestionType(s)
    // Part 1 → only PART1
    // Part 2 → PART2 and PART3 (Part 3 questions belong to Part 2 topics)
    // Part 3 → only PART3 (if exists as separate topic)
    if (topic.partNumber === 1) {
      return questions.filter((q) => q.questionType === "PART1");
    } else if (topic.partNumber === 2) {
      // Part 2 topics can have both PART2 and PART3 questions
      return questions.filter((q) => q.questionType === "PART2" || q.questionType === "PART3");
    } else if (topic.partNumber === 3) {
      return questions.filter((q) => q.questionType === "PART3");
    }
    
    // Fallback: return all questions
    return questions;
  }, [questions, topic?.partNumber]);

  const questionsArray = filteredQuestions;
  const totalQuestions = questionsArray.length;

  const aggregatedStats = useMemo(() => {
    if (!questionsArray || questionsArray.length === 0) {
      return {
        totalAttempts: 0,
        avgScore: null as number | null,
        avgTimeLimit: null as number | null,
      };
    }

    const totalAttempts = questionsArray.reduce(
      (sum, q) => sum + (q.attemptsCount ?? 0),
      0
    );

    const scores = questionsArray
      .map((q) => q.avgScore)
      .filter((s): s is number => typeof s === "number");

    const avgScore =
      scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : null;

    const timeLimits = questionsArray
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
  }, [questionsArray]);

  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [audioBlobByQuestion, setAudioBlobByQuestion] = useState<Record<string, Blob>>({});
  const [audioUrlByQuestion, setAudioUrlByQuestion] = useState<Record<string, string>>({});
  const [recordingDurationByQuestion, setRecordingDurationByQuestion] = useState<Record<string, number>>({});
  const [outlineByQuestion, setOutlineByQuestion] = useState<Record<string, string>>({});
  const [showSampleAnswersByQuestion, setShowSampleAnswersByQuestion] = useState<Record<string, boolean>>({});
  const [generatedAnswerByQuestion, setGeneratedAnswerByQuestion] = useState<Record<string, string>>({});
  const [generatedStructuresByQuestion, setGeneratedStructuresByQuestion] = useState<Record<string, StructureItem[]>>({});
  const [generatedVocabularyByQuestion, setGeneratedVocabularyByQuestion] = useState<Record<string, VocabularyItem[]>>({});
  const [targetBandByQuestion, setTargetBandByQuestion] = useState<Record<string, number>>({});
  const [structureCountByQuestion, setStructureCountByQuestion] = useState<Record<string, number>>({});
  const [vocabularyCountByQuestion, setVocabularyCountByQuestion] = useState<Record<string, number>>({});
  const [showStructureCountByQuestion, setShowStructureCountByQuestion] = useState<Record<string, boolean>>({});
  const [showVocabularyCountByQuestion, setShowVocabularyCountByQuestion] = useState<Record<string, boolean>>({});
  const [isGeneratingAnswerByQuestion, setIsGeneratingAnswerByQuestion] = useState<Record<string, boolean>>({});
  const [isGeneratingStructuresByQuestion, setIsGeneratingStructuresByQuestion] = useState<Record<string, boolean>>({});
  const [isGeneratingVocabularyByQuestion, setIsGeneratingVocabularyByQuestion] = useState<Record<string, boolean>>({});
  const [generateModalOpen, setGenerateModalOpen] = useState<{ questionId: string; type: "answer" | "structures" | "vocabulary" } | null>(null);
  const [modalTargetBand, setModalTargetBand] = useState<number>(7.0);
  const [modalStructureCount, setModalStructureCount] = useState<number>(6);
  const [modalVocabularyCount, setModalVocabularyCount] = useState<number>(12);
  const [improvedAnswerByQuestion, setImprovedAnswerByQuestion] = useState<Record<string, ImproveAnswerResponse>>({});
  const [isImprovingByQuestion, setIsImprovingByQuestion] = useState<Record<string, boolean>>({});
  const [showImprovedAnswerByQuestion, setShowImprovedAnswerByQuestion] = useState<Record<string, boolean>>({});
  const [isScoringByQuestion, setIsScoringByQuestion] = useState<Record<string, boolean>>(
    {}
  );
  const [scoreResultByQuestion, setScoreResultByQuestion] = useState<
    Record<
      string,
      | {
          recordingId: string;
          analysisResultId: string;
          transcription: string;
          correctedTranscription?: string;
          scores: {
            overallBandScore: number;
            fluencyScore: number;
            vocabularyScore: number;
            grammarScore: number;
            pronunciationScore: number;
          };
          feedback: string;
          grammarReport?: string;
          grammarCorrection?: {
            original: string;
            corrected: string;
            corrections: Array<{
              original: string;
              corrected: string;
              reason: string;
            }>;
            explanation: string;
          };
          sampleAnswers?: string[] | null;
          keyVocabulary?: string[] | null;
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
  const [activeRecordingQuestionId, setActiveRecordingQuestionId] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState<string | null>(null);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [recordingsHistoryModal, setRecordingsHistoryModal] = useState<{
    questionId: string;
    questionText: string;
  } | null>(null);
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false);
  const [limitReachedMessage, setLimitReachedMessage] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceStartTimeRef = useRef<number | null>(null);
  const silenceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [autoPausedReason, setAutoPausedReason] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Create speaking session when topic is loaded
  useEffect(() => {
    if (topic && !sessionCreated && !isTopicLoading) {
      const createSession = async () => {
        try {
          const headers: HeadersInit = {
            "Content-Type": "application/json",
          };
          
          if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
          }

          const response = await fetch("http://localhost:5000/api/session/speaking-session", {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify({
              topicId: topicId,
            }),
          });

          if (response.ok) {
            setSessionCreated(true);
          } else {
            console.error("Failed to create speaking session:", response.status);
          }
        } catch (error) {
          console.error("Error creating speaking session:", error);
        }
      };

      createSession();
    }
  }, [topic, topicId, sessionCreated, isTopicLoading, accessToken]);

  const [generateOutline, { isLoading: isGeneratingOutline }] =
    useGenerateOutlineForQuestionMutation();
  const [submitAnswer, { isLoading: isSubmittingAnswer }] = useSubmitAnswerMutation();
  const [generateStructures] = useGenerateStructuresMutation();
  const [generateAnswer] = useGenerateAnswerMutation();
  const [generateVocabulary] = useGenerateVocabularyMutation();
  const [improveAnswer] = useImproveAnswerMutation();

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
        [questionId]: t("topics.unableToGenerateOutline", "Unable to generate outline at the moment. Please try again in a few seconds."),
      }));
    }
  };

  const openGenerateModal = (questionId: string, type: "answer" | "structures" | "vocabulary") => {
    const currentTargetBand = targetBandByQuestion[questionId] ?? 7.0;
    const currentStructureCount = structureCountByQuestion[questionId] ?? 6;
    const currentVocabularyCount = vocabularyCountByQuestion[questionId] ?? 12;
    
    setModalTargetBand(currentTargetBand);
    setModalStructureCount(currentStructureCount);
    setModalVocabularyCount(currentVocabularyCount);
    setGenerateModalOpen({ questionId, type });
  };

  const closeGenerateModal = () => {
    setGenerateModalOpen(null);
  };

  const handleConfirmGenerate = async () => {
    if (!generateModalOpen) return;

    const { questionId, type } = generateModalOpen;
    const question = questionsArray.find((q) => q.id === questionId);
    if (!question) return;

    // Close modal first
    closeGenerateModal();

    // Update state with modal values
    setTargetBandByQuestion((prev) => ({
      ...prev,
      [questionId]: modalTargetBand,
    }));

    if (type === "structures") {
      setStructureCountByQuestion((prev) => ({
        ...prev,
        [questionId]: modalStructureCount,
      }));
      setShowStructureCountByQuestion((prev) => ({
        ...prev,
        [questionId]: true,
      }));
      await handleGenerateStructures(questionId, question.questionText, modalTargetBand, modalStructureCount);
    } else if (type === "vocabulary") {
      setVocabularyCountByQuestion((prev) => ({
        ...prev,
        [questionId]: modalVocabularyCount,
      }));
      setShowVocabularyCountByQuestion((prev) => ({
        ...prev,
        [questionId]: true,
      }));
      await handleGenerateVocabulary(questionId, question.questionText, modalTargetBand, modalVocabularyCount);
    } else {
      await handleGenerateAnswer(questionId, question.questionText, modalTargetBand);
    }
  };

  const handleGenerateAnswer = async (questionId: string, questionText: string, targetBand: number) => {
    const partNumber = topic?.partNumber ?? 2;

    try {
      setIsGeneratingAnswerByQuestion((prev) => ({ ...prev, [questionId]: true }));
      const result = await generateAnswer({
        question: questionText,
        partNumber,
        targetBand,
      }).unwrap();

      setGeneratedAnswerByQuestion((prev) => ({
        ...prev,
        [questionId]: result.answer,
      }));
    } catch (error) {
      setGeneratedAnswerByQuestion((prev) => ({
        ...prev,
        [questionId]: t("topics.unableToGenerateAnswer", "Unable to generate answer. Please try again."),
      }));
    } finally {
      setIsGeneratingAnswerByQuestion((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleGenerateStructures = async (questionId: string, questionText: string, targetBand: number, count: number) => {
    const partNumber = topic?.partNumber ?? 3;

    try {
      setIsGeneratingStructuresByQuestion((prev) => ({ ...prev, [questionId]: true }));
      const result = await generateStructures({
        question: questionText,
        partNumber,
        targetBand,
        count,
      }).unwrap();

      setGeneratedStructuresByQuestion((prev) => ({
        ...prev,
        [questionId]: result.structures,
      }));
    } catch (error) {
      setGeneratedStructuresByQuestion((prev) => ({
        ...prev,
        [questionId]: [],
      }));
    } finally {
      setIsGeneratingStructuresByQuestion((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleGenerateVocabulary = async (questionId: string, questionText: string, targetBand: number, count: number) => {
    try {
      setIsGeneratingVocabularyByQuestion((prev) => ({ ...prev, [questionId]: true }));
      const result = await generateVocabulary({
        question: questionText,
        targetBand,
        count,
      }).unwrap();

      setGeneratedVocabularyByQuestion((prev) => ({
        ...prev,
        [questionId]: result.vocabulary,
      }));
    } catch (error) {
      setGeneratedVocabularyByQuestion((prev) => ({
        ...prev,
        [questionId]: [],
      }));
    } finally {
      setIsGeneratingVocabularyByQuestion((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleImproveAnswer = async (questionId: string, transcription: string, questionText: string) => {
    try {
      setIsImprovingByQuestion((prev) => ({ ...prev, [questionId]: true }));
      const result = await improveAnswer({
        transcription,
        questionText,
        language: "en",
      }).unwrap();

      setImprovedAnswerByQuestion((prev) => ({
        ...prev,
        [questionId]: result,
      }));
      setShowImprovedAnswerByQuestion((prev) => ({
        ...prev,
        [questionId]: true,
      }));
    } catch (error) {
      console.error("Failed to improve answer:", error);
    } finally {
      setIsImprovingByQuestion((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleScoreAnswer = async (questionId: string, audioBlob: Blob) => {
    if (!audioBlob) return;

    try {
      setIsScoringByQuestion((prev) => ({ ...prev, [questionId]: true }));

      const result = await submitAnswer({
        audio: audioBlob,
        questionId,
        topic: topic?.title,
        level: topic?.difficultyLevel,
      }).unwrap();

      setScoreResultByQuestion((prev) => ({
        ...prev,
        [questionId]: result,
      }));
    } catch (error: any) {
      // Check if it's a practice session limit error (BIZ_006)
      if (isErrorCode(error, "BIZ_006")) {
        const errorMessage = getErrorMessage(error, t);
        setLimitReachedMessage(errorMessage);
        setShowLimitReachedModal(true);
        // Don't set score result for limit errors
        return;
      }

      // Handle other errors
      setScoreResultByQuestion((prev) => ({
        ...prev,
        [questionId]: {
          recordingId: "",
          analysisResultId: "",
          transcription: "",
          scores: {
            overallBandScore: 0,
            fluencyScore: 0,
            vocabularyScore: 0,
            grammarScore: 0,
            pronunciationScore: 0,
          },
          feedback: error?.data?.message || t("topics.unableToScore", "Unable to score your answer right now. Please ensure the scoring service is running."),
        },
      }));
    } finally {
      setIsScoringByQuestion((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const stopRecording = (reason?: string) => {
    // Clear silence detection
    if (silenceCheckIntervalRef.current) {
      clearInterval(silenceCheckIntervalRef.current);
      silenceCheckIntervalRef.current = null;
    }
    
    // Stop audio analysis
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    silenceStartTimeRef.current = null;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    if (reason) {
      setAutoPausedReason(reason);
      setTimeout(() => setAutoPausedReason(null), 5000); // Clear message after 5 seconds
    }
  };

  const handleStartRecording = async (questionId: string) => {
    if (typeof window === "undefined") return;

    try {
      // Stop any existing recording first
      stopRecording();
      setAutoPausedReason(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      // Setup audio analysis for silence detection
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      silenceStartTimeRef.current = null;

      // Start silence detection
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const SILENCE_THRESHOLD = 20; // Volume threshold (0-255)
      const SILENCE_DURATION = 10000; // 10 seconds in milliseconds

      silenceCheckIntervalRef.current = setInterval(() => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

        if (average < SILENCE_THRESHOLD) {
          // Silence detected
          if (silenceStartTimeRef.current === null) {
            silenceStartTimeRef.current = Date.now();
          } else {
            const silenceDuration = Date.now() - silenceStartTimeRef.current;
            if (silenceDuration >= SILENCE_DURATION) {
              // Auto-pause after 10 seconds of silence
              if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                // Set the reason before stopping
                setAutoPausedReason(t("topics.autoPausedSilence", "Recording paused automatically due to 10 seconds of silence."));
                // Stop MediaRecorder - this will trigger onstop event
                mediaRecorderRef.current.stop();
                // Cleanup will happen in onstop handler
              }
            }
          }
        } else {
          // Sound detected, reset silence timer
          silenceStartTimeRef.current = null;
        }
      }, 500); // Check every 500ms

      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm;codecs=opus" });
        const duration = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        
        // Create object URL for audio playback
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioBlobByQuestion((prev) => ({
          ...prev,
          [questionId]: audioBlob,
        }));
        setAudioUrlByQuestion((prev) => {
          // Clean up old URL if exists
          if (prev[questionId]) {
            URL.revokeObjectURL(prev[questionId]);
          }
          return {
            ...prev,
            [questionId]: audioUrl,
          };
        });
        setRecordingDurationByQuestion((prev) => ({
          ...prev,
          [questionId]: duration,
        }));
        
        setIsRecordingByQuestion((prev) => ({
          ...prev,
          [questionId]: false,
        }));
        setActiveRecordingQuestionId(null);
        setShowConfirmationModal(questionId);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        // Clear silence detection
        if (silenceCheckIntervalRef.current) {
          clearInterval(silenceCheckIntervalRef.current);
          silenceCheckIntervalRef.current = null;
        }
        
        // Stop audio analysis
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
        analyserRef.current = null;
        silenceStartTimeRef.current = null;

        setRecordingErrorByQuestion((prev) => ({
          ...prev,
          [questionId]: t("topics.recordingError", "Recording error occurred. Please try again."),
        }));
        setIsRecordingByQuestion((prev) => ({
          ...prev,
          [questionId]: false,
        }));
        setActiveRecordingQuestionId(null);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setRecordingErrorByQuestion((prev) => ({
        ...prev,
        [questionId]: null,
      }));
      setIsRecordingByQuestion((prev) => ({
        ...prev,
        [questionId]: true,
      }));
      setActiveRecordingQuestionId(questionId);
    } catch (error: any) {
      const message =
        error.name === "NotAllowedError" || error.name === "PermissionDeniedError"
          ? t("topics.microphoneDenied", "Microphone access was denied. Please allow access and try again.")
          : error.name === "NotFoundError" || error.name === "DevicesNotFoundError"
          ? t("topics.microphoneNotFound", "No microphone found. Please connect a microphone and try again.")
          : t("topics.unableToStartRecording", "Unable to start recording. Please try again.");
      
      setRecordingErrorByQuestion((prev) => ({
        ...prev,
        [questionId]: message,
      }));
      setIsRecordingByQuestion((prev) => ({
        ...prev,
        [questionId]: false,
      }));
      setActiveRecordingQuestionId(null);
    }
  };

  const handleToggleRecording = (questionId: string) => {
    const isRecording = isRecordingByQuestion[questionId];
    if (isRecording) {
      stopRecording();
    } else {
      handleStartRecording(questionId);
    }
  };

  const handleCloseRecordingModal = () => {
    if (activeRecordingQuestionId) {
      stopRecording();
      setIsRecordingByQuestion((prev) => ({
        ...prev,
        [activeRecordingQuestionId]: false,
      }));
      setActiveRecordingQuestionId(null);
    }
  };

  const handleConfirmAudio = async (questionId: string) => {
    const audioBlob = audioBlobByQuestion[questionId];
    if (!audioBlob) return;

    setShowConfirmationModal(null);
    await handleScoreAnswer(questionId, audioBlob);
  };

  const handleCancelAudio = (questionId: string) => {
    setShowConfirmationModal(null);
    setAudioBlobByQuestion((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
    setAudioUrlByQuestion((prev) => {
      const updated = { ...prev };
      if (updated[questionId]) {
        URL.revokeObjectURL(updated[questionId]);
      }
      delete updated[questionId];
      return updated;
    });
    setRecordingDurationByQuestion((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const handleFileUpload = async (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/aac'];
    if (!validAudioTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|ogg|m4a|aac)$/i)) {
      setRecordingErrorByQuestion((prev) => ({
        ...prev,
        [questionId]: t("topics.invalidAudioFile", "Invalid audio file. Please upload MP3, WAV, WebM, OGG, M4A, or AAC file."),
      }));
      // Reset input
      if (fileInputRefs.current[questionId]) {
        fileInputRefs.current[questionId]!.value = '';
      }
      return;
    }

    try {
      // Convert file to Blob
      const audioBlob = new Blob([file], { type: file.type || 'audio/mpeg' });
      
      // Create object URL for audio playback
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Store audio blob and URL
      setAudioBlobByQuestion((prev) => ({
        ...prev,
        [questionId]: audioBlob,
      }));
      setAudioUrlByQuestion((prev) => {
        // Clean up old URL if exists
        if (prev[questionId]) {
          URL.revokeObjectURL(prev[questionId]);
        }
        return {
          ...prev,
          [questionId]: audioUrl,
        };
      });
      
      // Clear any previous errors
      setRecordingErrorByQuestion((prev) => ({
        ...prev,
        [questionId]: null,
      }));

      // Automatically submit for scoring
      await handleScoreAnswer(questionId, audioBlob);
    } catch (error) {
      setRecordingErrorByQuestion((prev) => ({
        ...prev,
        [questionId]: t("topics.uploadError", "Failed to upload audio file. Please try again."),
      }));
    } finally {
      // Reset input
      if (fileInputRefs.current[questionId]) {
        fileInputRefs.current[questionId]!.value = '';
      }
    }
  };

  const handleUploadClick = (questionId: string) => {
    fileInputRefs.current[questionId]?.click();
  };

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(audioUrlByQuestion).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [audioUrlByQuestion]);

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
          {t("topics.pageNotFound", "We can't seem to find the page you are looking for!")}
        </h1>
        <p className="mb-6 max-w-md text-sm text-gray-600 dark:text-gray-400">
          {t("topics.pageNotFoundDesc", "The topic might have been deleted, or the link you followed may be incorrect.")}
        </p>
        <Link href="/topics">
          <Button>{t("topics.backToTopics", "Back to Topics")}</Button>
        </Link>
      </div>
    );
  }

  const currentConfirmationQuestionId = showConfirmationModal;
  const currentConfirmationAudio = currentConfirmationQuestionId 
    ? audioBlobByQuestion[currentConfirmationQuestionId] 
    : null;
  const currentConfirmationDuration = currentConfirmationQuestionId 
    ? recordingDurationByQuestion[currentConfirmationQuestionId] ?? 0 
    : 0;

  // Check if any question is being scored
  const isAnyScoring = Object.values(isScoringByQuestion).some((scoring) => scoring === true);

  return (
    <>
      <RecordingModal 
        isOpen={activeRecordingQuestionId !== null} 
        onClose={handleCloseRecordingModal} 
      />
      <AudioConfirmationModal
        isOpen={showConfirmationModal !== null}
        audioBlob={currentConfirmationAudio ?? null}
        duration={currentConfirmationDuration}
        onConfirm={() => currentConfirmationQuestionId && handleConfirmAudio(currentConfirmationQuestionId)}
        onCancel={() => currentConfirmationQuestionId && handleCancelAudio(currentConfirmationQuestionId)}
        isSubmitting={currentConfirmationQuestionId ? isScoringByQuestion[currentConfirmationQuestionId] ?? false : false}
      />
      <ScoringLoadingModal isOpen={isAnyScoring} />
      
      {/* Practice Limit Reached Modal */}
      <Modal
        isOpen={showLimitReachedModal}
        onClose={() => setShowLimitReachedModal(false)}
        className="p-6"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-900/30">
              <svg
                className="h-6 w-6 text-warning-600 dark:text-warning-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("topics.limitReached", "Practice Limit Reached")}
            </h2>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {limitReachedMessage}
          </p>
          
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => setShowLimitReachedModal(false)}
              variant="outline"
              className="flex-1"
            >
              {t("topics.cancel", "Cancel")}
            </Button>
            <Button
              onClick={() => {
                setShowLimitReachedModal(false);
                // Navigate to upgrade page if exists, or settings
                window.location.href = "/settings";
              }}
              className="flex-1"
            >
              {t("topics.upgradeToPremium", "Upgrade to Premium")}
            </Button>
          </div>
        </div>
      </Modal>
      
      <RecordingsHistoryModal
        isOpen={recordingsHistoryModal !== null}
        onClose={() => setRecordingsHistoryModal(null)}
        questionId={recordingsHistoryModal?.questionId ?? ""}
        questionText={recordingsHistoryModal?.questionText ?? ""}
      />
      {/* Generate Options Modal */}
      <Modal
        isOpen={generateModalOpen !== null}
        onClose={closeGenerateModal}
        className="max-w-[500px] p-6"
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {generateModalOpen?.type === "answer" && t("topics.generateAnswer", "Generate Answer")}
          {generateModalOpen?.type === "structures" && t("topics.generateStructures", "Generate Structures")}
          {generateModalOpen?.type === "vocabulary" && t("topics.generateVocabulary", "Generate Vocabulary")}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("topics.targetBand", "Target Band")}
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
          {generateModalOpen?.type === "structures" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("topics.structureCount", "Structure Count")}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={modalStructureCount}
                onChange={(e) => setModalStructureCount(parseInt(e.target.value) || 6)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          )}
          {generateModalOpen?.type === "vocabulary" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("topics.vocabularyCount", "Vocabulary Count")}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={modalVocabularyCount}
                onChange={(e) => setModalVocabularyCount(parseInt(e.target.value) || 12)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          )}
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeGenerateModal}
          >
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirmGenerate}
            disabled={
              (generateModalOpen?.type === "answer" && isGeneratingAnswerByQuestion[generateModalOpen.questionId]) ||
              (generateModalOpen?.type === "structures" && isGeneratingStructuresByQuestion[generateModalOpen.questionId]) ||
              (generateModalOpen?.type === "vocabulary" && isGeneratingVocabularyByQuestion[generateModalOpen.questionId])
            }
          >
            {t("topics.generate", "Generate")}
          </Button>
        </div>
      </Modal>
      <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/topics"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeftIcon className="mr-1 h-4 w-4" />
            {t("topics.backToTopics", "Back to topics")}
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
            {(() => {
              const effectivePart =
                typeof questionPartNumber === "number"
                  ? questionPartNumber
                  : topic?.partNumber;
              if (!effectivePart) return null;
              return (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                {partLabels[effectivePart] ?? `Part ${effectivePart.toString()}`}
              </span>
              );
            })()}
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
                <span>{t("topics.averageRating", "Average Rating")}</span>
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
                {t("topics.questionsInTopic", "Questions in this topic")}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {totalQuestions === 1 
                  ? t("topics.questionCount_one", { count: totalQuestions })
                  : t("topics.questionCount_other", { count: totalQuestions })}
              </span>
            </div>

            {totalQuestions === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("topics.noQuestions", "This topic doesn't have any questions yet.")}
              </p>
            ) : (
              <div className="space-y-4">
                {questionsArray.map((question) => {
                  const structureLines = normalizeSuggestedStructure(
                    question.suggestedStructure
                  );
                  const isExpanded = expandedQuestionId === question.id;
                  const audioBlob = audioBlobByQuestion[question.id];
                  const audioUrl = audioUrlByQuestion[question.id];
                  const recordingDuration = recordingDurationByQuestion[question.id] ?? 0;
                  const outlineText = outlineByQuestion[question.id];
                  const scoreResult = scoreResultByQuestion[question.id];
                  const isScoring = isScoringByQuestion[question.id] ?? false;
                  const isRecording = isRecordingByQuestion[question.id] ?? false;
                  const recordingError = recordingErrorByQuestion[question.id] ?? null;
                  const improvedAnswer = improvedAnswerByQuestion[question.id];
                  const isImproving = isImprovingByQuestion[question.id] ?? false;
                  const showImproved = showImprovedAnswerByQuestion[question.id] ?? false;
                  const generatedAnswer = generatedAnswerByQuestion[question.id];
                  const generatedStructures = generatedStructuresByQuestion[question.id] ?? [];
                  const generatedVocabulary = generatedVocabularyByQuestion[question.id] ?? [];
                  const targetBand = targetBandByQuestion[question.id] ?? 7.0;
                  const structureCount = structureCountByQuestion[question.id] ?? 6;
                  const vocabularyCount = vocabularyCountByQuestion[question.id] ?? 12;
                  const showStructureCount = showStructureCountByQuestion[question.id] ?? false;
                  const showVocabularyCount = showVocabularyCountByQuestion[question.id] ?? false;
                  const isGeneratingAnswer = isGeneratingAnswerByQuestion[question.id] ?? false;
                  const isGeneratingStructures = isGeneratingStructuresByQuestion[question.id] ?? false;
                  const isGeneratingVocabulary = isGeneratingVocabularyByQuestion[question.id] ?? false;

                  return (
                    <div
                      key={question.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm shadow-sm transition hover:border-brand-400 hover:bg-white dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-brand-500"
                      onClick={() => handleToggleQuestion(question.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <p className="font-medium text-gray-900 dark:text-white whitespace-pre-line">
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
                            {t("topics.suggestedStructure", "Suggested structure")}
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
                              {t("topics.keyVocabulary", "Key vocabulary")}
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
                        {question.attemptsCount && question.attemptsCount > 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRecordingsHistoryModal({
                                questionId: question.id,
                                questionText: question.questionText,
                              });
                            }}
                            className="group inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 transition hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50"
                          >
                            <svg
                              className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-medium text-brand-700 dark:text-brand-300">
                              {question.attemptsCount} {t("topics.attempts", "lần trả lời")}
                            </span>
                            <svg
                              className="h-3 w-3 text-brand-600 dark:text-brand-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        ) : (
                          <span>
                            {t("topics.attempts", "Attempts")}:{" "}
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {question.attemptsCount ?? 0}
                            </span>
                          </span>
                        )}
                        {typeof question.avgScore === "number" && (
                          <span>
                            {t("topics.avgScore", "Avg score")}:{" "}
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
                          {/* Generate Controls */}
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                              {t("topics.generateContent", "Generate Content")}
                            </p>
                            {showStructureCount && (
                              <div className="mb-2">
                                <label className="mb-1 block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                                  {t("topics.structureCount", "Structure Count")}
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={structureCount}
                                  onChange={(e) =>
                                    setStructureCountByQuestion((prev) => ({
                                      ...prev,
                                      [question.id]: parseInt(e.target.value) || 6,
                                    }))
                                  }
                                  className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                />
                              </div>
                            )}
                            {showVocabularyCount && (
                              <div className="mb-2">
                                <label className="mb-1 block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                                  {t("topics.vocabularyCount", "Vocabulary Count")}
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="30"
                                  value={vocabularyCount}
                                  onChange={(e) =>
                                    setVocabularyCountByQuestion((prev) => ({
                                      ...prev,
                                      [question.id]: parseInt(e.target.value) || 12,
                                    }))
                                  }
                                  className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                />
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isGeneratingAnswer}
                                onClick={() => openGenerateModal(question.id, "answer")}
                              >
                                {isGeneratingAnswer
                                  ? t("topics.generatingAnswer", "Generating...")
                                  : t("topics.generateAnswer", "Generate Answer")}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isGeneratingStructures}
                                onClick={() => openGenerateModal(question.id, "structures")}
                              >
                                {isGeneratingStructures
                                  ? t("topics.generatingStructures", "Generating...")
                                  : t("topics.generateStructures", "Generate Structures")}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isGeneratingVocabulary}
                                onClick={() => openGenerateModal(question.id, "vocabulary")}
                              >
                                {isGeneratingVocabulary
                                  ? t("topics.generatingVocabulary", "Generating...")
                                  : t("topics.generateVocabulary", "Generate Vocabulary")}
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
 
                            {question.sampleAnswers && question.sampleAnswers.length > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setShowSampleAnswersByQuestion((prev) => ({
                                    ...prev,
                                    [question.id]: !prev[question.id],
                                  }))
                                }
                              >
                                {showSampleAnswersByQuestion[question.id]
                                  ? t("topics.hideSampleAnswers", "Hide sample answers")
                                  : t("topics.showSampleAnswers", "Show sample answers")}
                              </Button>
                            )}
                          </div>

                          {outlineText && (
                            <div className="rounded-lg border border-brand-100 bg-brand-50/60 p-3 text-xs text-gray-800 dark:border-brand-900/40 dark:bg-brand-900/20 dark:text-gray-100">
                              <p className="mb-1 font-semibold text-brand-800 dark:text-brand-200">
                                {t("topics.suggestedOutlineLabel", "Suggested outline")}
                              </p>
                              <pre className="whitespace-pre-wrap text-[11px] leading-relaxed">
                                {outlineText}
                              </pre>
                            </div>
                          )}

                          {/* Generating Answer Status */}
                          {isGeneratingAnswer && !generatedAnswer && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 text-xs dark:border-blue-800/40 dark:bg-blue-900/20">
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent dark:border-blue-400"></div>
                                <p className="font-semibold text-blue-800 dark:text-blue-200">
                                  {t("topics.generatingAnswer", "Generating...")}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Generated Answer */}
                          {generatedAnswer && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 text-xs dark:border-blue-800/40 dark:bg-blue-900/20">
                              <p className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                                {t("topics.generatedAnswer", "Generated Sample Answer")} (Band {targetBand})
                              </p>
                              <div className="rounded-md border border-blue-200 bg-white p-3 text-gray-800 dark:border-blue-800 dark:bg-gray-900 dark:text-gray-100">
                                <p className="leading-relaxed text-[11px] whitespace-pre-wrap">{generatedAnswer}</p>
                              </div>
                            </div>
                          )}

                          {/* Generating Structures Status */}
                          {isGeneratingStructures && generatedStructures.length === 0 && (
                            <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-4 text-xs dark:border-purple-800/40 dark:bg-purple-900/20">
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent dark:border-purple-400"></div>
                                <p className="font-semibold text-purple-800 dark:text-purple-200">
                                  {t("topics.generatingStructures", "Generating...")}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Generated Structures */}
                          {generatedStructures.length > 0 && (
                            <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-4 text-xs dark:border-purple-800/40 dark:bg-purple-900/20">
                              <p className="mb-3 font-semibold text-purple-800 dark:text-purple-200">
                                {t("topics.generatedStructures", "Generated Structures")} (Band {targetBand})
                              </p>
                              <div className="space-y-3">
                                {generatedStructures.map((structure, index) => (
                                  <div
                                    key={index}
                                    className="rounded-md border border-purple-200 bg-white p-3 text-gray-800 dark:border-purple-800 dark:bg-gray-900 dark:text-gray-100"
                                  >
                                    <p className="mb-1 text-[10px] font-medium text-purple-700 dark:text-purple-300">
                                      {t("topics.structure", "Structure")} {index + 1}:
                                    </p>
                                    <p className="mb-2 text-[11px] font-semibold">{structure.pattern}</p>
                                    <p className="mb-2 text-[11px] italic text-gray-600 dark:text-gray-400">
                                      {t("topics.example", "Example")}: {structure.example}
                                    </p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                      {structure.usage}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Generating Vocabulary Status */}
                          {isGeneratingVocabulary && generatedVocabulary.length === 0 && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 text-xs dark:border-amber-800/40 dark:bg-amber-900/20">
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent dark:border-amber-400"></div>
                                <p className="font-semibold text-amber-800 dark:text-amber-200">
                                  {t("topics.generatingVocabulary", "Generating...")}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Generated Vocabulary */}
                          {generatedVocabulary.length > 0 && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 text-xs dark:border-amber-800/40 dark:bg-amber-900/20">
                              <p className="mb-3 font-semibold text-amber-800 dark:text-amber-200">
                                {t("topics.generatedVocabulary", "Generated Vocabulary")} (Band {targetBand})
                              </p>
                              <div className="space-y-3">
                                {generatedVocabulary.map((vocab, index) => (
                                  <div
                                    key={index}
                                    className="rounded-md border border-amber-200 bg-white p-3 text-gray-800 dark:border-amber-800 dark:bg-gray-900 dark:text-gray-100"
                                  >
                                    <div className="mb-1 flex items-center justify-between">
                                      <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                                        {vocab.word}
                                      </p>
                                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                        {vocab.pronunciation}
                                      </p>
                                    </div>
                                    <p className="mb-2 text-[11px] text-gray-700 dark:text-gray-300">
                                      {vocab.definition}
                                    </p>
                                    <p className="text-[10px] italic text-gray-600 dark:text-gray-400">
                                      {t("topics.example", "Example")}: {vocab.example}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sample Answers */}
                          {showSampleAnswersByQuestion[question.id] &&
                            question.sampleAnswers &&
                            question.sampleAnswers.length > 0 && (
                              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 text-xs dark:border-emerald-800/40 dark:bg-emerald-900/20">
                                <p className="mb-3 font-semibold text-emerald-800 dark:text-emerald-200">
                                  {t("topics.sampleAnswersTitle", "Sample Answers")}
                                </p>
                                <div className="space-y-3">
                                  {question.sampleAnswers.map((answer, index) => (
                                    <div
                                      key={index}
                                      className="rounded-md border border-emerald-200 bg-white p-3 text-gray-800 dark:border-emerald-800 dark:bg-gray-900 dark:text-gray-100"
                                    >
                                      <p className="mb-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                                        {t("topics.sampleAnswer", "Sample Answer")} {index + 1}:
                                      </p>
                                      <p className="leading-relaxed text-[11px]">{answer}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          <div className="space-y-2">
                            <div className="mb-1 flex items-center justify-between gap-3">
                              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                {t("topics.yourAnswer", "Your answer")}
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  ref={(el) => {
                                    fileInputRefs.current[question.id] = el;
                                  }}
                                  accept="audio/*,.mp3,.wav,.webm,.ogg,.m4a,.aac"
                                  onChange={(e) => handleFileUpload(question.id, e)}
                                  className="hidden"
                                  disabled={isScoring}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUploadClick(question.id)}
                                  disabled={isScoring}
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                                    isScoring
                                      ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600"
                                      : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
                                  }`}
                                >
                                  <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                  </svg>
                                  {t("topics.uploadAudio", "Upload audio")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleRecording(question.id)}
                                  disabled={isScoring}
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                                    isRecording
                                      ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200"
                                      : isScoring
                                      ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600"
                                      : "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      isRecording ? "bg-rose-500" : isScoring ? "bg-gray-400" : "bg-brand-500"
                                    }`}
                                  />
                                  {isRecording 
                                    ? t("topics.stopRecording", "Stop recording") 
                                    : isScoring
                                    ? t("topics.scoringInProgress", "Scoring...")
                                    : t("topics.recordAnswer", "Record answer")}
                                </button>
                              </div>
                            </div>
                            {audioBlob && !isRecording && !isScoring && (
                              <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-xs dark:border-brand-800 dark:bg-brand-900/30">
                                <p className="font-medium text-brand-700 dark:text-brand-300">
                                  {t("topics.audioReady", "Audio recording ready")}
                                </p>
                                <p className="mt-1 text-gray-600 dark:text-gray-400">
                                  {t("topics.audioReadyDesc", "Your recording is saved. Click 'Record answer' to record again.")}
                                </p>
                              </div>
                            )}
                            {isScoring && (
                              <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-xs dark:border-brand-800 dark:bg-brand-900/30">
                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent dark:border-brand-400"></div>
                                  <p className="font-medium text-brand-700 dark:text-brand-300">
                                    {t("topics.scoringInProgress", "Scoring in progress")}
                                  </p>
                                </div>
                                <p className="mt-1 text-gray-600 dark:text-gray-400">
                                  {t("topics.scoringMessage", "Please wait while we analyze your answer. This may take a few moments...")}
                                </p>
                              </div>
                            )}
                            {recordingError && (
                              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                                {recordingError}
                              </p>
                            )}
                            {autoPausedReason && (
                              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs dark:border-amber-800 dark:bg-amber-900/30">
                                <div className="flex items-start gap-2">
                                  <svg
                                    className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <p className="text-amber-800 dark:text-amber-200">
                                    {autoPausedReason}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {scoreResult && (
                            <div className="space-y-4">
                              {/* Band Score */}
                              <div className="rounded-xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-brand-100/50 p-6 dark:border-brand-800 dark:from-brand-900/40 dark:to-brand-900/20">
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                                    {t("topics.bandScore", "Band score")}
                                  </p>
                                  <div className="text-5xl font-bold text-brand-600 dark:text-brand-400">
                                    {scoreResult.scores.overallBandScore.toFixed(1)}
                                  </div>
                                </div>
                              </div>

                              {/* Detailed Scores */}
                              <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <div className="flex flex-col gap-1 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("topics.pronunciationScore", "Pronunciation")}</span>
                                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {scoreResult.scores.pronunciationScore.toFixed(1)}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("topics.grammarScore", "Grammar")}</span>
                                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {scoreResult.scores.grammarScore.toFixed(1)}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("topics.vocabularyScore", "Vocabulary")}</span>
                                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {scoreResult.scores.vocabularyScore.toFixed(1)}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("topics.fluencyScore", "Fluency")}</span>
                                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {scoreResult.scores.fluencyScore.toFixed(1)}
                                  </span>
                                </div>
                              </div>

                              {/* Student Answer Section */}
                              <div className="space-y-4">
                                <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 dark:border-purple-800 dark:from-purple-900/40 dark:to-purple-900/20">
                                  <p className="mb-4 text-base font-bold text-purple-800 dark:text-purple-200">
                                    {t("topics.studentAnswer", "Student Answer")}
                                  </p>
                                  
                                  {/* Audio Player */}
                                  {audioUrl && (
                                    <div className="mb-4">
                                      <audio
                                        controls
                                        src={audioUrl}
                                        className="w-full h-12"
                                        preload="metadata"
                                      >
                                        {t("topics.audioNotSupported", "Your browser does not support the audio element.")}
                                      </audio>
                                    </div>
                                  )}

                                  {/* Transcription */}
                                  {scoreResult.transcription && (
                                    <div className="mt-4 space-y-4">
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                          {t("topics.transcription", "Transcription")}:
                                        </p>
                                        {!improvedAnswerByQuestion[question.id] && (
                                          <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            disabled={isImprovingByQuestion[question.id]}
                                            onClick={() => handleImproveAnswer(question.id, scoreResult.transcription, question.questionText)}
                                            className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 text-sm shadow-sm"
                                          >
                                            {isImprovingByQuestion[question.id] ? (
                                              <span className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                {t("topics.improving", "Improving...")}
                                              </span>
                                            ) : (
                                              <span className="flex items-center gap-2">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                {t("topics.improveAnswer", "Improve Answer")}
                                              </span>
                                            )}
                                          </Button>
                                        )}
                                      </div>
                                      <div className="rounded-lg border border-purple-200 bg-white p-4 dark:border-purple-800 dark:bg-gray-900">
                                        <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                                          {scoreResult.transcription}
                                        </p>
                                      </div>
                                      
                                      {/* Corrected Transcription */}
                                      {scoreResult.correctedTranscription && (
                                        <div className="mt-4">
                                          <p className="mb-2 text-sm font-semibold text-green-700 dark:text-green-300">
                                            {t("topics.correctedTranscription", "Corrected Transcription")}:
                                          </p>
                                          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                            <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                                              {scoreResult.correctedTranscription}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Improved Answer */}
                                      {improvedAnswerByQuestion[question.id] && showImprovedAnswerByQuestion[question.id] && (
                                        <div className="mt-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 dark:border-emerald-800 dark:from-emerald-900/40 dark:to-emerald-900/20">
                                          <div className="mb-3 flex items-center justify-between">
                                            <p className="text-base font-bold text-emerald-800 dark:text-emerald-200">
                                              {t("topics.improvedAnswer", "Improved Answer")}
                                            </p>
                                            <button
                                              type="button"
                                              onClick={() => setShowImprovedAnswerByQuestion((prev) => ({
                                                ...prev,
                                                [question.id]: !prev[question.id],
                                              }))}
                                              className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
                                            >
                                              {showImprovedAnswerByQuestion[question.id] ? (
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                              ) : (
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                              )}
                                            </button>
                                          </div>
                                          {showImprovedAnswerByQuestion[question.id] && (
                                            <div className="space-y-3">
                                              <div className="rounded-lg border border-emerald-200 bg-white p-4 dark:border-emerald-800 dark:bg-gray-900">
                                                <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                                                  {improvedAnswerByQuestion[question.id].improved}
                                                </p>
                                              </div>
                                              {improvedAnswerByQuestion[question.id].explanation && (
                                                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                                                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                                                    {t("topics.improvementExplanation", "Improvement Explanation")}:
                                                  </p>
                                                  <p className="text-xs leading-relaxed text-emerald-700 dark:text-emerald-300">
                                                    {improvedAnswerByQuestion[question.id].explanation}
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Grammar Correction */}
                              {scoreResult.grammarCorrection && (
                                <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 dark:border-blue-800 dark:from-blue-900/40 dark:to-blue-900/20">
                                  <p className="mb-3 text-base font-bold text-blue-800 dark:text-blue-200">
                                    {t("topics.grammarCorrection", "Grammar Correction")}
                                  </p>
                                  
                                  {/* Original vs Corrected Comparison */}
                                  <div className="mb-4 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                      <p className="mb-2 text-xs font-semibold text-red-700 dark:text-red-300">
                                        {t("topics.original", "Original")}:
                                      </p>
                                      <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                                        {scoreResult.grammarCorrection.original}
                                      </p>
                                    </div>
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                      <p className="mb-2 text-xs font-semibold text-green-700 dark:text-green-300">
                                        {t("topics.corrected", "Corrected")}:
                                      </p>
                                      <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                                        {scoreResult.grammarCorrection.corrected}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Detailed Corrections */}
                                  {scoreResult.grammarCorrection.corrections && scoreResult.grammarCorrection.corrections.length > 0 && (
                                    <div className="mb-4">
                                      <p className="mb-3 text-sm font-semibold text-blue-700 dark:text-blue-300">
                                        {t("topics.detailedCorrections", "Detailed Corrections")}:
                                      </p>
                                      <div className="space-y-2">
                                        {scoreResult.grammarCorrection.corrections.map((correction, index) => (
                                          <div
                                            key={index}
                                            className="rounded-lg border border-blue-200 bg-white p-3 dark:border-blue-800 dark:bg-gray-900"
                                          >
                                            <div className="mb-2 flex items-start gap-2">
                                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                {index + 1}
                                              </span>
                                              <div className="flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                  <span className="text-xs font-medium text-red-600 dark:text-red-400 line-through">
                                                    {correction.original}
                                                  </span>
                                                  <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                  </svg>
                                                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                                    {correction.corrected}
                                                  </span>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                  {correction.reason}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Explanation */}
                                  {scoreResult.grammarCorrection.explanation && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                      <p className="mb-2 text-xs font-semibold text-blue-800 dark:text-blue-200">
                                        {t("topics.explanation", "Explanation")}:
                                      </p>
                                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                        {scoreResult.grammarCorrection.explanation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Grammar Report */}
                              {scoreResult.grammarReport && (
                                <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 dark:border-amber-800 dark:from-amber-900/40 dark:to-amber-900/20">
                                  <p className="mb-3 text-base font-bold text-amber-800 dark:text-amber-200">
                                    {t("topics.grammarReport", "Grammar Report")}
                                  </p>
                                  <div className="rounded-lg border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-gray-900">
                                    <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{scoreResult.grammarReport}</p>
                                  </div>
                                </div>
                              )}

                              {/* Feedback */}
                              {scoreResult.feedback && (
                                <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 dark:border-gray-700 dark:from-gray-900/60 dark:to-gray-900/40">
                                  <p className="mb-3 text-base font-bold text-gray-900 dark:text-white">{t("topics.feedback", "Feedback")}</p>
                                  <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{scoreResult.feedback}</p>
                                  </div>
                                </div>
                              )}
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
              {t("topics.topicOverview", "Topic overview")}
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-gray-500 dark:text-gray-400">
                  {t("topics.totalQuestions", "Total questions")}
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {totalQuestions}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-500 dark:text-gray-400">
                  {t("topics.totalAttempts", "Total attempts")}
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {aggregatedStats.totalAttempts}
                </dd>
              </div>
              {aggregatedStats.avgScore !== null && (
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">
                    {t("topics.averageScore", "Average score")}
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {aggregatedStats.avgScore.toFixed(1)}
                  </dd>
                </div>
              )}
              {topic?.keywords && topic.keywords.length > 0 && (
                <div>
                  <dt className="mb-1 text-gray-500 dark:text-gray-400">
                    {t("topics.topicKeywords", "Topic keywords")}
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
    </>
  );
}


