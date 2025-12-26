import SettingsShell from "@/components/settings/SettingsShell";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Settings | IELTS Speaking Practice",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return (
    <div>
      <SettingsShell />
    </div>
  );
}













