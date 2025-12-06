"use client";

import { useMemo, useState, useEffect } from "react";
import { useGetTopicsQuery, useGetPopularTopicsQuery } from "@/store/api/topicApi";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  advanced: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const partLabels: Record<number, string> = {
  1: "Part 1: Introduction & Interview",
  2: "Part 2: Long Turn",
  3: "Part 3: Discussion",
};

export default function TopicsBrowse() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "popular">("all");
  const [partFilter, setPartFilter] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: allTopics, isLoading: isLoadingAll, error: errorAll } = useGetTopicsQuery(
    {
      partNumber: partFilter ?? undefined,
      category: categoryFilter || undefined,
      includeInactive: false,
    },
    { skip: !mounted }
  );

  const { data: popularTopics, isLoading: isLoadingPopular } = useGetPopularTopicsQuery(10, {
    skip: !mounted || filter !== "popular",
  });

  const topics = useMemo(() => {
    if (filter === "popular") return popularTopics ?? [];
    return allTopics ?? [];
  }, [filter, allTopics, popularTopics]);

  const isLoading = filter === "popular" ? isLoadingPopular : isLoadingAll;
  const error = filter === "all" ? errorAll : null;

  const categories = useMemo(() => {
    const cats = new Set<string>();
    (allTopics ?? []).forEach((topic) => {
      if (topic.topicCategory) cats.add(topic.topicCategory);
    });
    return Array.from(cats).sort();
  }, [allTopics]);

  const parts = useMemo(() => {
    const partsSet = new Set<number>();
    (allTopics ?? []).forEach((topic) => {
      if (topic.partNumber) partsSet.add(topic.partNumber);
    });
    return Array.from(partsSet).sort();
  }, [allTopics]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
              {t("topics.pageTitle")}
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
              {t("topics.pageSubtitle")}
            </p>
          </div>
          <Link href="/topics/create">
            <Button>{t("topics.createTopic")}</Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 mb-3" />
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t("topics.loadingErrorTitle")}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {error.status === "FETCH_ERROR"
              ? t("topics.loadingErrorOffline")
              : t("topics.loadingErrorStatus", { status: error.status })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {t("topics.pageTitle")}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
            {t("topics.pageSubtitle")}
          </p>
        </div>
        {isAdmin && (
        <Link href="/topics/create">
            <Button>{t("topics.createTopic")}</Button>
        </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            setFilter("all");
            setPartFilter(null);
            setCategoryFilter("");
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "all"
              ? "bg-brand-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {t("topics.allTopics")}
        </button>
        <button
          onClick={() => setFilter("popular")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "popular"
              ? "bg-brand-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {t("topics.popular")}
        </button>
      </div>

      {filter === "all" && (
        <div className="flex flex-wrap gap-3">
          <select
            value={partFilter ?? ""}
            onChange={(e) => setPartFilter(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">{t("topics.allParts")}</option>
            {parts.map((part) => (
              <option key={part} value={part}>
                {partLabels[part] ?? t("topics.partLabel", { part })}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">{t("topics.allCategories")}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 mb-3" />
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("topics.noTopicsTitle")}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {filter === "popular"
              ? t("topics.noTopicsPopular")
              : t("topics.noTopicsAll")}
          </p>
          {filter === "all" && (
            <Link href="/topics/create">
              <Button>{t("topics.createFirstTopic")}</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500"
            >
              <Link href={`/topics/${topic.id}`} className="block">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  {topic.title}
                </h3>
                {topic.partNumber && (
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 whitespace-nowrap">
                    Part {topic.partNumber}
                  </span>
                )}
              </div>

              {topic.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {topic.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {topic.difficultyLevel && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      difficultyColors[topic.difficultyLevel.toLowerCase()] ??
                      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {topic.difficultyLevel}
                  </span>
                )}
                {topic.topicCategory && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {topic.topicCategory}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {topic.questions?.length ?? 0} question
                  {(topic.questions?.length ?? 0) !== 1 ? "s" : ""}
                </span>
                {topic.avgUserRating && (
                  <span className="flex items-center gap-1">
                    <span>★</span>
                    {topic.avgUserRating.toFixed(1)}
                  </span>
                )}
              </div>
            </Link>
              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Link href={`/topics/${topic.id}/questions/create`}>
                    <Button size="sm" variant="outline" className="w-full">
                      {t("topics.addQuestion")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

