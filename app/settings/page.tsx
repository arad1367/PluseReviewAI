"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, GitBranch, Key, Bell, Shield, Zap, ExternalLink, Trash2 } from "lucide-react";
import {
  PROVIDERS,
  saveProviderSelection,
  loadProviderSelection,
  SESSION_KEY,
} from "@/lib/ai/providers";
import { cn } from "@/lib/utils";

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-5 border-b border-border last:border-0">
      <div className="max-w-sm">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        enabled ? "bg-[var(--teal)]" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [autoReview, setAutoReview] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [heuristics, setHeuristics] = useState(true);
  const [testCheck, setTestCheck] = useState(true);

  // Provider state
  const [selectedProvider, setSelectedProvider] = useState("groq");
  const [selectedModel, setSelectedModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  const provider = PROVIDERS.find((p) => p.id === selectedProvider)!;

  useEffect(() => {
    const stored = loadProviderSelection();
    if (stored) {
      setSelectedProvider(stored.providerId);
      setSelectedModel(stored.model);
      setApiKey(stored.apiKey);
    }
  }, []);

  useEffect(() => {
    if (!selectedModel || !provider.models.find((m) => m.id === selectedModel)) {
      setSelectedModel(provider.models[0].id);
    }
  }, [selectedProvider, provider]);

  function handleSaveProvider() {
    saveProviderSelection({ providerId: selectedProvider as any, model: selectedModel, apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClearProvider() {
    sessionStorage.removeItem(SESSION_KEY);
    setApiKey("");
    setSaved(false);
  }

  return (
    <div className="min-h-full">
      <div className="border-b border-border bg-background px-8 py-5">
        <h1 className="text-base font-semibold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Integrations, review preferences, and API configuration
        </p>
      </div>

      <div className="px-8 py-6 max-w-3xl space-y-6">
        {/* GitHub integration */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch size={16} />
            <h2 className="text-sm font-semibold">GitHub Integration</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Connect your GitHub account to enable real PR sync and webhook-triggered reviews.
          </p>
          <div className="rounded-md border border-border bg-muted/30 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Demo mode active</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Running with seeded data — no GitHub connection required
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">
              <GitBranch size={12} />
              Connect GitHub
            </button>
          </div>
        </div>

        {/* AI Provider */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} className="text-[var(--teal)]" />
            <h2 className="text-sm font-semibold">AI Provider</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Choose your preferred AI provider and model. Your API key is stored only in this browser session — never on our servers.
          </p>

          {/* Provider grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p.id)}
                className={cn(
                  "flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-all text-xs",
                  selectedProvider === p.id
                    ? "border-[var(--teal)] bg-[var(--teal)]/8 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className="font-medium">{p.name}</span>
                  {p.free && (
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                      free
                    </span>
                  )}
                </div>
                {p.freeNote && (
                  <span className="text-[10px] text-muted-foreground">{p.freeNote}</span>
                )}
              </button>
            ))}
          </div>

          <SettingRow
            label="Model"
            description={`Choose a model from ${provider.name}. Free models are marked.`}
          >
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs w-56 focus:outline-none focus:ring-1 focus:ring-[var(--teal)]"
            >
              {provider.models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </SettingRow>

          <SettingRow
            label="API Key"
            description="Stored in session storage only. Cleared when you close the browser tab."
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider.keyPlaceholder}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-xs w-44 focus:outline-none focus:ring-1 focus:ring-[var(--teal)]"
                />
              </div>
              <a
                href={provider.getKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-[var(--teal)] hover:underline whitespace-nowrap"
              >
                Get key <ExternalLink size={9} />
              </a>
            </div>
          </SettingRow>

          <div className="flex items-center gap-2 pt-3">
            <button
              onClick={handleSaveProvider}
              disabled={!apiKey}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                apiKey
                  ? "bg-[var(--teal)] text-white hover:opacity-90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <Key size={11} />
              {saved ? "Saved!" : "Save for session"}
            </button>
            {apiKey && (
              <button
                onClick={handleClearProvider}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 size={11} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Review preferences */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-[var(--teal)]" />
            <h2 className="text-sm font-semibold">Review Preferences</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Control what the AI review pipeline checks and when it runs.
          </p>
          <SettingRow
            label="Auto-review on PR open"
            description="Automatically trigger an AI review when a PR is opened against the main branch."
          >
            <Toggle enabled={autoReview} onChange={setAutoReview} />
          </SettingRow>
          <SettingRow
            label="Heuristic pre-checks"
            description="Run deterministic checks before LLM review. Improves accuracy and reduces cost."
          >
            <Toggle enabled={heuristics} onChange={setHeuristics} />
          </SettingRow>
          <SettingRow
            label="Test coverage check"
            description="Flag PRs where test files are absent or coverage appears to decrease."
          >
            <Toggle enabled={testCheck} onChange={setTestCheck} />
          </SettingRow>
          <SettingRow
            label="Review notifications"
            description="Send a notification when a review run completes."
          >
            <Toggle enabled={notifications} onChange={setNotifications} />
          </SettingRow>
        </div>

        {/* Severity thresholds */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Bell size={16} />
            <h2 className="text-sm font-semibold">Alert Thresholds</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Configure at what risk score to block a PR or send an alert.
          </p>
          <SettingRow
            label="Block merge threshold"
            description="Risk score above which the review will block a merge (requires CI integration)."
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={80}
                min={0}
                max={100}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs w-20 text-center focus:outline-none focus:ring-1 focus:ring-[var(--teal)]"
              />
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </SettingRow>
          <SettingRow
            label="Alert threshold"
            description="Risk score above which to trigger an alert notification."
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={60}
                min={0}
                max={100}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs w-20 text-center focus:outline-none focus:ring-1 focus:ring-[var(--teal)]"
              />
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </SettingRow>
        </div>

        <div className="flex items-center justify-end gap-3 pb-6">
          <button className="rounded-md border border-border bg-card px-4 py-2 text-xs font-medium hover:bg-accent transition-colors">
            Cancel
          </button>
          <button className="flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors">
            <CheckCircle2 size={12} />
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
