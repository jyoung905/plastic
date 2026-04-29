'use client';

import { useParams } from "next/navigation";
import { startTransition, useState } from "react";

import {
  Button,
  Card,
  CopyButton,
  EmptyState,
  Field,
  PageIntro,
  StatusBadge,
  textInputClassName,
} from "@/components/ui";
import { isoNow, selectCurrentCharacter } from "@/lib/core";
import {
  generateContentDrafts,
  transplantGeneratedItem,
} from "@/lib/generationClient";
import { usePersistentAppState } from "@/lib/storage";
import type { Character, ContentItem, Project } from "@/lib/types";
import { applyVisualCheck } from "@/lib/visualCheck";

export default function ContentDetailPage() {
  const params = useParams<{ id: string }>();
  const { state, updateState } = usePersistentAppState();
  const item = state.contentItems.find((entry) => entry.id === params.id);
  const character = selectCurrentCharacter(state);

  if (!item || !state.project || !character) {
    return (
      <EmptyState
        title="Content item not found."
        description="Generate the calendar first, then open an item from the calendar grid."
        action={<Button href="/calendar">Back to Calendar</Button>}
      />
    );
  }

  return (
    <ContentEditor
      key={item.id}
      item={item}
      project={state.project}
      character={character}
      updateState={updateState}
    />
  );
}

