"use client";

import { useState, useEffect, useMemo } from "react";
import { useGetTopicsQuery } from "@/store/api/topicApi";
import { useGetQuestionsQuery } from "@/store/api/questionApi";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Button from "@/components/ui/button/Button";

const partLabels: Record<number, string> = {
  1: "Part 1: Introduction & Interview",
  2: "Part 2: Long Turn",
  3: "Part 3: Discussion",
};

export default function PracticeByQuestions() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [selectedPart, setSelectedPart] = useState<number | null>(1); // Default to Part 1
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [hideAnswered, setHideAnswered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileTopicsOpen, setIsMobileTopicsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: topics, isLoading: isLoadingTopics } = useGetTopicsQuery(
    {
      partNumber: selectedPart ?? undefined,
      includeInactive: false,
    },
    { skip: !mounted }
  );

  // Fetch questions for all topics
  const topicIds = useMemo(() => (topics ?? []).map((t) => t.id), [topics]);
  
  // We'll fetch questions per topic as needed, or we can batch fetch
  // For now, let's fetch questions for visible topics
  const { data: allQuestions } = useGetQuestionsQuery(
    { includeInactive: false },
    { skip: !mounted }
  );

  // Group questions by topic
  const questionsByTopic = useMemo(() => {
    if (!allQuestions || !topics) return {};
    const grouped: Record<string, typeof allQuestions> = {};
    topics.forEach((topic) => {
      grouped[topic.id] = (allQuestions ?? []).filter(
        (q) => q.topicId === topic.id
      );
    });
    return grouped;
  }, [allQuestions, topics]);

  // Filter topics and questions based on search and selected topic
  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    let filtered = topics;

    // Filter by selected topic
    if (selectedTopicId) {
      filtered = filtered.filter((topic) => topic.id === selectedTopicId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (topic) =>
          topic.title.toLowerCase().includes(query) ||
          (topic.description && topic.description.toLowerCase().includes(query)) ||
          (questionsByTopic[topic.id]?.some((q) =>
            q.questionText.toLowerCase().includes(query)
          ) ?? false)
      );
    }

    return filtered;
  }, [topics, searchQuery, selectedTopicId, questionsByTopic]);

  const parts = useMemo(() => {
    const partsSet = new Set<number>();
    (topics ?? []).forEach((topic) => {
      if (topic.partNumber) partsSet.add(topic.partNumber);
    });
    return Array.from(partsSet).sort();
  }, [topics]);

  if (!mounted || isLoadingTopics) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-64 animate-pulse" />
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-48 animate-pulse" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((j) => (
                  <div
                    key={j}
                    className="h-32 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Topics Sidebar */}
      <aside
        className={`${
          isMobileTopicsOpen ? "block" : "hidden"
        } lg:block w-full lg:w-64 flex-shrink-0 fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-auto bg-white dark:bg-gray-900 lg:bg-transparent`}
      >
        {isMobileTopicsOpen && (
          <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("practice.byQuestions.topicsList", "Topics")}
            </h2>
            <button
              onClick={() => setIsMobileTopicsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        <div className="sticky top-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t("practice.byQuestions.topicsList", "Topics")}
              </h2>
            </div>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {isLoadingTopics ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"
                    />
                  ))}
                </div>
              ) : topics && topics.length > 0 ? (
                <ul className="p-2">
                  <li>
                    <button
                      onClick={() => setSelectedTopicId(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                        selectedTopicId === null
                          ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      {t("practice.byQuestions.allTopics", "All Topics")}
                    </button>
                  </li>
                  {topics.map((topic) => {
                    const questionCount = questionsByTopic[topic.id]?.length ?? 0;
                    return (
                      <li key={topic.id} className="mt-1">
                        <button
                          onClick={() => setSelectedTopicId(topic.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                            selectedTopicId === topic.id
                              ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{topic.title}</span>
                            {questionCount > 0 && (
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                {questionCount}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t("practice.byQuestions.noTopicsAvailable", "No topics available")}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileTopicsOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileTopicsOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Part Selection Tabs - Top Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
          <button
            onClick={() => setSelectedPart(1)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedPart === 1
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 border border-transparent"
            }`}
          >
            {t("practice.byQuestions.part1", "Luyện Part 1")}
          </button>
          <button
            onClick={() => setSelectedPart(2)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedPart === 2
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 border border-transparent"
            }`}
          >
            {t("practice.byQuestions.part2", "Luyện Part 2")}
          </button>
          <button
            onClick={() => setSelectedPart(3)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedPart === 3
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 border border-transparent"
            }`}
          >
            {t("practice.byQuestions.part3", "Luyện Part 3")}
          </button>
        </div>

        {/* Search and Filter Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideAnswered}
                onChange={(e) => setHideAnswered(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t("practice.byQuestions.hideAnswered", "Ẩn câu đã trả lời")}
              </span>
            </label>
            <div className="relative flex-1 sm:max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("practice.byQuestions.searchPlaceholder", "Tìm câu hỏi")}
                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm text-gray-900 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          {/* Mobile Topics Toggle Button */}
          <div className="lg:hidden">
            <Button
              type="button"
              onClick={() => setIsMobileTopicsOpen(!isMobileTopicsOpen)}
              variant="outline"
              size="sm"
            >
              {t("practice.byQuestions.showTopics", "Show Topics")}
            </Button>
          </div>
        </div>

      {/* Topics with Questions */}
      {filteredTopics.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("practice.byQuestions.noTopics")}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {searchQuery
              ? t("practice.byQuestions.noTopicsSearch")
              : t("practice.byQuestions.noTopicsFilter")}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredTopics.map((topic) => {
            const questions = questionsByTopic[topic.id] ?? [];
            const visibleQuestions = hideAnswered
              ? questions.filter((q) => !q.attemptsCount || q.attemptsCount === 0)
              : questions;

            if (visibleQuestions.length === 0) return null;

            return (
              <div
                key={topic.id}
                className="rounded-xl border-2 border-purple-200 bg-white p-6 shadow-sm dark:border-purple-800 dark:bg-gray-900"
              >
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  {topic.title}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {visibleQuestions.map((question) => (
                    <Link
                      key={question.id}
                      href={`/topics/${topic.id}?questionId=${question.id}`}
                      className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500"
                    >
                      <p className="text-sm text-gray-900 dark:text-white line-clamp-3 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                        {question.questionText}
                      </p>
                      {question.attemptsCount && question.attemptsCount > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            {t("practice.byQuestions.answered")}
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Link href={`/topics/${topic.id}`}>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-pink-500 hover:bg-pink-600 text-white border-0"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {t("practice.byQuestions.practiceTopic", "Luyện topic này")}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

