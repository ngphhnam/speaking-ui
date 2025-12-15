import DashboardShell from "@/components/dashboard/DashboardShell";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard | IELTS Speaking Practice",
  description: "Track your IELTS Speaking practice progress and statistics",
};

export default function DashboardPage() {
  return (
    <div>
      <DashboardShell />
    </div>
  );
}




