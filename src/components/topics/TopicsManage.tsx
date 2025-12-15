"use client";

import { useState, useEffect } from "react";
import { useGetTopicsQuery, useDeleteTopicMutation, useUpdateTopicMutation } from "@/store/api/topicApi";
import { useGetQuestionsQuery, useDeleteQuestionMutation } from "@/store/api/questionApi";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

const partLabels: Record<number, string> = {
  1: "Part 1",
  2: "Part 2",
  3: "Part 3",
};

export default function TopicsManage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ topicId: string; topicTitle: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: topics, isLoading } = useGetTopicsQuery(
    { includeInactive: true },
    { skip: !mounted }
  );

  const { data: allQuestions } = useGetQuestionsQuery(
    { includeInactive: true },
    { skip: !mounted }
  );

  const [deleteTopic, { isLoading: isDeletingTopic }] = useDeleteTopicMutation();
  const [deleteQuestion, { isLoading: isDeletingQuestion }] = useDeleteQuestionMutation();
  const [updateTopic] = useUpdateTopicMutation();

  // Group questions by topic
  const questionsByTopic = topics?.reduce((acc, topic) => {
    acc[topic.id] = (allQuestions ?? []).filter((q) => q.topicId === topic.id);
    return acc;
  }, {} as Record<string, typeof allQuestions>) ?? {};

  const handleDeleteTopic = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteTopic(deleteConfirm.topicId).unwrap();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete topic:", error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm(t("topics.confirmDeleteQuestion", "Are you sure you want to delete this question?"))) {
      return;
    }

    try {
      await deleteQuestion(questionId).unwrap();
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  const handleToggleTopicActive = async (topicId: string, currentStatus: boolean) => {
    try {
      await updateTopic({
        id: topicId,
        data: { isActive: !currentStatus },
      }).unwrap();
    } catch (error) {
      console.error("Failed to update topic:", error);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-64 animate-pulse" />
        <div className="h-96 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {t("topics.manageTopics", "Manage Topics")}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
            {t("topics.manageTopicsSubtitle", "Edit and delete topics and questions")}
          </p>
        </div>
        <Link href="/topics/create">
          <Button>{t("topics.createTopic")}</Button>
        </Link>
      </div>

      {/* Topics Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("topics.title", "Title")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("topics.partNumber", "Part")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("topics.questions", "Questions")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("topics.status", "Status")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("topics.actions", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {topics && topics.length > 0 ? (
                topics.map((topic) => {
                  const questions = questionsByTopic[topic.id] ?? [];
                  return (
                    <tr key={topic.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {topic.title}
                        </div>
                        {topic.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {topic.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {topic.partNumber ? partLabels[topic.partNumber] : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {questions.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleTopicActive(topic.id, topic.isActive)}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            topic.isActive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {topic.isActive
                            ? t("topics.active", "Active")
                            : t("topics.inactive", "Inactive")}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/topics/${topic.id}/edit`}>
                            <Button variant="outline" size="sm">
                              {t("topics.edit", "Edit")}
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDeleteConfirm({ topicId: topic.id, topicTitle: topic.title })
                            }
                            className="text-error-500 hover:text-error-600"
                          >
                            {t("topics.delete", "Delete")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t("topics.noTopics", "No topics found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("topics.confirmDelete", "Confirm Delete")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t("topics.confirmDeleteMessage", "Are you sure you want to delete topic")}{" "}
              <strong>"{deleteConfirm.topicTitle}"</strong>?{" "}
              {t("topics.confirmDeleteWarning", "This action cannot be undone.")}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleDeleteTopic}
                isLoading={isDeletingTopic}
                className="flex-1 bg-error-500 hover:bg-error-600"
              >
                {t("topics.delete", "Delete")}
              </Button>
              <Button
                onClick={() => setDeleteConfirm(null)}
                variant="outline"
                className="flex-1"
                disabled={isDeletingTopic}
              >
                {t("topics.cancel", "Cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}









