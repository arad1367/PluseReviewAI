"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitPullRequest,
  BarChart3,
  ShieldCheck,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/pr", label: "Pull Requests", icon: GitPullRequest },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/evaluations", label: "Evaluations", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--teal)]">
          <Zap size={14} className="text-white" />
        </div>
        <span className="text-[13px] font-semibold tracking-tight text-sidebar-foreground">
          PulseReview <span className="text-[var(--teal)]">AI</span>
        </span>
      </div>

      {/* Repo selector */}
      <div className="px-3 pt-4 pb-2">
        <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors">
          <span className="flex items-center gap-2">
            <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-foreground">
              acme-corp
            </span>
            <span className="truncate">payments-service</span>
          </span>
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors",
                active
                  ? "bg-sidebar-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon
                size={15}
                className={cn(active ? "text-[var(--teal)]" : "text-muted-foreground")}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-full bg-[var(--teal)] flex items-center justify-center text-[10px] font-medium text-white">
            PE
          </div>
          <span className="text-xs text-muted-foreground">Pejman Ebrahimi</span>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
