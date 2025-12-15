import LearningHistoryShell from "@/components/learning-history/LearningHistoryShell";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Learning History | IELTS Speaking Practice",
  description: "View all your IELTS Speaking practice recordings and track your progress",
};

export default function LearningHistoryPage() {
  return (
    <div>
      <LearningHistoryShell />
    </div>
  );
}




