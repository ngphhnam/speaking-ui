import type { Metadata } from "next";
import QuestionsManage from "@/components/topics/QuestionsManage";

export const metadata: Metadata = {
  title: "Manage Questions | Speaking Practice",
  description: "Manage questions for topic",
};

type QuestionsManagePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const QuestionsManagePage = async ({ params }: QuestionsManagePageProps) => {
  const { id } = await params;
  return <QuestionsManage topicId={id} />;
};

export default QuestionsManagePage;











