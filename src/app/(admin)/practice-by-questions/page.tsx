import type { Metadata } from "next";
import PracticeByQuestions from "@/components/practice/PracticeByQuestions";

export const metadata: Metadata = {
  title: "Practice by Questions | Speaking Practice",
  description: "Practice speaking by selecting questions from topics",
};

const PracticeByQuestionsPage = () => {
  return <PracticeByQuestions />;
};

export default PracticeByQuestionsPage;













