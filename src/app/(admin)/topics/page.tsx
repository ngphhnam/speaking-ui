import type { Metadata } from "next";
import TopicsBrowse from "@/components/topics/TopicsBrowse";

export const metadata: Metadata = {
  title: "Browse Topics | Speaking Practice",
  description: "Browse and select topics for speaking practice",
};

const TopicsPage = () => {
  return <TopicsBrowse />;
};

export default TopicsPage;

