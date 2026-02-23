import type { Metadata } from "next";
import VocabularyBookClient from "@/components/vocabulary-book/VocabularyBookClient";

export const metadata: Metadata = {
  title: "Sổ từ vựng | Tự Luyện IELTS Speaking",
  description: "Danh sách từ vựng bạn đã lưu.",
};

export default function VocabularyBookPage() {
  return <VocabularyBookClient />;
}

