"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AchievementCard from "./AchievementCard";
import AchievementFormModal from "./AchievementFormModal";
import {
  useGetAllAchievementsQuery,
  useDeleteAchievementMutation,
  AchievementDto,
} from "@/store/api/achievementApi";
import RequireAdmin from "../auth/RequireAdmin";

const AchievementsManageShell: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] =
    useState<AchievementDto | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);

  const { data: achievements = [], isLoading, refetch } = useGetAllAchievementsQuery();
  const [deleteAchievement] = useDeleteAchievementMutation();

  const handleCreate = () => {
    setSelectedAchievement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (achievement: AchievementDto) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
  };

  const handleDelete = async (achievement: AchievementDto) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa thành tựu "${achievement.title}"?`
      )
    ) {
      return;
    }

    try {
      await deleteAchievement(achievement.id).unwrap();
      refetch();
    } catch (error: any) {
      alert(error?.data?.message || "Không thể xóa thành tựu");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAchievement(null);
  };

  const handleSuccess = () => {
    refetch();
  };

  // Filter achievements
  const filteredAchievements = achievements.filter((achievement) => {
    if (!showInactive && !achievement.isActive) return false;
    if (filterType !== "all" && achievement.achievementType !== filterType)
      return false;
    return true;
  });

  // Group by type
  const groupedAchievements = filteredAchievements.reduce((acc, achievement) => {
    const type = achievement.achievementType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(achievement);
    return acc;
  }, {} as Record<string, AchievementDto[]>);

  const achievementTypes = [
    { value: "all", label: "Tất cả", count: filteredAchievements.length },
    {
      value: "milestone",
      label: "Milestone",
      count: achievements.filter((a) => a.achievementType === "milestone").length,
    },
    {
      value: "streak",
      label: "Streak",
      count: achievements.filter((a) => a.achievementType === "streak").length,
    },
    {
      value: "score",
      label: "Score",
      count: achievements.filter((a) => a.achievementType === "score").length,
    },
    {
      value: "practice",
      label: "Practice",
      count: achievements.filter((a) => a.achievementType === "practice").length,
    },
    {
      value: "special",
      label: "Special",
      count: achievements.filter((a) => a.achievementType === "special").length,
    },
  ];

  return (
    <RequireAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("achievements.title", "Quản lý thành tựu")}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t(
                "achievements.subtitle",
                "Tạo và quản lý các thành tựu trong hệ thống"
              )}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("achievements.create", "Tạo thành tựu")}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Tổng số
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {achievements.length}
            </div>
          </div>
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Đang hoạt động
            </div>
            <div className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              {achievements.filter((a) => a.isActive).length}
            </div>
          </div>
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Tạm dừng
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-600 dark:text-gray-400">
              {achievements.filter((a) => !a.isActive).length}
            </div>
          </div>
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Tổng điểm
            </div>
            <div className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {achievements.reduce((sum, a) => sum + a.points, 0)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {achievementTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filterType === type.value
                      ? "bg-brand-600 text-white dark:bg-brand-500"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {type.label} ({type.count})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showInactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label
                htmlFor="showInactive"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Hiện thành tựu tạm dừng
              </label>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <svg
              className="h-8 w-8 animate-spin text-brand-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {/* Achievements List */}
        {!isLoading && filteredAchievements.length === 0 && (
          <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chưa có thành tựu nào
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {filterType === "all"
                ? "Bắt đầu bằng cách tạo thành tựu đầu tiên"
                : "Không tìm thấy thành tựu với bộ lọc hiện tại"}
            </p>
          </div>
        )}

        {!isLoading && filterType === "all" && filteredAchievements.length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedAchievements).map(([type, items]) => (
              <div key={type}>
                <h2 className="mb-4 text-xl font-semibold capitalize text-gray-900 dark:text-white">
                  {type} ({items.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isAdmin={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filterType !== "all" && filteredAchievements.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isAdmin={true}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <AchievementFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          achievement={selectedAchievement}
          onSuccess={handleSuccess}
        />
      </div>
    </RequireAdmin>
  );
};

export default AchievementsManageShell;














