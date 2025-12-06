"use client";

import { FormEvent, useState } from "react";
import { useGetTopicByIdQuery } from "@/store/api/topicApi";
import { useCreateQuestionMutation } from "@/store/api/questionApi";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import type { SerializedError } from "@reduxjs/toolkit";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";


const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "status" in error && "data" in error) {
    const fetchError = error as { status: string | number; data?: unknown };
    const data = fetchError.data as { detail?: string; message?: string } | string | undefined;
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && "detail" in data) return String(data.detail);
    if (data && typeof data === "object" && "message" in data) return String(data.message);
    return `Request failed with status ${fetchError.status}`;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String((error as SerializedError).message ?? fallback);
  }
  return fallback;
};

type CreateQuestionProps = {
  topicId: string;
};

type QuestionFormData = {
  questionText: string;
  suggestedStructure: string;
  sampleAnswers: string;
  keyVocabulary: string;
};

export default function CreateQuestion({ topicId }: CreateQuestionProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: topic, isLoading: isLoadingTopic } = useGetTopicByIdQuery(topicId);

  const [questions, setQuestions] = useState<QuestionFormData[]>([
    {
      questionText: "",
      suggestedStructure: "",
      sampleAnswers: "",
      keyVocabulary: "",
    },
  ]);

  const [questionErrors, setQuestionErrors] = useState<Record<number, string>>({});
  const [questionSuccesses, setQuestionSuccesses] = useState<Record<number, boolean>>({});
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);

  const [createQuestion, { isLoading: isCreatingQuestion }] = useCreateQuestionMutation();

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        suggestedStructure: "",
        sampleAnswers: "",
        keyVocabulary: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return; // Keep at least one question
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    // Clean up errors and successes for removed question
    const newErrors = { ...questionErrors };
    delete newErrors[index];
    setQuestionErrors(newErrors);
    const newSuccesses = { ...questionSuccesses };
    delete newSuccesses[index];
    setQuestionSuccesses(newSuccesses);
  };

  const updateQuestion = (index: number, field: keyof QuestionFormData, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
    // Clear error for this question when user starts typing
    if (questionErrors[index]) {
      const newErrors = { ...questionErrors };
      delete newErrors[index];
      setQuestionErrors(newErrors);
    }
  };

  const isQuestionValid = (question: QuestionFormData) => {
    return question.questionText.trim() !== "";
  };

  const buildQuestionPayload = (question: QuestionFormData) => {
    const payload: {
      topicId: string;
      questionText: string;
      suggestedStructure?: string;
      sampleAnswers?: string[];
      keyVocabulary?: string[];
    } = {
      topicId,
      questionText: question.questionText.trim(),
    };

    if (question.suggestedStructure.trim()) {
      payload.suggestedStructure = question.suggestedStructure.trim();
    }

    const sampleAnswersArray = question.sampleAnswers
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean);
    if (sampleAnswersArray.length > 0) {
      payload.sampleAnswers = sampleAnswersArray;
    }

    const keyVocabularyArray = question.keyVocabulary
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (keyVocabularyArray.length > 0) {
      payload.keyVocabulary = keyVocabularyArray;
    }

    return payload;
  };

  const handleCreateSingleQuestion = async (index: number) => {
    const question = questions[index];

    if (!question.questionText.trim()) {
      setQuestionErrors({ ...questionErrors, [index]: "Question text is required" });
      return;
    }

    const newErrors = { ...questionErrors };
    delete newErrors[index];
    setQuestionErrors(newErrors);

    try {
      const payload = buildQuestionPayload(question);
      await createQuestion(payload).unwrap();

      setQuestionSuccesses({ ...questionSuccesses, [index]: true });
      
      // Reset this question form
      const newQuestions = [...questions];
      newQuestions[index] = {
        questionText: "",
        suggestedStructure: "",
        sampleAnswers: "",
        keyVocabulary: "",
      };
      setQuestions(newQuestions);
    } catch (error) {
      setQuestionErrors({
        ...questionErrors,
        [index]: getErrorMessage(error, "Failed to create question"),
      });
    }
  };

  const handleCreateAllQuestions = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all questions
    const errors: Record<number, string> = {};
    questions.forEach((question, index) => {
      if (!question.questionText.trim()) {
        errors[index] = "Question text is required";
      }
    });

    if (Object.keys(errors).length > 0) {
      setQuestionErrors(errors);
      return;
    }

    setIsSubmittingAll(true);
    setSubmittedCount(0);
    setQuestionErrors({});
    setQuestionSuccesses({});

    let successCount = 0;
    let failCount = 0;

    // Create all questions sequentially
    for (let i = 0; i < questions.length; i++) {
      try {
        const payload = buildQuestionPayload(questions[i]);
        await createQuestion(payload).unwrap();
        setQuestionSuccesses((prev) => ({ ...prev, [i]: true }));
        successCount++;
      } catch (error) {
        setQuestionErrors((prev) => ({
          ...prev,
          [i]: getErrorMessage(error, "Failed to create question"),
        }));
        failCount++;
      }
      setSubmittedCount(i + 1);
    }

    setIsSubmittingAll(false);

    // If all succeeded, redirect after a delay
    if (failCount === 0 && successCount > 0) {
      setTimeout(() => {
        router.push(`/topics/${topicId}`);
      }, 2000);
    }
  };

  if (isLoadingTopic) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-sm text-gray-500">Loading topic...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-error-500">Topic not found</div>
        <Link href="/topics">
          <Button variant="outline">Back to Topics</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {t("topics.addQuestion")}
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
          {t("topics.addQuestionSubtitle", { topicTitle: topic.title })}
        </p>
      </div>

      <form onSubmit={handleCreateAllQuestions} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{t("topics.topic")}:</span> {topic.title}
                </p>
              </div>
              <Button
                type="button"
                onClick={addQuestion}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                {t("topics.addAnotherQuestion", "Add Another Question")}
              </Button>
            </div>

            {questions.map((question, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 space-y-5 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("topics.questionNumber", "Question {{number}}", { number: index + 1 })}
                  </h3>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      variant="outline"
                      size="sm"
                      className="text-error-500 hover:text-error-600"
                    >
                      {t("topics.removeQuestion", "Remove")}
                    </Button>
                  )}
                </div>

                <div>
                  <Label>
                    {t("topics.questionText")} <span className="text-error-500">*</span>
                  </Label>
                  <TextArea
                    value={question.questionText}
                    onChange={(value) => updateQuestion(index, "questionText", value)}
                    placeholder={t("topics.questionTextPlaceholder")}
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label>{t("topics.suggestedStructure")}</Label>
                  <TextArea
                    value={question.suggestedStructure}
                    onChange={(value) => updateQuestion(index, "suggestedStructure", value)}
                    placeholder={t("topics.suggestedStructurePlaceholder")}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>{t("topics.keyVocabulary")}</Label>
                  <Input
                    value={question.keyVocabulary}
                    onChange={(e) => updateQuestion(index, "keyVocabulary", e.target.value)}
                    placeholder={t("topics.keyVocabularyPlaceholder")}
                  />
                </div>

                <div>
                  <Label>{t("topics.sampleAnswers")}</Label>
                  <TextArea
                    value={question.sampleAnswers}
                    onChange={(value) => updateQuestion(index, "sampleAnswers", value)}
                    placeholder={t("topics.sampleAnswersPlaceholder")}
                    rows={4}
                  />
                </div>

                {questionErrors[index] && (
                  <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
                    {questionErrors[index]}
                  </div>
                )}

                {questionSuccesses[index] && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {t("topics.questionCreatedSuccess", "Question created successfully!")}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => handleCreateSingleQuestion(index)}
                    disabled={isCreatingQuestion || !isQuestionValid(question)}
                    isLoading={isCreatingQuestion}
                    variant="outline"
                    size="sm"
                  >
                    {t("topics.createThisQuestion", "Create This Question")}
                  </Button>
                </div>
              </div>
            ))}

            {isSubmittingAll && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {t("topics.creatingQuestions", "Creating questions... {{current}}/{{total}}", {
                  current: submittedCount,
                  total: questions.length,
                })}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="submit"
                disabled={isSubmittingAll || isCreatingQuestion}
                isLoading={isSubmittingAll}
              >
                {t("topics.createAllQuestions", "Create All Questions ({{count}})", {
                  count: questions.length,
                })}
              </Button>
              <Link href={`/topics/${topicId}`}>
                <Button type="button" variant="outline">
                  {t("topics.cancel")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

