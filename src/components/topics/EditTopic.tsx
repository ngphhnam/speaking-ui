"use client";

import { FormEvent, useState, useEffect, useMemo } from "react";
import { useGetTopicByIdQuery, useUpdateTopicMutation } from "@/store/api/topicApi";
import { useGetQuestionsQuery } from "@/store/api/questionApi";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import type { SerializedError } from "@reduxjs/toolkit";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";

// partOptions will be defined inside component to use translations

/**
 * Map UI selection to database partNumber
 * "Part 2 & Part 3" → 2 (database value)
 * "Part 1" → 1
 * "Part 2" → 2
 */
const mapPartNumberToDatabase = (uiValue: string): number | undefined => {
  if (!uiValue) return undefined;
  
  // "2&3" means Part 2 & Part 3, map to database value 2
  if (uiValue === "2&3") {
    return 2;
  }
  
  // Otherwise, use the value directly
  const num = Number(uiValue);
  return isNaN(num) ? undefined : num;
};

/**
 * Map database partNumber to UI value
 * If topic has partNumber=2 and has PART3 questions → "2&3"
 * If topic has partNumber=2 and no PART3 questions → "2"
 * Otherwise → direct mapping
 */
const mapDatabaseToUI = (partNumber: number | null | undefined, hasPart3Questions: boolean): string => {
  if (!partNumber) return "";
  
  // If partNumber is 2 and has PART3 questions, show "2&3"
  if (partNumber === 2 && hasPart3Questions) {
    return "2&3";
  }
  
  // Otherwise, return as string
  return partNumber.toString();
};

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

type EditTopicProps = {
  topicId: string;
};

export default function EditTopic({ topicId }: EditTopicProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: topic, isLoading: isLoadingTopic } = useGetTopicByIdQuery(topicId);
  const { data: questions } = useGetQuestionsQuery({ topicId, includeInactive: false });
  const [updateTopic, { isLoading: isUpdatingTopic }] = useUpdateTopicMutation();

  const partOptions = [
    { value: "1", label: t("topics.part1", "Part 1: Introduction & Interview") },
    { value: "2&3", label: t("topics.part2And3", "Part 2 & Part 3: Long Turn & Discussion") },
  ];

  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    partNumber: "",
    topicCategory: "",
    keywords: "",
  });

  const [topicError, setTopicError] = useState<string | null>(null);
  const [topicSuccess, setTopicSuccess] = useState<string | null>(null);

  // Check if topic has PART3 questions
  const hasPart3Questions = useMemo(() => {
    if (!Array.isArray(questions)) return false;
    return questions.some((q) => q.questionType === "PART3");
  }, [questions]);

  useEffect(() => {
    if (topic) {
      // Map database partNumber to UI value
      const uiPartNumber = mapDatabaseToUI(topic.partNumber, hasPart3Questions);
      
      setTopicForm({
        title: topic.title || "",
        description: topic.description || "",
        partNumber: uiPartNumber,
        topicCategory: topic.topicCategory || "",
        keywords: topic.keywords?.join(", ") || "",
      });
    }
  }, [topic, hasPart3Questions]);

  const handleUpdateTopic = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topicForm.title.trim()) {
      setTopicError("Title is required");
      return;
    }

    setTopicError(null);
    setTopicSuccess(null);

    try {
      // Map UI selection to database value
      const partNumber = mapPartNumberToDatabase(topicForm.partNumber);
      
      await updateTopic({
        id: topicId,
        data: {
          title: topicForm.title.trim(),
          description: topicForm.description.trim() || undefined,
          partNumber: partNumber,
          topicCategory: topicForm.topicCategory.trim() || undefined,
          keywords: topicForm.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        },
      }).unwrap();

      setTopicSuccess(t("topics.topicUpdated", "Topic updated successfully!"));
      setTimeout(() => {
        router.push("/topics/manage");
      }, 1500);
    } catch (error) {
      setTopicError(getErrorMessage(error, t("topics.failedToUpdate", "Failed to update topic")));
    }
  };

  if (isLoadingTopic) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-64 animate-pulse" />
        <div className="h-96 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="space-y-6">
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          {t("topics.topicNotFound", "Topic not found")}
        </p>
        <Link href="/topics/manage">
          <Button variant="outline">{t("topics.backToManage", "Back to Manage Topics")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {t("topics.editTopic", "Edit Topic")}
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
          {t("topics.editTopicSubtitle", "Update topic details")}
        </p>
      </div>

      <form onSubmit={handleUpdateTopic} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-5">
            <div>
              <Label>
                {t("topics.title")} <span className="text-error-500">*</span>
              </Label>
              <Input
                value={topicForm.title}
                onChange={(e) =>
                  setTopicForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={t("topics.titlePlaceholder")}
              />
            </div>

            <div>
              <Label>{t("topics.description")}</Label>
              <TextArea
                value={topicForm.description}
                onChange={(value) =>
                  setTopicForm((prev) => ({ ...prev, description: value }))
                }
                placeholder={t("topics.descriptionPlaceholder")}
                rows={4}
              />
            </div>

            <div>
              <Label>{t("topics.partNumber")}</Label>
              <select
                value={topicForm.partNumber}
                onChange={(e) =>
                  setTopicForm((prev) => ({ ...prev, partNumber: e.target.value }))
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="">{t("topics.selectPart")}</option>
                {partOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>{t("topics.category")}</Label>
              <Input
                value={topicForm.topicCategory}
                onChange={(e) =>
                  setTopicForm((prev) => ({ ...prev, topicCategory: e.target.value }))
                }
                placeholder={t("topics.categoryPlaceholder")}
              />
            </div>

            <div>
              <Label>{t("topics.keywords")}</Label>
              <Input
                value={topicForm.keywords}
                onChange={(e) =>
                  setTopicForm((prev) => ({ ...prev, keywords: e.target.value }))
                }
                placeholder={t("topics.keywordsPlaceholder")}
              />
            </div>

            {topicError && (
              <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
                {topicError}
              </div>
            )}

            {topicSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {topicSuccess}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={isUpdatingTopic} isLoading={isUpdatingTopic}>
                {t("topics.updateTopic", "Update Topic")}
              </Button>
              <Link href="/topics/manage">
                <Button variant="outline" type="button">
                  {t("topics.cancel", "Cancel")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}








