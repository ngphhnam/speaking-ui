"use client";

import React from "react";
import Image from "next/image";
import { AchievementDto } from "@/store/api/achievementApi";

interface AchievementCardProps {
  achievement: AchievementDto;
  onEdit?: (achievement: AchievementDto) => void;
  onDelete?: (achievement: AchievementDto) => void;
  isAdmin?: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onEdit,
  onDelete,
  isAdmin = false,
}) => {
  const typeColors = {
    milestone: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    streak: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    score: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    practice: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    special: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  };

  return (
    <div
      className={`rounded-xl border-2 p-5 transition ${
        achievement.isActive
          ? "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          : "border-gray-300 bg-gray-100 opacity-60 dark:border-gray-700 dark:bg-gray-800/50"
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

            {/* Status Badge */}
            {!achievement.isActive && (
              <span className="flex-shrink-0 inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                Inactive
              </span>
            )}
          </div>

          {/* Type & Points */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                typeColors[achievement.achievementType]
              }`}
            >
              {achievement.achievementType}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              <svg
                className="h-4 w-4 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {achievement.points} điểm
            </span>
          </div>

          {/* Admin Actions */}
          {isAdmin && (onEdit || onDelete) && (
            <div className="mt-4 flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(achievement)}
                  className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Chỉnh sửa
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(achievement)}
                  className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Xóa
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;



