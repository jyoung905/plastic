'use client';

import { useState } from "react";

import {
  Button,
  Card,
  CopyButton,
  EmptyState,
  Field,
  PageIntro,
  textInputClassName,
} from "@/components/ui";
import { sortContentItems } from "@/lib/core";
import { usePersistentAppState } from "@/lib/storage";

function quote(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function ExportPage() {
  const { state } = usePersistentAppState();
  const items = sortContentItems(state.contentItems);
  const [selectedItemId, setSelectedItemId] = useState("");

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing to export yet."
        description="Generate the calendar first, then use this page to copy the full month, only captions, only prompts, an individual item, or CSV-like text."
        action={<Button href="/calendar">Open Calendar</Button>}
      />
    );
  }

  const effectiveSelectedItemId = selectedItemId || items[0].id;
  const selectedItem =
    items.find((item) => item.id === effectiveSelectedItemId) ?? items[0];

  const fullCalendar = items
    .map(
      (item) =>
        `Day ${item.dayNumber}\nFormat: ${item.format}\nTopic: ${item.topic}\nHook: ${item.hook}\nScript: ${item.script}\nCaption: ${item.caption}\nHashtags: ${item.hashtags.join(" ")}\nCover title: ${item.coverTitle}\nVisual prompt: ${item.visualPrompt}\nTitle placement: ${item.titlePlacement}`,
    )
    .join("\n\n---\n\n");

  const captionsOnly = items
    .map((item) => `Day ${item.dayNumber}: ${item.caption}\n${item.hashtags.join(" ")}`)
    .join("\n\n");

  const promptsOnly = items
    .map((item) => `Day ${item.dayNumber}: ${item.visualPrompt}`)
    .join("\n\n");

  const selectedItemText = `Day ${selectedItem.dayNumber}\nFormat: ${selectedItem.format}\nTopic: ${selectedItem.topic}\nHook: ${selectedItem.hook}\nScript: ${selectedItem.script}\nCaption: ${selectedItem.caption}\nHashtags: ${selectedItem.hashtags.join(" ")}\nCover title: ${selectedItem.coverTitle}\nVisual prompt: ${selectedItem.visualPrompt}\nTitle placement: ${selectedItem.titlePlacement}`;

  const csvLike = [
    [
      "dayNumber",
      "format",
      "topic",
      "hook",
      "script",
      "caption",
      "hashtags",
      "coverTitle",
      "visualPrompt",
      "titlePlacement",
      "status",
    ].join(","),
    ...items.map((item) =>
      [
        item.dayNumber,
        quote(item.format),
        quote(item.topic),
        quote(item.hook),
        quote(item.script),
        quote(item.caption),
        quote(item.hashtags.join(" ")),
        quote(item.coverTitle),
        quote(item.visualPrompt),
        quote(item.titlePlacement),
        quote(item.status),
      ].join(","),
    ),
  ].join("\n");

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Export"
        title="Copy the exact assets you need for manual posting."
        description="This app does not publish to TikTok yet and does not fake a connection state. Export here, then post manually wherever you want."
      />

      <Card className="space-y-4">
        <Field label="Selected item">
          <select
            className={textInputClassName()}
            value={effectiveSelectedItemId}
            onChange={(event) => setSelectedItemId(event.target.value)}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                Day {item.dayNumber}: {item.coverTitle}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Full 30-day calendar</h2>
            <CopyButton value={fullCalendar} label="Copy Calendar" />
          </div>
          <textarea className={`${textInputClassName()} min-h-96`} readOnly value={fullCalendar} />
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">All captions</h2>
            <CopyButton value={captionsOnly} label="Copy Captions" />
          </div>
          <textarea className={`${textInputClassName()} min-h-96`} readOnly value={captionsOnly} />
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">All visual prompts</h2>
            <CopyButton value={promptsOnly} label="Copy Prompts" />
          </div>
          <textarea className={`${textInputClassName()} min-h-96`} readOnly value={promptsOnly} />
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Selected item</h2>
            <CopyButton value={selectedItemText} label="Copy Item" />
          </div>
          <textarea className={`${textInputClassName()} min-h-96`} readOnly value={selectedItemText} />
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">CSV-like text</h2>
          <CopyButton value={csvLike} label="Copy CSV" />
        </div>
        <textarea className={`${textInputClassName()} min-h-80`} readOnly value={csvLike} />
      </Card>
    </div>
  );
}
