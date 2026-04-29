'use client';

import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  PageIntro,
  textInputClassName,
} from "@/components/ui";
import { createId, isoNow, selectCurrentCharacter } from "@/lib/core";
import { usePersistentAppState } from "@/lib/storage";
import type { Character, CharacterMode } from "@/lib/types";

function emptyForm() {
  return {
    id: "",
    name: "Bella",
    mode: "strict_bella" as CharacterMode,
    consistencyLevel: 88,
    appearanceDescription:
      "fictional adult brunette creator, polished blowout, confident expression, candid camera-roll energy",
    personality: "Confident, self-aware, polished, lightly witty",
    wardrobeStyle: "Soft luxury neutrals, tailored basics, polished gym sets, everyday city layers",
    visualRules: "Vertical 9:16, natural skin texture, candid phone camera realism, no body-part focus",
    promptRules:
      "Broad style consistency only. Never imply a real person clone. Keep everything adult, safe, and mainstream.",
  };
}

export default function CharacterSetupPage() {
  const { state, updateState } = usePersistentAppState();
  const selectedCharacter = selectCurrentCharacter(state);
  const [message, setMessage] = useState<string | null>(null);

  if (!state.project) {
    return (
      <EmptyState
        title="Create a project first."
        description="Character profiles are attached to a project. Save the account concept before defining Bella or any Bella-inspired variants."
        action={<Button href="/project/new">Go to Project Setup</Button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Character Setup"
        title="Build Bella as a fictional adult creator archetype, not a real-person recreation."
        description="Strict Bella keeps the style tighter. Bella-inspired adds more variation. Open cast keeps the project vibe while loosening the character anchor. All modes stay adult, safe, and mainstream."
      />

      {message ? <Card className="text-sm text-cyan-200">{message}</Card> : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <CharacterForm
          key={selectedCharacter?.id ?? "new-character"}
          initialCharacter={selectedCharacter}
          projectId={state.project.id}
          onSave={(nextCharacter) => {
            updateState((current) => {
              const nextCharacters = current.characters.some(
                (character) => character.id === nextCharacter.id,
              )
                ? current.characters.map((character) =>
                    character.id === nextCharacter.id ? nextCharacter : character,
                  )
                : [...current.characters, nextCharacter];

              return {
                ...current,
                characters: nextCharacters,
                selectedCharacterId: nextCharacter.id,
              };
            });
            setMessage(`${nextCharacter.name} saved locally.`);
          }}
        />

        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Saved Variants</p>
            <h2 className="text-2xl font-semibold text-white">Choose the active character</h2>
          </div>

          {state.characters.length === 0 ? (
            <p className="text-sm leading-7 text-slate-300">
              No saved characters yet. Save the first Bella profile, then generate the calendar.
            </p>
          ) : (
            <div className="grid gap-3">
              {state.characters.map((character) => (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => {
                    updateState((current) => ({
                      ...current,
                      selectedCharacterId: character.id,
                    }));
                    setMessage(`Selected ${character.name}.`);
                  }}
                  className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-left transition hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-white">{character.name}</p>
                    <Badge tone="accent">{character.mode.replaceAll("_", " ")}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {character.appearanceDescription}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function CharacterForm({
  initialCharacter,
  projectId,
  onSave,
}: Readonly<{
  initialCharacter: Character | null;
  projectId: string;
  onSave: (character: Character) => void;
}>) {
  const [form, setForm] = useState(() => {
    if (!initialCharacter) {
      return emptyForm();
    }

    return {
      id: initialCharacter.id,
      name: initialCharacter.name,
      mode: initialCharacter.mode,
      consistencyLevel: initialCharacter.consistencyLevel,
      appearanceDescription: initialCharacter.appearanceDescription,
      personality: initialCharacter.personality,
      wardrobeStyle: initialCharacter.wardrobeStyle,
      visualRules: initialCharacter.visualRules,
      promptRules: initialCharacter.promptRules,
    };
  });
  const [message, setMessage] = useState<string | null>(null);

  function saveCharacter() {
    const now = isoNow();
    const characterId = form.id || createId("character");
    const nextCharacter: Character = {
      id: characterId,
      projectId,
      name: form.name.trim(),
      mode: form.mode,
      consistencyLevel: form.consistencyLevel,
      appearanceDescription: form.appearanceDescription.trim(),
      personality: form.personality.trim(),
      wardrobeStyle: form.wardrobeStyle.trim(),
      visualRules: form.visualRules.trim(),
      promptRules: form.promptRules.trim(),
      createdAt: initialCharacter?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(nextCharacter);
    setForm((current) => ({ ...current, id: characterId }));
    setMessage("Character form saved.");
  }

  return (
    <Card className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Character name">
          <input
            className={textInputClassName()}
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </Field>
        <Field label="Character mode">
          <select
            className={textInputClassName()}
            value={form.mode}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                mode: event.target.value as CharacterMode,
              }))
            }
          >
            <option value="strict_bella">Strict Bella</option>
            <option value="bella_inspired">Bella-inspired</option>
            <option value="open_cast">Open cast</option>
          </select>
        </Field>
      </div>

      <Field
        label={`Consistency level: ${form.consistencyLevel}`}
        hint="Higher keeps the visual identity tighter. Lower allows more stylistic variation."
      >
        <input
          type="range"
          min="0"
          max="100"
          value={form.consistencyLevel}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              consistencyLevel: Number(event.target.value),
            }))
          }
        />
      </Field>

      <Field label="Appearance description">
        <textarea
          className={`${textInputClassName()} min-h-28`}
          value={form.appearanceDescription}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              appearanceDescription: event.target.value,
            }))
          }
        />
      </Field>

      <Field label="Personality">
        <textarea
          className={`${textInputClassName()} min-h-24`}
          value={form.personality}
          onChange={(event) =>
            setForm((current) => ({ ...current, personality: event.target.value }))
          }
        />
      </Field>

      <Field label="Wardrobe style">
        <textarea
          className={`${textInputClassName()} min-h-24`}
          value={form.wardrobeStyle}
          onChange={(event) =>
            setForm((current) => ({ ...current, wardrobeStyle: event.target.value }))
          }
        />
      </Field>

      <Field label="Visual rules">
        <textarea
          className={`${textInputClassName()} min-h-24`}
          value={form.visualRules}
          onChange={(event) =>
            setForm((current) => ({ ...current, visualRules: event.target.value }))
          }
        />
      </Field>

      <Field label="Prompt rules">
        <textarea
          className={`${textInputClassName()} min-h-24`}
          value={form.promptRules}
          onChange={(event) =>
            setForm((current) => ({ ...current, promptRules: event.target.value }))
          }
        />
      </Field>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={saveCharacter}>
          Save Character
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setForm(emptyForm());
            setMessage("Creating a fresh variant.");
          }}
        >
          New Variant
        </Button>
      </div>

      {message ? <p className="text-sm text-cyan-200">{message}</p> : null}
    </Card>
  );
}
