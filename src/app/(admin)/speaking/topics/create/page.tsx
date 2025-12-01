"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { addTopic } from "@/store/topics";
import { SpeakingLevel } from "@/lib/api/speaking";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const speakingLevels: { value: SpeakingLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function CreateTopicPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [level, setLevel] = useState<SpeakingLevel>("intermediate");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !question.trim()) {
      setError("Please provide both a topic title and a question.");
      setSuccess(null);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      addTopic({
        title,
        question,
        level,
      });
      setSuccess("Topic created successfully.");
      setTitle("");
      setQuestion("");
      setLevel("intermediate");
      // Redirect to topics list after a short delay
      setTimeout(() => {
        router.push("/speaking/topics");
      }, 600);
    } catch {
      setError("Unable to save topic. Please try again.");
      setSuccess(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Speaking Topic" />
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-5 py-7 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Topic title
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Technology in daily life"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Level
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                value={level}
                onChange={(event) =>
                  setLevel(event.target.value as SpeakingLevel)
                }
              >
                {speakingLevels.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Question / Prompt
            </label>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Describe a piece of technology you use every day. You should say..."
              className="min-h-[160px] w-full rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : "Create topic"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/speaking/topics")}
              className="text-sm font-medium text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              View all topics
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


