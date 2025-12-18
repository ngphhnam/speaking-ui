"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { UserStatistics } from "@/store/api/statisticsApi";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type ProgressChartProps = {
  statistics: UserStatistics;
};

export default function ProgressChart({ statistics }: ProgressChartProps) {
  const { t } = useTranslation();

  const chartData = statistics.progressByMonth.map((item) => ({
    month: item.month,
    score: item.averageScore,
    count: item.totalRecordings,
  }));

  const options: ApexOptions = {
    chart: {
      fontFamily: "Inter, sans-serif",
      type: "line",
      height: 350,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ["#6366F1", "#10B981"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
    xaxis: {
      categories: chartData.map((d) => d.month),
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: [
      {
        title: {
          text: t("dashboard.averageScore", "Điểm TB"),
          style: {
            color: "#6366F1",
            fontSize: "12px",
            fontWeight: 600,
          },
        },
        min: 0,
        max: 9,
        labels: {
          style: {
            colors: "#6B7280",
          },
        },
      },
      {
        opposite: true,
        title: {
          text: t("dashboard.recordings", "Số bài"),
          style: {
            color: "#10B981",
            fontSize: "12px",
            fontWeight: 600,
          },
        },
        labels: {
          style: {
            colors: "#6B7280",
          },
        },
      },
    ],
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "#6B7280",
      },
    },
    tooltip: {
      theme: "light",
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => val.toFixed(1),
      },
    },
  };

  const series = [
    {
      name: t("dashboard.averageScore", "Điểm trung bình"),
      data: chartData.map((d) => d.score),
    },
    {
      name: t("dashboard.totalRecordings", "Số bài làm"),
      data: chartData.map((d) => d.count),
    },
  ];

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
        {t("dashboard.progressChart", "Biểu đồ tiến độ")}
      </h3>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
}








