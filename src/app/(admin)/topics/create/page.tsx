import type { Metadata } from "next";
import CreateTopic from "@/components/topics/CreateTopic";
import RequireAdmin from "@/components/auth/RequireAdmin";

export const metadata: Metadata = {
  title: "Create Topic | Speaking Practice",
  description: "Create new topics for speaking practice",
};

const CreateTopicPage = () => {
  return (
    <RequireAdmin>
      <CreateTopic />
    </RequireAdmin>
  );
};

export default CreateTopicPage;


