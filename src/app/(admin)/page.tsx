import type { Metadata } from "next";
import HomeShell from "@/components/home/HomeShell";

export const metadata: Metadata = {
  title: "Luyện Nói | Tự Luyện IELTS Speaking",
  description: "Trang chính luyện nói IELTS với nhiệm vụ, streak và chế độ luyện tập.",
};

const HomePage = () => {
  return <HomeShell />;
};

export default HomePage;
