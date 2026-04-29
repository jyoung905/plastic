'use client';

import { Button, Card, PageIntro } from "@/components/ui";
import { usePersistentAppState } from "@/lib/storage";

const envExample = `OPENAI_API_KEY=\nOPENAI_MODEL=gpt-4.1-mini`;

export default function SettingsPage() {
  const { state, resetState } = usePersistentAppState();

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Settings"
        title="Local storage and environment instructions live here."
        description="API keys never go into the browser. If you want model-backed generation, add env vars on the server side and restart the dev server. Otherwise the mock generator remains fully usable."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">.env.local setup</h2>
            <p className="text-sm leading-7 text-slate-300">
              Create a local env file in the project root. Do not put your API key into form inputs or client-side settings.
            </p>
          </div>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950/70 p-4 text-sm text-cyan-100">
            {envExample}
          </pre>
          <div className="rounded-2xl bg-white/6 p-4 text-sm leading-7 text-slate-300 ring-1 ring-white/10">
            The API route checks for <code>OPENAI_API_KEY</code> and <code>OPENAI_MODEL</code>.
            If the key is missing or the request fails, the route falls back to the local mock generator and returns a clear error message.
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Local data</h2>
            <p className="text-sm leading-7 text-slate-300">
              All working data is stored in localStorage so the app survives refreshes in the same browser profile.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
              Project: {state.project?.accountName || "none"}
            </div>
            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
              Characters: {state.characters.length}
            </div>
            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
              Content items: {state.contentItems.length}
            </div>
            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
              Last generator: {state.settings.lastGenerator || "mock-ready"}
            </div>
          </div>
          <Button type="button" variant="danger" onClick={resetState}>
            Reset local data
          </Button>
        </Card>
      </div>
    </div>
  );
}