function ContentEditor({
  item,
  project,
  character,
  updateState,
}: Readonly<{
  item: ContentItem;
  project: Project;
  character: Character;
  updateState: ReturnType<typeof usePersistentAppState>["updateState"];
}>) {
  const [form, setForm] = useState(() => ({
    format: item.format,
    topic: item.topic,
    hook: item.hook,
    script: item.script,
    caption: item.caption,
    hashtags: item.hashtags.join(", "),
    coverTitle: item.coverTitle,
    visualPrompt: item.visualPrompt,
    titlePlacement: item.titlePlacement,
  }));
  const [message, setMessage] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  function buildUpdatedItem(status = item.status) {
    return applyVisualCheck({
      ...item,
      format: form.format.trim(),
      topic: form.topic.trim(),
      hook: form.hook.trim(),
      script: form.script.trim(),
      caption: form.caption.trim(),
      hashtags: form.hashtags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      coverTitle: form.coverTitle.trim(),
      visualPrompt: form.visualPrompt.trim(),
      titlePlacement: form.titlePlacement.trim(),
      status,
      updatedAt: isoNow(),
    });
  }

  function persistItem(status = item.status) {
    const nextItem = buildUpdatedItem(status);

    updateState((current) => ({
      ...current,
      contentItems: current.contentItems.map((entry) =>
        entry.id === item.id ? nextItem : entry,
      ),
    }));

    setMessage("Item saved locally.");
  }

  async function regenerateItem() {
    setIsRegenerating(true);
    setMessage(null);

    try {
      const payload = await generateContentDrafts(project, character, 1);
      const regenerated = payload.items[0] ?? item;
      const nextItem = applyVisualCheck(transplantGeneratedItem(regenerated, item));

      startTransition(() => {
        updateState((current) => ({
          ...current,
          contentItems: current.contentItems.map((entry) =>
            entry.id === item.id ? nextItem : entry,
          ),
          settings: {
            ...current.settings,
            lastGenerator: payload.source,
            lastGeneratorError: payload.error || null,
          },
        }));
      });

      setForm({
        format: nextItem.format,
        topic: nextItem.topic,
        hook: nextItem.hook,
        script: nextItem.script,
        caption: nextItem.caption,
        hashtags: nextItem.hashtags.join(", "),
        coverTitle: nextItem.coverTitle,
        visualPrompt: nextItem.visualPrompt,
        titlePlacement: nextItem.titlePlacement,
      });

      setMessage(
        payload.error
          ? `Item regenerated with mock fallback because the API route returned an error: ${payload.error}`
          : `Item regenerated with the ${payload.source} engine.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Regeneration failed.");
    } finally {
      setIsRegenerating(false);
    }
  }

  const previewItem = buildUpdatedItem(item.status);

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow={`Content Item / Day ${item.dayNumber}`}
        title={item.topic}
        description="Edit the working draft, re-run the visual title check, regenerate the idea, and move the item through the local status flow."
        actions={
          <>
            <Button type="button" onClick={() => persistItem()}>
              Save Draft
            </Button>
            <Button type="button" variant="secondary" onClick={() => persistItem("approved")}>
              Approve
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={regenerateItem}
              disabled={isRegenerating}
            >
              {isRegenerating ? "Regenerating..." : "Regenerate Item"}
            </Button>
          </>
        }
      />

      {message ? <Card className="text-sm text-slate-200">{message}</Card> : null}

      <div className="flex flex-wrap gap-3">
        <StatusBadge status={item.status} />
        <StatusBadge status={previewItem.visualCheckStatus} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Format">
              <input
                className={textInputClassName()}
                value={form.format}
                onChange={(event) =>
                  setForm((current) => ({ ...current, format: event.target.value }))
                }
              />
            </Field>
            <Field label="Topic">
              <input
                className={textInputClassName()}
                value={form.topic}
                onChange={(event) =>
                  setForm((current) => ({ ...current, topic: event.target.value }))
                }
              />
            </Field>
          </div>

          <Field label="Hook">
            <textarea
              className={`${textInputClassName()} min-h-24`}
              value={form.hook}
              onChange={(event) =>
                setForm((current) => ({ ...current, hook: event.target.value }))
              }
            />
          </Field>

          <Field label="Script">
            <textarea
              className={`${textInputClassName()} min-h-40`}
              value={form.script}
              onChange={(event) =>
                setForm((current) => ({ ...current, script: event.target.value }))
              }
            />
          </Field>

          <Field label="Caption">
            <textarea
              className={`${textInputClassName()} min-h-32`}
              value={form.caption}
              onChange={(event) =>
                setForm((current) => ({ ...current, caption: event.target.value }))
              }
            />
          </Field>

          <Field label="Hashtags" hint="Comma separated.">
            <input
              className={textInputClassName()}
              value={form.hashtags}
              onChange={(event) =>
                setForm((current) => ({ ...current, hashtags: event.target.value }))
              }
            />
          </Field>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => persistItem("approved")}>
              Save + Approve
            </Button>
            <Button type="button" variant="secondary" onClick={() => persistItem("exported")}>
              Mark Exported
            </Button>
            <Button type="button" variant="ghost" onClick={() => persistItem("posted")}>
              Mark Posted
            </Button>
          </div>
        </Card>

        <Card className="space-y-5">
          <Field label="Cover title">
            <input
              className={textInputClassName()}
              value={form.coverTitle}
              onChange={(event) =>
                setForm((current) => ({ ...current, coverTitle: event.target.value }))
              }
            />
          </Field>

          <Field label="Title placement suggestion">
            <textarea
              className={`${textInputClassName()} min-h-24`}
              value={form.titlePlacement}
              onChange={(event) =>
                setForm((current) => ({ ...current, titlePlacement: event.target.value }))
              }
            />
          </Field>

          <Field label="Visual prompt">
            <textarea
              className={`${textInputClassName()} min-h-44`}
              value={form.visualPrompt}
              onChange={(event) =>
                setForm((current) => ({ ...current, visualPrompt: event.target.value }))
              }
            />
          </Field>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => persistItem(item.status)}>
              Run Visual Check
            </Button>
            <CopyButton value={form.script} label="Copy Script" />
            <CopyButton value={form.caption} label="Copy Caption" />
            <CopyButton value={form.visualPrompt} label="Copy Prompt" />
          </div>

          {previewItem.visualWarnings.length > 0 ? (
            <div className="rounded-2xl bg-amber-400/10 p-4 text-sm leading-7 text-amber-100">
              <p className="font-semibold">Visual warnings</p>
              {previewItem.visualWarnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-emerald-400/10 p-4 text-sm text-emerald-100">
              The current title guidance passes the checker.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
