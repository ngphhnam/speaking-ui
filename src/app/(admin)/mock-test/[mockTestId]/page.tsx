import MockTestRunner from "@/components/mock-test/MockTestRunner";
import React from "react";

export default async function MockTestRunPage({
  params,
}: {
  // Next.js 15 typegen in this repo expects params to be a Promise
  params: Promise<{ mockTestId: string }>;
}) {
  const resolvedParams = await params;
  return <MockTestRunner mockTestId={resolvedParams.mockTestId} />;
}

