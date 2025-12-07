"use client";

import { useState, useEffect } from "react";
import { useGetTopicByIdQuery } from "@/store/api/topicApi";
import { useGetQuestionsQuery, useDeleteQuestionMutation, useUpdateQuestionMutation } from "@/store/api/questionApi";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Modal } from "@/components/ui/modal";

type QuestionsManageProps = {
  topicId: string;
};

export default function QuestionsManage({ topicId }: QuestionsManageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ questionId: string; questionText: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: topic, isLoading: isLoadingTopic } = useGetTopicByIdQuery(topicId);
  const { data: questions, isLoading: isLoadingQuestions } = useGetQuestionsQuery(
    { topicId, includeInactive: true },
    { skip: !mounted }
  );

  const [deleteQuestion, { isLoading: isDeleting }] = useDeleteQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();

  const isLoading = isLoadingTopic || isLoadingQuestions;

  const handleDeleteQuestion = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteQuestion(deleteConfirm.questionId).unwrap();
      setDeleteConfirm(null);
      setOpenDropdownId(null);
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  const handleToggleActive = async (questionId: string, currentStatus: boolean) => {
    try {
      await updateQuestion({
        id: questionId,
        data: { isActive: !currentStatus },
      }).unwrap();
    } catch (error) {
      console.error("Failed to update question:", error);
    }
  };

  const toggleDropdown = (questionId: string) => {
    setOpenDropdownId((prev) => (prev === questionId ? null : questionId));
  };

  if (!mounted || isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-64 animate-pulse" />
        <div className="h-96 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t("topics.topicNotFound", "Topic not found")}
          </p>
          <Link href="/topics">
            <Button variant="outline">{t("topics.backToTopics", "Back to Topics")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/topics"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2"
          >
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("topics.backToTopics", "Back to Topics")}
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {t("topics.manageQuestions", "Manage Questions")}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
            {t("topics.manageQuestionsSubtitle", "Manage questions for")}: <span className="font-medium">{topic.title}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/topics/${topicId}`}>
            <Button variant="outline">{t("topics.viewTopic", "View Topic")}</Button>
          </Link>
          <Link href={`/topics/${topicId}/questions/create`}>
            <Button>{t("topics.addQuestion", "Add Question")}</Button>
          </Link>
        </div>
      </div>

      {/* Questions Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("topics.questionText", "Question Text")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("topics.questionType", "Question Type")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("topics.attempts", "Attempts")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("topics.avgScore", "Avg Score")}
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
              {questions && questions.length > 0 ? (
                questions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {question.questionText}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {question.questionType ? (
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                          {question.questionType}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {question.attemptsCount ?? 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {typeof question.avgScore === "number" ? question.avgScore.toFixed(1) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(question.id, question.isActive)}
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          question.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {question.isActive ? t("topics.active", "Active") : t("topics.inactive", "Inactive")}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => toggleDropdown(question.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          aria-label="Question options"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                        <Dropdown
                          isOpen={openDropdownId === question.id}
                          onClose={() => setOpenDropdownId(null)}
                          className="w-48"
                        >
                          <ul className="py-1">
                            <li>
                              <DropdownItem
                                tag="a"
                                href={`/topics/${topicId}/questions/${question.id}/edit`}
                                onItemClick={() => setOpenDropdownId(null)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                {t("topics.edit", "Edit")}
                              </DropdownItem>
                            </li>
                            <li>
                              <DropdownItem
                                tag="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeleteConfirm({ questionId: question.id, questionText: question.questionText });
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {t("topics.delete", "Delete")}
                              </DropdownItem>
                            </li>
                          </ul>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("topics.noQuestions", "This topic doesn't have any questions yet.")}
                    </p>
                    <Link href={`/topics/${topicId}/questions/create`} className="mt-4 inline-block">
                      <Button size="sm" variant="outline">
                        {t("topics.addFirstQuestion", "Add First Question")}
                      </Button>
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        className="max-w-md p-6"
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {t("topics.deleteQuestion", "Delete Question")}
        </h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          {t("topics.deleteQuestionConfirm", "Are you sure you want to delete this question?")}
        </p>
        {deleteConfirm && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
              {deleteConfirm.questionText}
            </p>
          </div>
        )}
        <p className="mb-6 text-xs text-gray-500 dark:text-gray-400">
          {t("topics.deleteQuestionWarning", "This action cannot be undone.")}
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeleteConfirm(null)}
            disabled={isDeleting}
          >
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDeleteQuestion}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? t("topics.deleting", "Deleting...") : t("topics.delete", "Delete")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

