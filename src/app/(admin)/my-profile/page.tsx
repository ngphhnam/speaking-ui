import MyProfileShell from "@/components/my-profile/MyProfileShell";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "My Profile | IELTS Speaking Practice",
  description: "Manage your profile and study goals",
};

export default function MyProfilePage() {
  return (
    <div>
      <MyProfileShell />
    </div>
  );
}

