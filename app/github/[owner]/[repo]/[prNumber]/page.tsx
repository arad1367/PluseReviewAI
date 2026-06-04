import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GitHubPRClient } from "./GitHubPRClient";
import { fetchPR, fetchPRFiles } from "@/lib/github/api";

interface PageProps {
  params: Promise<{ owner: string; repo: string; prNumber: string }>;
}

export default async function GitHubPRPage({ params }: PageProps) {
  const { owner, repo, prNumber } = await params;
  const num = parseInt(prNumber, 10);
  if (isNaN(num)) notFound();

  let pr, files;
  try {
    [pr, files] = await Promise.all([
      fetchPR(owner, repo, num),
      fetchPRFiles(owner, repo, num),
    ]);
  } catch {
    notFound();
  }

  return (
    <AppShell>
      <GitHubPRClient owner={owner} repo={repo} pr={pr} files={files} />
    </AppShell>
  );
}
