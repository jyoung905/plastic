'use client';

import Link from "next/link";
import { startTransition, useState } from "react";

import {
  Button,
  Card,
  CopyButton,
  EmptyState,
  PageIntro,
  StatusBadge,
} from "@/components/ui";
import { generateContentDrafts } from "@/lib/generationClient";
import { selectCurrentCharacter, sortContentItems } from "@/lib/core";
import { usePersistentAppState } from "@/lib/storage";

export default function CalendarPage() {
  const { state, updateState } = usePersistentAppState();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const project = state.project;
  const character = selectCurrentCharacter(state);
  const items = sortContentItems(state.contentItems);

  async function handleGenerate() {
    if (!project || !character) {
      return;
    }

    setIsGenerating(true);
    setFeedback(null);

    try {
      const payload = await generateContentDrafts(
        project,
        character,
        state.settings.preferredGenerationCount,
      );

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
          ? `Calendar rebuilt with local mock fallback because the API route returned an error: ${payload.error}`
          : `Generated ${payload.items.length} items using the ${payload.source} engine.`,
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  if (!project || !character) {
    return (
      <EmptyState
        title="Project and character are both required."
        description="Set up the account concept and choose the active character before generating the calendar."
        action={
          <div className="flex flex-wrap gap-3">
            <Button href="/project/new">Project Setup</Button>
            <Button href="/character/setup" variant="secondary">
              Character Setup
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="30-Day Calendar"
        title="Generate, inspect, and manage the month from one grid."
        description="The generator mixes lifestyle, wellness, fashion, office, and short story formats so the account does not drift into repetitive posting."
        actions={
          <>
            <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate 30 Days"}
            </Button>
            <Button href="/export" variant="secondary">
              Export Calendar
            </Button>
          </>
        }
      />

      {feedback ? <Card className="text-sm text-slate-200">{feedback}</Card> : null}

      {items.length === 0 ? (
        <EmptyState
          title="No calendar generated yet."
          description="Generate 30 days here. The mock generator is enough to satisfy the complete workflow even when there is no API key."
          action={
            <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate 30 Days"}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Day {item.dayNumber}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    {item.format}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={item.status} />
                  <StatusBadge status={item.visualCheckStatus} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold leading-7 text-white">{item.topic}</p>
                <p className="text-sm leading-7 text-slate-300">{item.hook}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/55 p-3 text-sm text-slate-300">
                <p className="font-medium text-white">{item.coverTitle}</p>
                <p className="mt-2 line-clamp-3">{item.caption}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={item.caption} label="Copy Caption" />
                <CopyButton value={item.visualPrompt} label="Copy Prompt" />
                <Button href={`/content/${item.id}`} variant="ghost">
                  Edit Item
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                {item.hashtags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <Link
                href={`/content/${item.id}`}
                className="text-sm font-medium text-cyan-200"
              >
                Open detail view
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
