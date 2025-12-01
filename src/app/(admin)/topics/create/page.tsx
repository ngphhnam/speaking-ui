import type { Metadata } from "next";
import CreateTopicQuestion from "@/components/topics/CreateTopicQuestion";

export const metadata: Metadata = {
  title: "Create Topic & Questions | Speaking Practice",
  description: "Create new topics and questions for speaking practice",
};

const CreateTopicPage = () => {
  return <CreateTopicQuestion />;
};

export default CreateTopicPage;


