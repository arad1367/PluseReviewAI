import { notFound } from "next/navigation";
import { DEMO_PRS, DEMO_REVIEWS } from "@/lib/demo/seed";
import { PRDetailClient } from "./PRDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return DEMO_PRS.map((pr) => ({ id: pr.id }));
}

export default async function PRDetailPage({ params }: PageProps) {
  const { id } = await params;
  const pr = DEMO_PRS.find((p) => p.id === id);
  if (!pr) notFound();

  const existingReview = DEMO_REVIEWS[id] ?? null;

  return <PRDetailClient pr={pr} existingReview={existingReview} />;
}
