// src/app/store/create/CreateForm.tsx
"use client";

import type { PersonalitySpec } from "./PersonalityTypes";

type Props = {
  spec: PersonalitySpec;
  onChange: (next: PersonalitySpec) => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  busy?: boolean; // ✅ add this
};

export default function CreateForm({ spec, onChange, onSaveDraft, onPublish, busy }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 lg:p-6">
      <div className="space-y-5">
        {/* Core Traits */}
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Core Traits (comma-separated)</label>
          <input
            value={spec.coreTraits.join(", ")}
            onChange={(e) =>
              onChange({
                ...spec,
                coreTraits: e.target.value.split(",").map(t => t.trim()).filter(Boolean),
              })
            }
            placeholder="friendly, supportive, curious"
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-neutral-500"
          />
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Slider label="Warmth" min={1} max={5} value={spec.warmth}
                  onChange={(v) => onChange({ ...spec, warmth: v })}/>
          <Slider label="Empathy" min={1} max={5} value={spec.empathy}
                  onChange={(v) => onChange({ ...spec, empathy: v })}/>
          <Slider label="Humor"  min={0} max={5} value={spec.humor}
                  onChange={(v) => onChange({ ...spec, humor: v })}/>
        </div>

        {/* Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Energy" value={spec.energy} options={["calm","balanced","lively"]}
                  onChange={(v) => onChange({ ...spec, energy: v as typeof spec.energy })}/>
          <Select label="Conversation Length" value={spec.convoLength} options={["short","medium","long"]}
                  onChange={(v) => onChange({ ...spec, convoLength: v as typeof spec.convoLength })}/>
          <Select label="Emoji Use" value={spec.emojiUse} options={["none","light","medium"]}
                  onChange={(v) => onChange({ ...spec, emojiUse: v as typeof spec.emojiUse })}/>
        </div>

        {/* Boundaries + Tier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Boundaries" value={spec.boundaries} options={["strict","normal"]}
                  onChange={(v) => onChange({ ...spec, boundaries: v as typeof spec.boundaries })}/>
          <Select label="Tier" value={spec.tier} options={["premium","standard"]}
                  onChange={(v) => onChange({ ...spec, tier: v as typeof spec.tier })}/>
        </div>

        {/* Opener */}
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Opener Template</label>
          <input
            value={spec.opener ?? ""}
            onChange={(e) => onChange({ ...spec, opener: e.target.value })}
            placeholder="Hey! How’s your day going? 😊"
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-neutral-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Notes (curation/safety)</label>
          <textarea
            rows={3}
            value={spec.notes ?? ""}
            onChange={(e) => onChange({ ...spec, notes: e.target.value })}
            placeholder="Keep replies 2–5 sentences. Supportive tone. No unsafe content."
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-neutral-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSaveDraft}
            disabled={busy}
            className={`px-3 py-2 text-sm rounded-lg text-white ${
              busy ? "bg-emerald-600/60 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            Save Draft
          </button>
          <button
            onClick={onPublish}
            disabled={busy}
            className={`px-3 py-2 text-sm rounded-lg text-white ${
              busy ? "bg-zinc-700/60 cursor-not-allowed" : "bg-zinc-700 hover:bg-zinc-600"
            }`}
          >
            {busy ? "Encrypting…" : "Encrypt & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- small UI helpers ---- */
function Slider({
  label, min, max, value, onChange,
}: { label: string; min: number; max: number; value: number; onChange: (v:number)=>void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-neutral-400">{label}</label>
        <span className="text-xs text-neutral-300">{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
             onChange={(e)=>onChange(Number(e.target.value))}
             className="w-full accent-emerald-500"/>
    </div>
  );
}

function Select({
  label, value, options, onChange,
}: { label:string; value:string; options:string[]; onChange:(v:string)=>void }) {
  return (
    <div>
      <label className="block text-xs text-neutral-400 mb-1">{label}</label>
      <select value={value} onChange={(e)=>onChange(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
