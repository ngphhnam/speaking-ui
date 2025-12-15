"use client";

import { useTranslation } from "react-i18next";

export default function AuthBranding() {
  const { t } = useTranslation();
  
  return (
    <p className="text-center text-gray-400 dark:text-white/60">
      {t("auth.brandingText", "Practice your IELTS speaking skills with personalized feedback and AI-powered scoring.")}
    </p>
  );
}









