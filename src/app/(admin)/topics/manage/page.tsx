import type { Metadata } from "next";
import TopicsManage from "@/components/topics/TopicsManage";

export const metadata: Metadata = {
  title: "Manage Topics | Speaking Practice",
  description: "Manage topics - edit and delete",
};

const TopicsManagePage = () => {
  return <TopicsManage />;
};

export default TopicsManagePage;




















