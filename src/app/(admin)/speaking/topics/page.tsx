"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import {
  persistSelectedTopic,
  readTopics,
  SpeakingTopic,
} from "@/store/topics";
import { useRouter } from "next/navigation";

export default function SpeakingTopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<SpeakingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = readTopics();
    setTopics(stored);
    setIsLoading(false);
  }, []);

  const handleUseTopic = (topic: SpeakingTopic) => {
    persistSelectedTopic(topic);
    router.push("/speaking");
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Speaking Topics" />
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Choose a topic to practice. Your choice will be sent to the speaking
            page.
          </p>
          <button
            type="button"
            onClick={() => router.push("/speaking/topics/create")}
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            + New topic
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-7">
          {isLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading topics…
            </p>
          ) : topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No topics have been created yet.
              </p>
              <button
                type="button"
                onClick={() => router.push("/speaking/topics/create")}
                className="inline-flex items-center justify-center rounded-xl border border-dashed border-brand-300 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200"
              >
                Create your first topic
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topics.map((topic) => (
                <article
                  key={topic.id}
                  className="flex flex-col justify-between rounded-xl border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-800 shadow-sm transition hover:border-brand-400 hover:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {topic.title}
                      </h3>
                      {topic.level && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                          {topic.level}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-4 text-xs text-gray-600 dark:text-gray-300">
                      {topic.question}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      Created{" "}
                      {new Date(topic.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleUseTopic(topic)}
                      className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-brand-700"
                    >
                      Use this topic
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


