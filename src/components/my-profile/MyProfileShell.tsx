"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useUpdateProfileMutation } from "@/store/api/authApi";
import { updateUser } from "@/store/authSlice";
import { getErrorMessage } from "@/utils/errorHandler";
import Link from "next/link";
import AvatarUpload from "@/components/ui/avatar/AvatarUpload";
import DatePicker from "@/components/form/date-picker";

export default function MyProfileShell() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const subscriptionType = (user as any)?.subscriptionType as string | undefined;
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    targetScore: 7.0,
    bio: user?.bio || "",
    examDate: user?.examDate || "",
  });

  // Update formData when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        targetScore: user.targetBandScore || 7.0,
        bio: user.bio || "",
        examDate: user.examDate || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (!formData.fullName.trim()) {
        setErrorMessage(t("settings.fillAllFields", "Vui lòng điền đầy đủ thông tin"));
        return;
      }

      const result = await updateProfile({
        fullName: formData.fullName,
        bio: formData.bio || undefined,
        examDate: formData.examDate || undefined,
        targetBandScore: formData.targetScore,
      }).unwrap();

      // Update user in Redux store
      dispatch(updateUser(result));

      setSuccessMessage(t("profile.bioUpdated", "Đã cập nhật tiểu sử!"));
      setIsEditing(false);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      setErrorMessage(getErrorMessage(error, t, t("settings.errorUpdatingProfile", "Không thể cập nhật thông tin")));
    }
  };

  const achievements = [
    {
      icon: "🔥",
      title: t("profile.streak7Days", "7 ngày liên tiếp"),
      description: t("profile.streak7DaysDesc", "Luyện tập 7 ngày liên tục"),
      earned: true,
      date: "2025-12-01",
    },
    {
      icon: "⭐",
      title: t("profile.firstTest", "Bài thi đầu tiên"),
      description: t("profile.firstTestDesc", "Hoàn thành bài thi thử đầu tiên"),
      earned: true,
      date: "2025-11-28",
    },
    {
      icon: "🏆",
      title: t("profile.score7Plus", "Điểm 7.0+"),
      description: t("profile.score7PlusDesc", "Đạt điểm 7.0 trở lên"),
      earned: false,
      date: null,
    },
    {
      icon: "💯",
      title: t("profile.complete100", "100 bài làm"),
      description: t("profile.complete100Desc", "Hoàn thành 100 bài luyện tập"),
      earned: false,
      date: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("profile.title", "Hồ sơ của tôi")}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t("profile.subtitle", "Quản lý thông tin cá nhân và mục tiêu học tập")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{successMessage}</span>
              </div>
            </div>
          )}
          
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Basic Info Card */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("profile.basicInfo", "Thông tin cơ bản")}
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
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
                  {t("profile.edit", "Chỉnh sửa")}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {t("profile.cancel", "Hủy")}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
                  >
                    {isLoading ? t("settings.saving", "Đang lưu...") : t("profile.save", "Lưu")}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("profile.fullName", "Họ và tên")}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {user?.fullName || t("profile.notSet", "Chưa cập nhật")}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("profile.email", "Email")}
                </label>
                <p className="text-gray-900 dark:text-white">{user?.email}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t("profile.emailNote", "Email không thể thay đổi")}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("profile.role", "Vai trò")}
                </label>
                <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                  {user?.role || "User"}
                </span>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("profile.subscription", "Gói hiện tại")}
                </label>
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {subscriptionType ? subscriptionType : t("profile.notSet", "Chưa cập nhật")}
                </span>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("profile.targetScore", "Mục tiêu điểm")}
                </label>
                {isEditing ? (
                  <select
                    value={formData.targetScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetScore: parseFloat(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="5.0">5.0</option>
                    <option value="5.5">5.5</option>
                    <option value="6.0">6.0</option>
                    <option value="6.5">6.5</option>
                    <option value="7.0">7.0</option>
                    <option value="7.5">7.5</option>
                    <option value="8.0">8.0</option>
                    <option value="8.5">8.5</option>
                    <option value="9.0">9.0</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {formData.targetScore.toFixed(1)}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("profile.bio", "Giới thiệu")}
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder={t(
                      "profile.bioPlaceholder",
                      "Viết vài dòng về bản thân..."
                    )}
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    {formData.bio || t("profile.notSet", "Chưa cập nhật")}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("profile.examDate", "Ngày thi")}
                </label>
                {isEditing ? (
                  <DatePicker
                    id="examDate"
                    placeholder={t("profile.examDatePlaceholder", "Chọn ngày thi dự kiến")}
                    defaultDate={formData.examDate || undefined}
                    onChange={(selectedDates, dateStr) => {
                      setFormData({ ...formData, examDate: dateStr });
                    }}
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {formData.examDate || t("profile.notSet", "Chưa cập nhật")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              {t("profile.achievements", "Thành tích")}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`rounded-lg border-2 p-4 transition ${
                    achievement.earned
                      ? "border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/20"
                      : "border-gray-200 bg-gray-50 opacity-60 dark:border-gray-800 dark:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {achievement.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.date && (
                        <p className="mt-2 text-xs text-brand-600 dark:text-brand-400">
                          {t("profile.earnedOn", "Đạt được:")} {achievement.date}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex justify-center">
              <AvatarUpload 
                size="large" 
                editable={true}
                onUploadSuccess={(url) => {
                  console.log("Avatar uploaded:", url);
                }}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.fullName || user?.email}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {user?.email}
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              {t("profile.clickToUpload", "Nhấp vào ảnh đại diện để thay đổi")}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link
                href="/settings"
                className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:text-brand-400"
              >
                {t("profile.settings", "Cài đặt")}
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {t("profile.quickLinks", "Liên kết nhanh")}
            </h3>
            <div className="space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <svg
                  className="h-5 w-5 text-brand-600 dark:text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("profile.dashboard", "Bảng điều khiển")}
                </span>
              </Link>
              <Link
                href="/learning-history"
                className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <svg
                  className="h-5 w-5 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("profile.learningHistory", "Lịch sử học tập")}
                </span>
              </Link>
              <Link
                href="/practice-by-questions"
                className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <svg
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("profile.practice", "Luyện tập")}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


