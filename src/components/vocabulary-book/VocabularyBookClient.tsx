"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { useMeQuery } from "@/store/api/authApi";
import { useGetUserVocabularyQuery } from "@/store/api/userVocabularyApi";

function getWord(v: any): string {
  return (
    v?.word ??
    v?.Word ??
    v?.vocabulary?.word ??
    v?.vocabulary?.Word ??
    v?.vocabulary?.term ??
    ""
  );
}

function getPhonetic(v: any): string | null {
  return (
    v?.phonetic ??
    v?.Phonetic ??
    v?.vocabulary?.phonetic ??
    v?.vocabulary?.Phonetic ??
    v?.vocabulary?.pronunciation ??
    null
  );
}

function getDefinitionEn(v: any): string | null {
  return (
    v?.definitionEn ??
    v?.DefinitionEn ??
    v?.definition ??
    v?.vocabulary?.definitionEn ??
    v?.vocabulary?.DefinitionEn ??
    v?.vocabulary?.definition ??
    null
  );
}

function getDefinitionVi(v: any): string | null {
  return (
    v?.definitionVi ??
    v?.DefinitionVi ??
    v?.vietnameseMeaning ??
    v?.vocabulary?.definitionVi ??
    v?.vocabulary?.DefinitionVi ??
    v?.vocabulary?.vietnameseMeaning ??
    null
  );
}

function getExamples(v: any): string[] {
  const ex =
    v?.exampleSentences ??
    v?.vocabulary?.exampleSentences ??
    v?.examples ??
    v?.vocabulary?.examples ??
    null;
  if (Array.isArray(ex)) return ex.filter((x) => typeof x === "string");
  const single = v?.example ?? v?.vocabulary?.example;
  if (typeof single === "string" && single.trim()) return [single.trim()];
  return [];
}

export default function VocabularyBookClient() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const { data: me } = useMeQuery(undefined, { skip: !!user });
  const displayUser = user ?? me;

  const userId = displayUser?.id;

  const {
    data: items,
    isLoading,
    error,
    refetch,
  } = useGetUserVocabularyQuery(userId as string, {
    skip: !userId,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("speaking.vocabularyBook", "Sổ từ vựng")}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t(
                "vocabularyBook.subtitle",
                "Tất cả từ vựng bạn đã lưu để ôn tập."
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-brand-500 dark:hover:text-brand-400"
            >
              {t("common.refresh", "Tải lại")}
            </button>
            <Link
              href="/dashboard"
              className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              {t("common.back", "Quay lại")}
            </Link>
          </div>
        </div>
      </div>

      {!userId ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          {t("common.loading", "Đang tải...")}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
          <div className="font-semibold">
            {t("vocabularyBook.loadFailed", "Không thể tải sổ từ vựng")}
          </div>
          <div className="mt-1">{String((error as any)?.data?.message ?? "")}</div>
        </div>
      ) : isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          {t("common.loading", "Đang tải...")}
        </div>
      ) : (items ?? []).length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          {t(
            "vocabularyBook.empty",
            "Bạn chưa lưu từ nào. Hãy bấm “Lưu” trong phần Generate Vocabulary để thêm vào sổ."
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {(items ?? []).map((uv: any) => {
            const word = getWord(uv) || getWord(uv?.vocabulary) || uv?.vocabularyId || "Word";
            const phonetic = getPhonetic(uv) || getPhonetic(uv?.vocabulary);
            const defEn = getDefinitionEn(uv) || getDefinitionEn(uv?.vocabulary);
            const defVi = getDefinitionVi(uv) || getDefinitionVi(uv?.vocabulary);
            const examples = getExamples(uv) ?? [];

            return (
              <div
                key={uv.id ?? `${uv.userId}-${uv.vocabularyId}-${word}`}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {word}
                      </h3>
                      {phonetic ? (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {phonetic}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <span className="flex-shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                    {uv.learningStatus ?? "new"}
                  </span>
                </div>

                {defEn ? (
                  <p className="mt-3 text-sm text-gray-800 dark:text-gray-200">
                    {defEn}
                  </p>
                ) : null}

                {defVi ? (
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">VI:</span> {defVi}
                  </p>
                ) : null}

                {examples.length > 0 ? (
                  <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Ex:</span>{" "}
                    <span className="italic">{examples[0]}</span>
                  </div>
                ) : null}

                {uv.personalNotes ? (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                    <span className="font-semibold">
                      {t("vocabularyBook.notes", "Ghi chú")}:
                    </span>{" "}
                    {uv.personalNotes}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

