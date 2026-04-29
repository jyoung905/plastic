'use client';

import Link from "next/link";
import { startTransition, useState } from "react";

import {
  Button,
  Card,
  EmptyState,
  PageIntro,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { generateContentDrafts } from "@/lib/generationClient";
import { selectCurrentCharacter, sortContentItems } from "@/lib/core";
import { usePersistentAppState } from "@/lib/storage";

export default function DashboardPage() {
  const { state, isHydrated, updateState } = usePersistentAppState();
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const project = state.project;
  const character = selectCurrentCharacter(state);
  const approved = state.contentItems.filter((item) => item.status === "approved").length;
  const exported = state.contentItems.filter((item) => item.status === "exported").length;
  const posted = state.contentItems.filter((item) => item.status === "posted").length;
  const latestItems = sortContentItems(state.contentItems).slice(0, 6);

  async function handleGenerate() {
    if (!project || !character) {
      return;
    }

    setIsGenerating(true);
    setFeedback(null);

    try {
      const payload = await generateContentDrafts(project, character, 30);

      startTransition(() => {
        updateState((current) => ({
          ...current,
          contentItems: sortContentItems(payload.items),
          settings: {
            ...current.settings,
            lastGenerator: payload.source,
            lastGeneratorError: payload.error || null,
          },
        }));
      });

      setFeedback(
        payload.error
          ? `Generated with mock fallback because the API route returned an error: ${payload.error}`
          : `Generated 30 days using the ${payload.source} engine.`,
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Dashboard"
        title="Private, local-first planning for a fictional adult creator named Bella."
        description="Build the account concept, define character consistency rules, generate a 30-day content calendar, and export captions, scripts, and visual prompts without pretending TikTok is connected."
        actions={
          <>
            <Button href="/project/new">Set Up Project</Button>
            <Button href="/character/setup" variant="secondary">
              Configure Character
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleGenerate}
              disabled={!project || !character || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate 30 Days"}
            </Button>
          </>
        }
      />

      {feedback ? (
        <Card className="text-sm leading-7 text-slate-200">{feedback}</Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Items"
          value={state.contentItems.length}
          help="A full month lives here once generated."
        />
        <StatCard
          label="Approved"
          value={approved}
          help="Ready for export and manual posting."
        />
        <StatCard
          label="Exported"
          value={exported}
          help="Already copied or prepared for posting."
        />
        <StatCard
          label="Posted"
          value={posted}
          help="Manual posting tracked locally only."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Current Setup
            </p>
            <h2 className="text-2xl font-semibold text-white">
              {project ? project.accountName : "No project configured yet"}
            </h2>
            <p className="text-sm leading-7 text-slate-300">
              {project
                ? `${project.niche} for ${project.audience}. Tone: ${project.tone}.`
                : "Start by defining the account concept, pillars, and guardrails."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Character</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {character ? character.name : "Not set"}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {character
                  ? `${character.mode.replaceAll("_", " ")} at ${character.consistencyLevel}% consistency`
                  : "Choose strict Bella, Bella-inspired, or open cast."}
              </p>
            </div>
            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Generator Mode
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {state.settings.lastGenerator || "mock-ready"}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Uses the API route when env vars exist, otherwise stays local with the mock engine.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/calendar" variant="secondary">
              Open Calendar
            </Button>
            <Button href="/export" variant="ghost">
              Open Export Tools
            </Button>
          </div>
        </Card>

        {!project || !character ? (
          <EmptyState
            title="Complete the setup flow first."
            description="The generator needs both a project and a character. The app stores everything in localStorage, so once those exist the dashboard can build and retain your calendar on refresh."
            action={
              <div className="flex flex-wrap gap-3">
                <Button href="/project/new">Project Setup</Button>
                <Button href="/character/setup" variant="secondary">
                  Character Setup
                </Button>
              </div>
            }
          />
        ) : (
          <Card className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Workflow
              </p>
              <h2 className="text-2xl font-semibold text-white">Suggested next actions</h2>
            </div>
            <div className="grid gap-3">
              <Link
                href="/project/new"
                className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                Refine audience, tone, pillars, and banned topics.
              </Link>
              <Link
                href="/character/setup"
                className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                Adjust Bella mode, consistency, wardrobe, and visual rules.
              </Link>
              <Link
                href="/checker"
                className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                Use the cover-title safe zone checker before exporting.
              </Link>
            </div>
          </Card>
        )}
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Latest Items</p>
            <h2 className="text-2xl font-semibold text-white">Calendar snapshot</h2>
          </div>
          <Button href="/calendar" variant="secondary">
            View all 30
          </Button>
        </div>

        {!isHydrated || latestItems.length === 0 ? (
          <EmptyState
            title="No calendar items yet."
            description="Generate a 30-day run from the dashboard or the calendar page. The mock engine is enough to satisfy the full local workflow if you do not provide API env vars."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {latestItems.map((item) => (
              <Link
                key={item.id}
                href={`/content/${item.id}`}
                className="rounded-[24px] border border-white/10 bg-white/6 p-4 transition hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">Day {item.dayNumber}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {item.format}
                </p>
                <p className="mt-2 text-lg font-semibold leading-7 text-white">{item.topic}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{item.hook}</p>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
