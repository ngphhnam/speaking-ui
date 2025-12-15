import type { Metadata } from "next";
import TopicDetail from "@/components/topics/TopicDetail";

export const metadata: Metadata = {
  title: "Topic Part 2 | Speaking Practice",
  description: "Practice Part 2 questions for this topic",
};

type TopicPart2PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const TopicPart2Page = async ({ params }: TopicPart2PageProps) => {
  const { id } = await params;
  return <TopicDetail topicId={id} questionPartNumber={2} />;
};

export default TopicPart2Page;


