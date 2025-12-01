import type { Metadata } from "next";
import SpeakingCoach from "@/components/speaking/SpeakingCoach";

export const metadata: Metadata = {
  title: "Speaking Coach | IELTS scoring & grammar feedback",
  description:
    "Interact with the Llama IELTS scoring API and LanguageTool grammar service directly from the dashboard.",
};

const SpeakingPage = () => {
  return <SpeakingCoach />;
};

export default SpeakingPage;

