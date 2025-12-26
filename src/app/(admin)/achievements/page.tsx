import type { Metadata } from "next";
import AchievementsManageShell from "@/components/achievements/AchievementsManageShell";

export const metadata: Metadata = {
  title: "Achievements Management | IELTS Speaking Practice",
  description: "Create and manage achievements in the IELTS Speaking Practice system",
};

export default function AchievementsPage() {
  return <AchievementsManageShell />;
}












