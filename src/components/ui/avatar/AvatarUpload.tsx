"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useUploadAvatarMutation, useDeleteAvatarMutation } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";

interface AvatarUploadProps {
  size?: "small" | "medium" | "large";
  editable?: boolean;
  onUploadSuccess?: (avatarUrl: string) => void;
}

const sizeClasses = {
  small: "h-16 w-16",
  medium: "h-24 w-24",
  large: "h-32 w-32",
};

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  size = "medium",
  editable = true,
  onUploadSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAppSelector((state) => state.auth);
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [deleteAvatar, { isLoading: isDeleting }] = useDeleteAvatarMutation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const avatarUrl = previewUrl || user?.avatarUrl;
  const displayName = user?.fullName || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước file không được vượt quá 5MB");
      return;
    }

    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await uploadAvatar(formData).unwrap();
      
      if (result.avatarUrl && onUploadSuccess) {
        onUploadSuccess(result.avatarUrl);
      }
    } catch (err: any) {
      setError(err?.data?.message || "Không thể upload avatar");
      setPreviewUrl(null);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!avatarUrl) return;

    try {
      await deleteAvatar().unwrap();
      setPreviewUrl(null);
    } catch (err: any) {
      setError(err?.data?.message || "Không thể xóa avatar");
    }
  };

  return (
    <div className="relative group">
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ${
          editable ? "cursor-pointer" : ""
        }`}
        onClick={editable ? handleFileSelect : undefined}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            fill
            className="object-cover"
            sizes={`${size === "small" ? "64px" : size === "medium" ? "96px" : "128px"}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-purple-500 text-white">
            <span className={`${size === "large" ? "text-4xl" : size === "medium" ? "text-2xl" : "text-xl"} font-bold`}>
              {initials}
            </span>
          </div>
        )}

        {editable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            {(isUploading || isDeleting) ? (
              <div className="flex items-center justify-center">
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
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-xs text-white">
                  {avatarUrl ? "Đổi ảnh" : "Thêm ảnh"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {editable && avatarUrl && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteAvatar();
          }}
          disabled={isDeleting}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600 disabled:opacity-50"
          title="Xóa avatar"
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
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default AvatarUpload;



