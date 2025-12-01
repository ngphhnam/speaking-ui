import type { Metadata } from "next";
import TopicDetail from "@/components/topics/TopicDetail";

export const metadata: Metadata = {
  title: "Topic Detail | Speaking Practice",
  description: "View questions, structure, and vocabulary for a speaking topic",
};

type TopicDetailPageProps = {
  params: {
    id: string;
  };
};

const TopicDetailPage = ({ params }: TopicDetailPageProps) => {
  return <TopicDetail topicId={params.id} />;
};

export default TopicDetailPage;




