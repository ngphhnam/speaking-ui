import type { Metadata } from "next";
import EditTopic from "@/components/topics/EditTopic";

export const metadata: Metadata = {
  title: "Edit Topic | Speaking Practice",
  description: "Edit topic details",
};

type EditTopicPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const EditTopicPage = async ({ params }: EditTopicPageProps) => {
  const { id } = await params;
  return <EditTopic topicId={id} />;
};

export default EditTopicPage;












