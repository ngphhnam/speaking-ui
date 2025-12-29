"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetAllAchievementsQuery,
  useGetUserAchievementsQuery,
  useGetCompletedAchievementsQuery,
  useGetInProgressAchievementsQuery,
} from "@/store/api/achievementApi";
import { useAppSelector } from "@/store/hooks";
import Image from "next/image";

const UserAchievementsDisplay: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id || "";

  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "inProgress">("all");

  const { data: allAchievements = [] } = useGetAllAchievementsQuery();
  const { data: userAchievements = [] } = useGetUserAchievementsQuery(userId, {
    skip: !userId,
  });
  const { data: completedAchievements = [] } = useGetCompletedAchievementsQuery(
    userId,
    { skip: !userId }
  );
  const { data: inProgressAchievements = [] } = useGetInProgressAchievementsQuery(
    userId,
    { skip: !userId }
  );

  const totalPoints = completedAchievements.reduce(
    (sum, ua) => sum + ua.earnedPoints,
    0
  );

  const getFilteredAchievements = () => {
    if (filterStatus === "completed") {
      return completedAchievements;
    }
    if (filterStatus === "inProgress") {
      return inProgressAchievements;
    }
    return userAchievements;
  };

  const filteredData = getFilteredAchievements();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("achievements.myAchievements", "Thành tựu của tôi")}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t("achievements.trackProgress", "Theo dõi tiến trình và hoàn thành thành tựu")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Tổng thành tựu
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {allAchievements.length}
          </div>
        </div>
        <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Đã đạt được
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
            {completedAchievements.length}
          </div>
        </div>
        <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Đang tiến hành
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {inProgressAchievements.length}
          </div>
        </div>
        <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Tổng điểm
          </div>
          <div className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {totalPoints}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            filterStatus === "all"
              ? "bg-brand-600 text-white dark:bg-brand-500"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Tất cả ({userAchievements.length})
        </button>
        <button
          onClick={() => setFilterStatus("completed")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            filterStatus === "completed"
              ? "bg-brand-600 text-white dark:bg-brand-500"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Đã hoàn thành ({completedAchievements.length})
        </button>
        <button
          onClick={() => setFilterStatus("inProgress")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            filterStatus === "inProgress"
              ? "bg-brand-600 text-white dark:bg-brand-500"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Đang tiến hành ({inProgressAchievements.length})
        </button>
      </div>

      {/* Achievements Grid */}
      {filteredData.length === 0 ? (
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
            Chưa có thành tựu
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Bắt đầu luyện tập để mở khóa các thành tựu!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredData.map((userAchievement) => {
            const achievement = userAchievement.achievement;
            if (!achievement) return null;

            return (
              <div
                key={userAchievement.id}
                className={`rounded-xl border-2 p-5 transition ${
                  userAchievement.isCompleted
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                    : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Badge Icon */}
                  <div className="flex-shrink-0">
                    {achievement.badgeIconUrl ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-700">
                        <Image
                          src={achievement.badgeIconUrl}
                          alt={achievement.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-2xl text-white">
                        🏆
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {achievement.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {achievement.description}
                        </p>
                      </div>

                      {/* Completed Badge */}
                      {userAchievement.isCompleted && (
                        <svg
                          className="h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {!userAchievement.isCompleted && (
                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            Tiến độ
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {userAchievement.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-brand-600 transition-all dark:bg-brand-500"
                            style={{ width: `${userAchievement.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Points & Date */}
                    <div className="mt-3 flex items-center gap-3 flex-wrap text-sm">
                      <span className="inline-flex items-center gap-1 font-medium text-yellow-600 dark:text-yellow-400">
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {achievement.points} điểm
                      </span>
                      {userAchievement.completedAt && (
                        <span className="text-gray-600 dark:text-gray-400">
                          Đạt được:{" "}
                          {new Date(userAchievement.completedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserAchievementsDisplay;














