"use client";

import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/modal";
import type { StreakData } from "@/store/api/answerApi";

type StreakNotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  streak: StreakData;
};

export default function StreakNotificationModal({
  isOpen,
  onClose,
  streak,
}: StreakNotificationModalProps) {
  const { t } = useTranslation();

  const getNotificationContent = () => {
    if (streak.isNewRecord) {
      return {
        emoji: "🎉",
        title: t("streak.newRecord", "Kỷ lục mới!"),
        message: t(
          "streak.newRecordMessage",
          "Chúc mừng! Bạn đã đạt kỷ lục mới với {days} ngày liên tiếp!",
          { days: streak.currentStreak }
        ),
        bgColor: "from-purple-500 to-pink-500",
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
      };
    } else if (streak.streakContinued) {
      return {
        emoji: "🔥",
        title: t("streak.continued", "Chuỗi ngày học tiếp tục!"),
        message: t(
          "streak.continuedMessage",
          "Tuyệt vời! Bạn đã duy trì chuỗi ngày học {days} ngày liên tiếp!",
          { days: streak.currentStreak }
        ),
        bgColor: "from-orange-500 to-red-500",
        iconBg: "bg-orange-100 dark:bg-orange-900/30",
      };
    } else if (streak.streakRecovered) {
      return {
        emoji: "💪",
        title: t("streak.recovered", "Chuỗi ngày học được khôi phục!"),
        message: t(
          "streak.recoveredMessage",
          "Tuyệt vời! Bạn đã khôi phục chuỗi ngày học với {days} ngày!",
          { days: streak.currentStreak }
        ),
        bgColor: "from-emerald-500 to-teal-500",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      };
    }
    return null;
  };

  const content = getNotificationContent();

  if (!content) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md p-0 overflow-hidden"
    >
      <div className={`bg-gradient-to-br ${content.bgColor} p-6 text-white`}>
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${content.iconBg} text-4xl`}>
            {content.emoji}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{content.title}</h3>
            <p className="mt-1 text-sm opacity-90">{content.message}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 dark:bg-gray-900">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {streak.currentStreak}
            </div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {t("streak.currentStreak", "Chuỗi hiện tại")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {streak.longestStreak}
            </div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {t("streak.longestStreak", "Kỷ lục")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {streak.totalPracticeDays}
            </div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {t("streak.totalDays", "Tổng ngày")}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          {t("common.continue", "Tiếp tục")}
        </button>
      </div>
    </Modal>
  );
}

