import type { Metadata } from "next";
import TopicDetail from "@/components/topics/TopicDetail";

export const metadata: Metadata = {
  title: "Topic Detail | Speaking Practice",
  description: "View questions, structure, and vocabulary for a speaking topic",
};

type TopicDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const TopicDetailPage = async ({ params }: TopicDetailPageProps) => {
  const { id } = await params;
  return <TopicDetail topicId={id} />;
};

export default TopicDetailPage;




