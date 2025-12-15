"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useUpdateProfileMutation, useChangePasswordMutation } from "@/store/api/authApi";
import { 
  useGetPracticePreferencesQuery,
  useUpdatePracticePreferencesMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation
} from "@/store/api/userSettingsApi";
import { updateUser } from "@/store/authSlice";
import { EyeIcon, EyeCloseIcon } from "@/icons";
import { getErrorMessage } from "@/utils/errorHandler";
import DatePicker from "@/components/form/date-picker";

export default function SettingsShell() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<"account" | "practice" | "notifications">("account");
  
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  
  const { data: practicePrefs } = useGetPracticePreferencesQuery();
  const { data: notificationPrefs } = useGetNotificationPreferencesQuery();
  const [updatePracticePrefs, { isLoading: isUpdatingPractice }] = useUpdatePracticePreferencesMutation();
  const [updateNotificationPrefs, { isLoading: isUpdatingNotifications }] = useUpdateNotificationPreferencesMutation();

  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Password visibility states
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Initialize profile data from user
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
      });
    }
  }, [user]);

  // Initialize practice settings from API
  useEffect(() => {
    if (practicePrefs) {
      setPracticeSettings({
        recordingQuality: practicePrefs.recordingQuality || "high",
        autoSubmit: practicePrefs.autoSubmit || false,
        feedbackDetailLevel: practicePrefs.feedbackDetailLevel || "detailed",
        preferredAIModel: practicePrefs.preferredAIModel || "llama",
        showHints: practicePrefs.showHints ?? true,
        enableTimer: practicePrefs.enableTimer ?? true,
      });
    }
  }, [practicePrefs]);

  // Initialize notification settings from API
  useEffect(() => {
    if (notificationPrefs) {
      setNotificationSettings({
        emailNotifications: notificationPrefs.emailNotifications ?? true,
        practiceReminders: notificationPrefs.practiceReminders ?? true,
        weeklyReport: notificationPrefs.weeklySummary ?? true,
        achievementAlerts: notificationPrefs.achievementNotifications ?? true,
        streakReminders: notificationPrefs.streakReminders ?? true,
      });
    }
  }, [notificationPrefs]);

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const [practiceSettings, setPracticeSettings] = useState({
    recordingQuality: "high",
    autoSubmit: false,
    feedbackDetailLevel: "detailed",
    preferredAIModel: "llama",
    showHints: true,
    enableTimer: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    practiceReminders: true,
    weeklyReport: true,
    achievementAlerts: true,
    streakReminders: true,
  });

  const tabs = [
    {
      id: "account" as const,
      name: t("settings.account", "Tài khoản"),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "practice" as const,
      name: t("settings.practice", "Luyện tập"),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: "notifications" as const,
      name: t("settings.notifications", "Thông báo"),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
  ];

  const handleSaveProfile = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (!profileData.fullName.trim()) {
        setErrorMessage(t("settings.fillAllFields", "Vui lòng điền đầy đủ thông tin"));
        return;
      }

      const result = await updateProfile({
        fullName: profileData.fullName,
        phone: profileData.phone || undefined,
        dateOfBirth: profileData.dateOfBirth || undefined,
      }).unwrap();

      // Update user in Redux store
      dispatch(updateUser(result));

      setSuccessMessage(t("settings.profileUpdated", "Đã cập nhật thông tin!"));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      setErrorMessage(getErrorMessage(error, t, t("settings.errorUpdatingProfile", "Không thể cập nhật thông tin")));
    }
  };

  const handleChangePassword = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      // Validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setErrorMessage(t("settings.fillAllFields", "Vui lòng điền đầy đủ thông tin"));
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setErrorMessage(t("settings.passwordMismatch", "Mật khẩu không khớp"));
        return;
      }

      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccessMessage(t("settings.passwordUpdated", "Đã đổi mật khẩu thành công!"));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Failed to change password:", error);
      setErrorMessage(getErrorMessage(error, t, t("settings.errorUpdatingPassword", "Không thể đổi mật khẩu")));
    }
  };

  const handleSavePractice = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      await updatePracticePrefs({
        recordingQuality: practiceSettings.recordingQuality,
        autoSubmit: practiceSettings.autoSubmit,
        feedbackDetailLevel: practiceSettings.feedbackDetailLevel,
        preferredAIModel: practiceSettings.preferredAIModel,
        showHints: practiceSettings.showHints,
        enableTimer: practiceSettings.enableTimer,
      }).unwrap();

      setSuccessMessage(t("settings.settingsSaved", "Đã lưu cài đặt!"));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Failed to save practice settings:", error);
      setErrorMessage(getErrorMessage(error, t, t("settings.errorUpdatingProfile", "Không thể cập nhật thông tin")));
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      await updateNotificationPrefs({
        emailNotifications: notificationSettings.emailNotifications,
        practiceReminders: notificationSettings.practiceReminders,
        achievementNotifications: notificationSettings.achievementAlerts,
        weeklySummary: notificationSettings.weeklyReport,
        streakReminders: notificationSettings.streakReminders,
      }).unwrap();

      setSuccessMessage(t("settings.settingsSaved", "Đã lưu cài đặt!"));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Failed to save notification settings:", error);
      setErrorMessage(getErrorMessage(error, t, t("settings.errorUpdatingProfile", "Không thể cập nhật thông tin")));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("settings.title", "Cài đặt")}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t("settings.subtitle", "Quản lý tài khoản và tùy chỉnh trải nghiệm")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border-2 border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
                  activeTab === tab.id
                    ? "bg-brand-600 text-white dark:bg-brand-500"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Account Settings */}
          {activeTab === "account" && (
            <div className="space-y-6">
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

              <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                  {t("settings.accountInfo", "Thông tin tài khoản")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("settings.fullName", "Họ và tên")}
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      placeholder={t("settings.fullNamePlaceholder", "Nhập họ và tên của bạn")}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("settings.phone", "Số điện thoại")}
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder={t("settings.phonePlaceholder", "Nhập số điện thoại")}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <DatePicker
                      id="dateOfBirth"
                      label={t("settings.dateOfBirth", "Ngày sinh")}
                      placeholder={t("settings.dateOfBirthPlaceholder", "Chọn ngày sinh của bạn")}
                      defaultDate={profileData.dateOfBirth || undefined}
                      onChange={(selectedDates, dateStr) => {
                        setProfileData({ ...profileData, dateOfBirth: dateStr });
                      }}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("settings.email", "Email")}
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t("settings.emailNote", "Email không thể thay đổi")}
                    </p>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isUpdatingProfile}
                    className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
                  >
                    {isUpdatingProfile ? t("settings.saving", "Đang lưu...") : t("settings.saveProfile", "Lưu thông tin")}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                  {t("settings.changePassword", "Đổi mật khẩu")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("settings.currentPassword", "Mật khẩu hiện tại")}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder={t("settings.currentPasswordPlaceholder", "Nhập mật khẩu hiện tại")}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-11 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer"
                      >
                        {showPasswords.current ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("settings.newPassword", "Mật khẩu mới")}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder={t("settings.newPasswordPlaceholder", "Nhập mật khẩu mới")}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-11 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer"
                      >
                        {showPasswords.new ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("settings.confirmPassword", "Xác nhận mật khẩu")}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder={t("settings.confirmPasswordPlaceholder", "Nhập lại mật khẩu mới")}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-11 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer"
                      >
                        {showPasswords.confirm ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
                  >
                    {isChangingPassword ? t("settings.updating", "Đang cập nhật...") : t("settings.updatePassword", "Cập nhật mật khẩu")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Practice Settings */}
          {activeTab === "practice" && (
            <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                {t("settings.practicePreferences", "Tùy chỉnh luyện tập")}
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("settings.recordingQuality", "Chất lượng ghi âm")}
                  </label>
                  <select
                    value={practiceSettings.recordingQuality}
                    onChange={(e) =>
                      setPracticeSettings({
                        ...practiceSettings,
                        recordingQuality: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="low">{t("settings.low", "Thấp")}</option>
                    <option value="medium">{t("settings.medium", "Trung bình")}</option>
                    <option value="high">{t("settings.high", "Cao")}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("settings.feedbackDetailLevel", "Mức độ chi tiết phản hồi")}
                  </label>
                  <select
                    value={practiceSettings.feedbackDetailLevel}
                    onChange={(e) =>
                      setPracticeSettings({
                        ...practiceSettings,
                        feedbackDetailLevel: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="brief">{t("settings.brief", "Ngắn gọn")}</option>
                    <option value="detailed">{t("settings.detailed", "Chi tiết")}</option>
                    <option value="comprehensive">{t("settings.comprehensive", "Toàn diện")}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("settings.preferredAIModel", "Mô hình AI ưa thích")}
                  </label>
                  <select
                    value={practiceSettings.preferredAIModel}
                    onChange={(e) =>
                      setPracticeSettings({
                        ...practiceSettings,
                        preferredAIModel: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="llama">{t("settings.llama", "Llama")}</option>
                    <option value="gpt-4">{t("settings.gpt", "GPT-4")}</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("settings.preferredAIModelDesc", "Chọn mô hình AI để chấm điểm")}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t("settings.autoSubmit", "Tự động gửi bài")}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("settings.autoSubmitDesc", "Tự động gửi sau khi kết thúc ghi âm")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPracticeSettings({
                        ...practiceSettings,
                        autoSubmit: !practiceSettings.autoSubmit,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      practiceSettings.autoSubmit ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        practiceSettings.autoSubmit ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t("settings.showHints", "Hiển thị gợi ý")}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("settings.showHintsDesc", "Hiển thị gợi ý hữu ích khi luyện tập")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPracticeSettings({
                        ...practiceSettings,
                        showHints: !practiceSettings.showHints,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      practiceSettings.showHints ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        practiceSettings.showHints ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t("settings.enableTimer", "Bật đồng hồ")}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("settings.enableTimerDesc", "Hiển thị đồng hồ đếm ngược khi luyện tập")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPracticeSettings({
                        ...practiceSettings,
                        enableTimer: !practiceSettings.enableTimer,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      practiceSettings.enableTimer ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        practiceSettings.enableTimer ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={handleSavePractice}
                  disabled={isUpdatingPractice}
                  className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
                >
                  {isUpdatingPractice ? t("settings.saving", "Đang lưu...") : t("settings.saveChanges", "Lưu thay đổi")}
                </button>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                {t("settings.notificationPreferences", "Tùy chỉnh thông báo")}
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t("settings.emailNotifications", "Thông báo qua email")}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("settings.emailNotificationsDesc", "Nhận thông báo quan trọng qua email")}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: !notificationSettings.emailNotifications,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      notificationSettings.emailNotifications ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        notificationSettings.emailNotifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t("settings.practiceReminders", "Nhắc nhở luyện tập")}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("settings.practiceRemindersDesc", "Nhắc nhở hàng ngày để duy trì chuỗi ngày học")}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        practiceReminders: !notificationSettings.practiceReminders,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      notificationSettings.practiceReminders ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        notificationSettings.practiceReminders ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t("settings.weeklyReport", "Báo cáo hàng tuần")}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("settings.weeklyReportDesc", "Nhận báo cáo tiến độ hàng tuần")}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        weeklyReport: !notificationSettings.weeklyReport,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      notificationSettings.weeklyReport ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        notificationSettings.weeklyReport ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t("settings.achievementNotifications", "Thông báo thành tích")}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("settings.achievementNotificationsDesc", "Nhận thông báo về thành tích và cột mốc")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        achievementAlerts: !notificationSettings.achievementAlerts,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      notificationSettings.achievementAlerts ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        notificationSettings.achievementAlerts ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t("settings.streakReminders", "Nhắc nhở streak")}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("settings.streakRemindersDesc", "Nhắc nhở duy trì chuỗi ngày học")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNotificationSettings({
                        ...notificationSettings,
                        streakReminders: !notificationSettings.streakReminders,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      notificationSettings.streakReminders ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        notificationSettings.streakReminders ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={handleSaveNotifications}
                  disabled={isUpdatingNotifications}
                  className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
                >
                  {isUpdatingNotifications ? t("settings.saving", "Đang lưu...") : t("settings.saveChanges", "Lưu thay đổi")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

