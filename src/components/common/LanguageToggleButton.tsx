"use client";

import React from "react";
import { useTranslation } from "react-i18next";

export const LanguageToggleButton: React.FC = () => {
  const { i18n } = useTranslation();
  const current = i18n.language || "vi";
  const nextLang = current.startsWith("vi") ? "en" : "vi";

  const handleToggle = () => {
    i18n.changeLanguage(nextLang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lang", nextLang);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center justify-center h-11 px-3 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-100 hover:text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      {current.startsWith("vi") ? "VI" : "EN"}
    </button>
  );
};


















