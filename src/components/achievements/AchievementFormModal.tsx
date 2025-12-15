"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import {
  AchievementDto,
  CreateAchievementRequest,
  UpdateAchievementRequest,
  useCreateAchievementMutation,
  useUpdateAchievementMutation,
  useUploadBadgeIconMutation,
} from "@/store/api/achievementApi";
import Image from "next/image";

interface AchievementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement?: AchievementDto | null;
  onSuccess?: () => void;
}

const AchievementFormModal: React.FC<AchievementFormModalProps> = ({
  isOpen,
  onClose,
  achievement,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createAchievement, { isLoading: isCreating }] =
    useCreateAchievementMutation();
  const [updateAchievement, { isLoading: isUpdating }] =
    useUpdateAchievementMutation();
  const [uploadBadgeIcon, { isLoading: isUploading }] =
    useUploadBadgeIconMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    achievementType: "milestone" as
      | "milestone"
      | "streak"
      | "score"
      | "practice"
      | "special",
    requirementCriteria: "",
    points: 10,
    badgeIconUrl: "",
    isActive: true,
  });

  const [badgePreview, setBadgePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (achievement) {
      setFormData({
        title: achievement.title,
        description: achievement.description,
        achievementType: achievement.achievementType,
        requirementCriteria: achievement.requirementCriteria,
        points: achievement.points,
        badgeIconUrl: achievement.badgeIconUrl || "",
        isActive: achievement.isActive,
      });
      setBadgePreview(achievement.badgeIconUrl);
    } else {
      setFormData({
        title: "",
        description: "",
        achievementType: "milestone",
        requirementCriteria: "",
        points: 10,
        badgeIconUrl: "",
        isActive: true,
      });
      setBadgePreview(null);
    }
    setError(null);
  }, [achievement, isOpen]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước file không được vượt quá 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("badgeIcon", file);

      const result = await uploadBadgeIcon(formData).unwrap();
      setBadgePreview(result.badgeIconUrl);
      setFormData((prev) => ({ ...prev, badgeIconUrl: result.badgeIconUrl }));
      setError(null);
    } catch (err: any) {
      setError(err?.data?.message || "Không thể upload badge icon");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("Vui lòng nhập tiêu đề");
      return;
    }

    if (!formData.description.trim()) {
      setError("Vui lòng nhập mô tả");
      return;
    }

    try {
      if (achievement) {
        // Update existing achievement
        const updateData: UpdateAchievementRequest = {
          title: formData.title,
          description: formData.description,
          achievementType: formData.achievementType,
          requirementCriteria: formData.requirementCriteria,
          points: formData.points,
          badgeIconUrl: formData.badgeIconUrl || undefined,
          isActive: formData.isActive,
        };
        await updateAchievement({
          achievementId: achievement.id,
          data: updateData,
        }).unwrap();
      } else {
        // Create new achievement
        const createData: CreateAchievementRequest = {
          title: formData.title,
          description: formData.description,
          achievementType: formData.achievementType,
          requirementCriteria: formData.requirementCriteria,
          points: formData.points,
          badgeIconUrl: formData.badgeIconUrl || undefined,
        };
        await createAchievement(createData).unwrap();
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(
        err?.data?.message ||
          `Không thể ${achievement ? "cập nhật" : "tạo"} thành tựu`
      );
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl m-4">
      <div className="relative w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {achievement ? "Chỉnh sửa thành tựu" : "Tạo thành tựu mới"}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {achievement
              ? "Cập nhật thông tin thành tựu"
              : "Thêm thành tựu mới vào hệ thống"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Badge Icon Upload */}
          <div>
            <Label>Badge Icon</Label>
            <div className="mt-2 flex items-center gap-4">
              <div
                onClick={handleFileSelect}
                className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-700"
              >
                {badgePreview ? (
                  <Image
                    src={badgePreview}
                    alt="Badge preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-3xl dark:bg-gray-800">
                    🏆
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                  {isUploading ? (
                    <svg
                      className="h-6 w-6 animate-spin text-white"
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
                  ) : (
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nhấp vào ảnh để tải lên badge icon (tối đa 5MB)
                </p>
                {badgePreview && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    ✓ Badge icon đã được tải lên
                  </p>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <Label>Tiêu đề *</Label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ví dụ: First Steps"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label>Mô tả *</Label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả chi tiết về thành tựu..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          {/* Type & Points */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Loại thành tựu *</Label>
              <select
                value={formData.achievementType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    achievementType: e.target.value as any,
                  })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="milestone">Milestone</option>
                <option value="streak">Streak</option>
                <option value="score">Score</option>
                <option value="practice">Practice</option>
                <option value="special">Special</option>
              </select>
            </div>

            <div>
              <Label>Điểm thưởng *</Label>
              <Input
                type="number"
                value={formData.points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points: parseInt(e.target.value) || 0,
                  })
                }
                min={0}
                required
              />
            </div>
          </div>

          {/* Requirement Criteria */}
          <div>
            <Label>Yêu cầu (JSON format)</Label>
            <textarea
              value={formData.requirementCriteria}
              onChange={(e) =>
                setFormData({ ...formData, requirementCriteria: e.target.value })
              }
              placeholder='{"type": "session_count", "target": 1}'
              rows={2}
              className="font-mono text-sm w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Active Status */}
          {achievement && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Kích hoạt
              </label>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
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
                  Đang xử lý...
                </span>
              ) : achievement ? (
                "Cập nhật"
              ) : (
                "Tạo thành tựu"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AchievementFormModal;



