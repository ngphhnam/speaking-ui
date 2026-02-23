import MockTestResults from "@/components/mock-test/MockTestResults";
import React from "react";

export default async function MockTestResultsPage({
  params,
}: {
  // Next.js 15 typegen in this repo expects params to be a Promise
  params: Promise<{ mockTestId: string }>;
}) {
  const resolvedParams = await params;
  return <MockTestResults mockTestId={resolvedParams.mockTestId} />;
}

