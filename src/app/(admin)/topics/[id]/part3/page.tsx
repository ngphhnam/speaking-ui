import type { Metadata } from "next";
import TopicDetail from "@/components/topics/TopicDetail";

export const metadata: Metadata = {
  title: "Topic Part 3 | Speaking Practice",
  description: "Practice Part 3 questions for this topic",
};

type TopicPart3PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const TopicPart3Page = async ({ params }: TopicPart3PageProps) => {
  const { id } = await params;
  return <TopicDetail topicId={id} questionPartNumber={3} />;
};

export default TopicPart3Page;





