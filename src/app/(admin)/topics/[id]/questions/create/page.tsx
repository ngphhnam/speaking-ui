import type { Metadata } from "next";
import CreateQuestion from "@/components/topics/CreateQuestion";
import RequireAdmin from "@/components/auth/RequireAdmin";

export const metadata: Metadata = {
  title: "Add Question | Speaking Practice",
  description: "Add a new question to a topic",
};

type CreateQuestionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const CreateQuestionPage = async ({ params }: CreateQuestionPageProps) => {
  const { id } = await params;
  return (
    <RequireAdmin>
      <CreateQuestion topicId={id} />
    </RequireAdmin>
  );
};

export default CreateQuestionPage;

