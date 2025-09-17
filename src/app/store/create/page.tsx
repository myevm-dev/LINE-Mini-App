// src/app/store/create/page.tsx
"use client";

import { useState } from "react";
import CreatePreview from "./CreatePreview";
import CreateForm from "./CreateForm";
import { defaultSpec, type PersonalitySpec } from "./PersonalityTypes";

type Tab = "personalities" | "models";

export default function StoreCreatePage() {
  const [tab, setTab] = useState<Tab>("personalities");
  const [spec, setSpec] = useState<PersonalitySpec>(defaultSpec);

  return (
    <main className="min-h-screen bg-zinc-950 text-neutral-200 pt-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header + Tabs */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {tab === "personalities" ? "Create Personality" : "Create Model"}
            </h1>
            <p className="text-sm text-neutral-400">
              Standardize personality details for JSON storage & in-app licensing.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-zinc-800 overflow-hidden">
            <button
              onClick={() => setTab("personalities")}
              className={`px-4 py-2 text-sm ${
                tab === "personalities"
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-900 text-neutral-300 hover:text-white"
              }`}
            >
              Personalities
            </button>
            <button
              aria-disabled
              title="Coming soon"
              className={`px-4 py-2 text-sm border-l border-zinc-800 cursor-not-allowed ${
                tab === "models"
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-900 text-neutral-500"
              }`}
            >
              Models (soon)
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CreatePreview spec={spec} />
          {tab === "personalities" ? (
            <CreateForm
              spec={spec}
              onChange={setSpec}
              onSaveDraft={() => console.log("Save draft:", spec)}
              onPublish={() => console.log("Publish:", spec)}
            />
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-neutral-400">
              Models creation is not available yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
