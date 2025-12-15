import MockTestShell from "@/components/mock-test/MockTestShell";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Mock Test | IELTS Speaking Practice",
  description: "Take full IELTS Speaking mock tests to assess your level",
};

export default function MockTestPage() {
  return (
    <div>
      <MockTestShell />
    </div>
  );
}

