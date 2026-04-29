'use client';

import { useState } from "react";

import {
  Button,
  Card,
  EmptyState,
  Field,
  PageIntro,
  StatusBadge,
  textInputClassName,
} from "@/components/ui";
import { isoNow, sortContentItems } from "@/lib/core";
import { usePersistentAppState } from "@/lib/storage";
import { checkVisualTitlePlacement } from "@/lib/visualCheck";

export default function CheckerPage() {
  const { state, updateState } = usePersistentAppState();
  const items = sortContentItems(state.contentItems);
  const [selectedItemId, setSelectedItemId] = useState("");

  if (items.length === 0) {
    return (
      <EmptyState
        title="Generate content before running the checker."
        description="The checker can evaluate any manual title, but it is most useful when it is attached to real items in the calendar."
        action={<Button href="/calendar">Open Calendar</Button>}
      />
    );
  }

  const effectiveSelectedItemId = selectedItemId || items[0].id;
  const selectedItem =
    items.find((item) => item.id === effectiveSelectedItemId) ?? items[0];

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Visual Checker"
        title="Keep cover titles readable and away from the face and UI zones."
        description="This checker warns on long titles, weak contrast notes, risky top or bottom placement, face overlap, and titles that run beyond two lines."
      />

      <CheckerForm
        key={selectedItem.id}
        items={items}
        selectedItem={selectedItem}
        selectedItemId={effectiveSelectedItemId}
        onSelectedItemChange={setSelectedItemId}
        updateState={updateState}
      />
    </div>
  );
}

function CheckerForm({
  items,
  selectedItem,
  selectedItemId,
  onSelectedItemChange,
  updateState,
}: Readonly<{
  items: ReturnType<typeof sortContentItems>;
  selectedItem: ReturnType<typeof sortContentItems>[number];
  selectedItemId: string;
  onSelectedItemChange: (value: string) => void;
  updateState: ReturnType<typeof usePersistentAppState>["updateState"];
}>) {
  const [coverTitle, setCoverTitle] = useState(selectedItem.coverTitle);
  const [titlePlacement, setTitlePlacement] = useState(selectedItem.titlePlacement);
  const [message, setMessage] = useState<string | null>(null);
  const result = checkVisualTitlePlacement(coverTitle, titlePlacement);

  function applyResultToItem() {
    updateState((current) => ({
      ...current,
      contentItems: current.contentItems.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              coverTitle: coverTitle.trim(),
              titlePlacement: titlePlacement.trim(),
              visualCheckStatus: result.status,
              visualWarnings: result.warnings,
              updatedAt: isoNow(),
            }
          : item,
      ),
    }));

    setMessage("Checker result applied to the item.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="space-y-5">
        <Field label="Select content item">
          <select
            className={textInputClassName()}
            value={selectedItemId}
            onChange={(event) => onSelectedItemChange(event.target.value)}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                Day {item.dayNumber}: {item.coverTitle}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Cover title">
          <input
            className={textInputClassName()}
            value={coverTitle}
            onChange={(event) => setCoverTitle(event.target.value)}
          />
        </Field>

        <Field label="Placement note">
          <textarea
            className={`${textInputClassName()} min-h-32`}
            value={titlePlacement}
            onChange={(event) => setTitlePlacement(event.target.value)}
          />
        </Field>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={applyResultToItem}>
            Apply to Item
          </Button>
          <Button href={`/content/${selectedItemId}`} variant="secondary">
            Open Item Detail
          </Button>
        </div>

        {message ? <p className="text-sm text-cyan-200">{message}</p> : null}
      </Card>

      <Card className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Result</p>
            <h2 className="text-2xl font-semibold text-white">Safe-zone review</h2>
          </div>
          <StatusBadge status={result.status} />
        </div>

        {result.warnings.length === 0 ? (
          <div className="rounded-2xl bg-emerald-400/10 p-4 text-sm leading-7 text-emerald-100">
            Pass. The title is within the length rule and the placement recommends a safe area.
          </div>
        ) : (
          <div className="grid gap-3">
            {result.warnings.map((warning) => (
              <div
                key={warning}
                className="rounded-2xl bg-amber-400/10 p-4 text-sm leading-7 text-amber-100"
              >
                {warning}
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-3">
          <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
            Recommended phrasing: upper third, lower third above UI, or side placement away from the face.
          </div>
          <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
            Always include a contrast note such as white text with shadow, dark outline, or bold fill.
          </div>
          <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
            Keep the cover title compact enough to stay within two lines.
          </div>
        </div>
      </Card>
    </div>
  );
}
