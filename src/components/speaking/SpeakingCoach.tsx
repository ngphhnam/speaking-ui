"use client";

import { useTranslation } from "react-i18next";

const SpeakingCoach = () => {
  const { t } = useTranslation();

  const forecastItems = [
    { label: t("speaking.forecastPart", { part: 1 }), value: 15, total: 203 },
    { label: t("speaking.forecastPart", { part: 2 }), value: 0, total: 78 },
    { label: t("speaking.forecastPart", { part: 3 }), value: 0, total: 234 },
    ];

  return (
    <div className="space-y-8">
      {/* Top title */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          {t("speaking.titleBadge")}
        </p>
        <h1 className="text-2xl font-semibold text-gray-900">
          {t("speaking.title")}
        </h1>
      </div>

      {/* Top row: mission card + calendar / forecast */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
        {/* Today mission + streak + error table */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {t("speaking.todayMission")}
                </p>
                <p className="mt-1 text-base text-gray-800">
                  {t("speaking.todayMissionText", { count: 25 })}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {t("speaking.todayMissionHint")}
            </p>
          </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-brand-100 bg-gray-50">
                <div className="text-center">
                  <p className="text-3xl font-semibold text-brand-600">0</p>
                  <p className="text-[10px] font-medium text-gray-500">/25</p>
                </div>
              </div>
            </div>
              </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {t("speaking.streakTitle")}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {t("speaking.streakSubtitle")}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {t("speaking.streakDetail", { days: 0 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-brand-600">0</p>
              </div>
            </div>

            {/* Error rate mini table */}
            <div className="mt-5 border-t border-gray-100 pt-4">
              <div className="mb-2 flex items-center text-xs font-medium text-gray-500">
                <span className="w-6">#</span>
                <span className="flex-1">
                  {t("speaking.errorTableHeaderSound")}
                </span>
                <span className="w-16 text-right">
                  {t("speaking.errorTableHeaderErrorRate")}
                </span>
                <span className="w-16" />
              </div>
              <div className="flex items-center rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
                <span className="w-6">1</span>
                <button className="flex-1 text-brand-600 underline-offset-2 hover:underline">
                  /dʒ/
                </button>
                <span className="w-16 text-right">43%</span>
                <button className="ml-2 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-medium text-brand-700 hover:bg-brand-100">
                  {t("speaking.errorTableFix")}
            </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar heatmap + forecast */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between text-xs text-gray-600">
              <p>
                {t("speaking.calendarMonths")}
              </p>
            </div>
            {/* Placeholder calendar heatmap grid */}
            <div className="grid grid-cols-14 gap-1">
              {Array.from({ length: 70 }).map((_, index) => (
                <span
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className="h-3 w-3 rounded-sm bg-gray-100"
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between text-xs text-gray-600">
              <p className="font-medium">{t("speaking.forecastTitle")}</p>
              <p className="text-[11px] text-gray-400">
                {t("speaking.forecastUpdated")}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {forecastItems.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="font-medium text-gray-700">{item.label}</p>
                    <p className="text-[11px] text-gray-500">
                      {item.value}/{item.total}
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{
                        width: `${(item.value / item.total) * 100}%`,
                      }}
                    />
                  </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom features row */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {t("speaking.practiceBySentence")}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {t("speaking.practiceBySentenceDesc")}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <button className="rounded-full bg-brand-50 px-4 py-2 font-medium text-brand-700 hover:bg-brand-100">
                PART 1 &gt;
              </button>
              <button className="rounded-full bg-brand-50 px-4 py-2 font-medium text-brand-700 hover:bg-brand-100">
                PART 2 &gt;
              </button>
              <button className="rounded-full bg-brand-50 px-4 py-2 font-medium text-brand-700 hover:bg-brand-100">
                PART 3 &gt;
              </button>
              <button className="rounded-full border border-dashed border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
                {t("speaking.customSentence")}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {t("speaking.mockExamTitle")}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {t("speaking.mockExamDesc")}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <button className="rounded-full bg-pink-50 px-4 py-2 font-medium text-pink-700 hover:bg-pink-100">
                PART 1 &gt;
              </button>
              <button className="rounded-full bg-pink-50 px-4 py-2 font-medium text-pink-700 hover:bg-pink-100">
                PART 2 &gt;
              </button>
              <button className="rounded-full bg-pink-50 px-4 py-2 font-medium text-pink-700 hover:bg-pink-100">
                PART 3 &gt;
              </button>
              <button className="rounded-full bg-pink-500 px-4 py-2 font-medium text-white hover:bg-pink-600">
                {t("speaking.fullTest")} &gt;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom small cards */}
      <section className="flex flex-wrap gap-4">
        <button className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            P
          </span>
          {t("speaking.pronunciationCourse")}
        </button>
        <button className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            S
          </span>
          {t("speaking.vocabularyBook")}
        </button>
      </section>
    </div>
  );
};

export default SpeakingCoach;

