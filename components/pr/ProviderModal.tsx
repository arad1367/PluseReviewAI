"use client";

import { useState, useEffect } from "react";
import { X, Key, ExternalLink, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PROVIDERS,
  saveProviderSelection,
  loadProviderSelection,
  type ProviderSelection,
} from "@/lib/ai/providers";

interface Props {
  onConfirm: (sel: ProviderSelection) => void;
  onClose: () => void;
}

export function ProviderModal({ onConfirm, onClose }: Props) {
  const [providerId, setProviderId] = useState<string>("groq");
  const [model, setModel] = useState<string>("openai/gpt-oss-20b");
  const [apiKey, setApiKey] = useState("");
  const [remember, setRemember] = useState(true);

  const provider = PROVIDERS.find((p) => p.id === providerId)!;

  useEffect(() => {
    const saved = loadProviderSelection();
    if (saved) {
      setProviderId(saved.providerId);
      setModel(saved.model);
      setApiKey(saved.apiKey);
    }
  }, []);

  useEffect(() => {
    if (!model || !provider.models.find((m) => m.id === model)) {
      setModel(provider.models[0].id);
    }
  }, [providerId, provider]);

  function handleConfirm() {
    if (!apiKey.trim()) return;
    const sel: ProviderSelection = {
      providerId: providerId as ProviderSelection["providerId"],
      model,
      apiKey: apiKey.trim(),
    };
    if (remember) saveProviderSelection(sel);
    onConfirm(sel);
  }

  const keyValid = apiKey.length >= 8;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-[var(--teal)]" />
            <h2 className="text-sm font-semibold">Choose AI Provider</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Provider grid */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Provider</p>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProviderId(p.id)}
                  className={cn(
                    "flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-all text-xs",
                    providerId === p.id
                      ? "border-[var(--teal)] bg-[var(--teal)]/8 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-0.5">
                    <span className="font-medium">{p.name}</span>
                    {p.free && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        free
                      </span>
                    )}
                  </div>
                  {p.freeNote && (
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {p.freeNote}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Model selector */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Model</p>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--teal)]"
            >
              {provider.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">API Key</p>
              <a
                href={provider.getKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-[var(--teal)] hover:underline"
              >
                Get a key <ExternalLink size={9} />
              </a>
            </div>
            <div className="relative">
              <Key
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider.keyPlaceholder}
                className="w-full rounded-md border border-border bg-background pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--teal)]"
              />
              {apiKey && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {keyValid ? (
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={12} className="text-muted-foreground" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Privacy note */}
          <div className="rounded-md bg-muted/40 border border-border px-3 py-2.5">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Your key stays private.</span> It
              is sent directly to the AI provider via our server and is never stored, logged, or
              shared. Using session storage only.
            </p>
          </div>

          {/* Remember toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <button
              role="checkbox"
              aria-checked={remember}
              onClick={() => setRemember(!remember)}
              className={cn(
                "relative inline-flex h-4 w-7 items-center rounded-full transition-colors flex-shrink-0",
                remember ? "bg-[var(--teal)]" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-3 w-3 rounded-full bg-white shadow transition-transform",
                  remember ? "translate-x-3.5" : "translate-x-0.5"
                )}
              />
            </button>
            <span className="text-xs text-muted-foreground">
              Remember for this browser session
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!keyValid}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold transition-all",
              keyValid
                ? "bg-[var(--teal)] text-white hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Zap size={11} />
            Run AI Review
          </button>
        </div>
      </div>
    </div>
  );
}
