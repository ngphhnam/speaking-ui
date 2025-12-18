"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { UserStatistics } from "@/store/api/statisticsApi";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type SkillsRadarProps = {
  statistics: UserStatistics;
};

export default function SkillsRadar({ statistics }: SkillsRadarProps) {
  const { t } = useTranslation();

  const options: ApexOptions = {
    chart: {
      type: "radar",
      toolbar: {
        show: false,
      },
    },
    colors: ["#6366F1"],
    xaxis: {
      categories: [
        t("dashboard.fluency", "Lưu loát"),
        t("dashboard.vocabulary", "Từ vựng"),
        t("dashboard.grammar", "Ngữ pháp"),
        t("dashboard.pronunciation", "Phát âm"),
      ],
      labels: {
        style: {
          colors: ["#6B7280", "#6B7280", "#6B7280", "#6B7280"],
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      min: 0,
      max: 9,
      tickAmount: 3,
      labels: {
        style: {
          colors: "#6B7280",
        },
      },
    },
    plotOptions: {
      radar: {
        size: 140,
        polygons: {
          strokeColors: "#e5e7eb",
          fill: {
            colors: ["#f9fafb", "#f3f4f6"],
          },
        },
      },
    },
    fill: {
      opacity: 0.3,
    },
    stroke: {
      width: 2,
    },
    markers: {
      size: 4,
      colors: ["#6366F1"],
      strokeColors: "#fff",
      strokeWidth: 2,
    },
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: t("dashboard.score", "Điểm"),
      data: [
        statistics.scoresBySkill.fluency,
        statistics.scoresBySkill.vocabulary,
        statistics.scoresBySkill.grammar,
        statistics.scoresBySkill.pronunciation,
      ],
    },
  ];

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {t("dashboard.skillsBreakdown", "Phân tích kỹ năng")}
      </h3>
      <div className="flex justify-center">
        <ReactApexChart options={options} series={series} type="radar" height={300} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t("dashboard.fluency", "Lưu loát")}
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
            {statistics.scoresBySkill.fluency.toFixed(1)}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t("dashboard.vocabulary", "Từ vựng")}
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
            {statistics.scoresBySkill.vocabulary.toFixed(1)}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t("dashboard.grammar", "Ngữ pháp")}
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
            {statistics.scoresBySkill.grammar.toFixed(1)}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t("dashboard.pronunciation", "Phát âm")}
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
            {statistics.scoresBySkill.pronunciation.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}








