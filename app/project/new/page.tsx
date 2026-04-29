'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Card, Field, PageIntro, textInputClassName } from "@/components/ui";
import { createId, isoNow, splitList } from "@/lib/core";
import { usePersistentAppState } from "@/lib/storage";
import type { Project } from "@/lib/types";

export default function ProjectSetupPage() {
  const router = useRouter();
  const { state, updateState } = usePersistentAppState();

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Project Setup"
        title="Define the account concept before you ask the engine to create content."
        description="Everything here becomes the planning brief for captions, prompts, and topic variety. Keep it clear and brand-safe so Bella stays consistent without drifting into prohibited themes."
      />

      <ProjectForm
        key={state.project?.id ?? "new-project"}
        project={state.project}
        onSave={(nextProject) => {
          updateState((current) => ({
            ...current,
            project: nextProject,
          }));
          router.push("/character/setup");
        }}
      />
    </div>
  );
}

function ProjectForm({
  project,
  onSave,
}: Readonly<{
  project: Project | null;
  onSave: (project: Project) => void;
}>) {
  const [accountName, setAccountName] = useState(project?.accountName ?? "");
  const [niche, setNiche] = useState(project?.niche ?? "");
  const [audience, setAudience] = useState(project?.audience ?? "");
  const [tone, setTone] = useState(project?.tone ?? "");
  const [contentGoals, setContentGoals] = useState(
    project?.contentGoals.join(", ") ?? "",
  );
  const [contentPillars, setContentPillars] = useState(
    project?.contentPillars.join(", ") ?? "",
  );
  const [bannedTopics, setBannedTopics] = useState(
    project?.bannedTopics.join(", ") ?? "",
  );
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    const now = isoNow();
    const nextProject: Project = {
      id: project?.id ?? createId("project"),
      accountName: accountName.trim(),
      niche: niche.trim(),
      audience: audience.trim(),
      tone: tone.trim(),
      contentGoals: splitList(contentGoals),
      contentPillars: splitList(contentPillars),
      bannedTopics: splitList(bannedTopics),
      createdAt: project?.createdAt ?? now,
      updatedAt: now,
    };

    setMessage("Project saved locally.");
    onSave(nextProject);
  }

  return (
    <Card className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Account name"
          hint="Example: Bella After Hours, Toronto Bella Edit, Main Character Mornings."
        >
          <input
            className={textInputClassName()}
            value={accountName}
            onChange={(event) => setAccountName(event.target.value)}
            placeholder="Consistent Creator Bella"
          />
        </Field>
        <Field
          label="Niche"
          hint="Mainstream lifestyle only: office, wellness, routines, fashion, errands, travel."
        >
          <input
            className={textInputClassName()}
            value={niche}
            onChange={(event) => setNiche(event.target.value)}
            placeholder="Soft luxury Toronto lifestyle"
          />
        </Field>
        <Field label="Target audience" hint="Who should relate to the tone and routines?">
          <input
            className={textInputClassName()}
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            placeholder="Women 22-34 building confident city routines"
          />
        </Field>
        <Field label="Vibe / tone" hint="Concise but specific.">
          <input
            className={textInputClassName()}
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            placeholder="Polished, confident, witty, camera-roll candid"
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Content goals" hint="Comma or newline separated.">
          <textarea
            className={`${textInputClassName()} min-h-32`}
            value={contentGoals}
            onChange={(event) => setContentGoals(event.target.value)}
            placeholder="Grow posting consistency, maintain brand tone, build a month's worth of safe TikTok ideas"
          />
        </Field>
        <Field label="Content pillars" hint="These help the generator mix topics intelligently.">
          <textarea
            className={`${textInputClassName()} min-h-32`}
            value={contentPillars}
            onChange={(event) => setContentPillars(event.target.value)}
            placeholder="coffee routines, office fits, gym resets, Toronto errands, productivity habits"
          />
        </Field>
      </div>

      <Field label="Banned topics" hint="Use this to explicitly avoid anything off-brand or unsafe.">
        <textarea
          className={`${textInputClassName()} min-h-28`}
          value={bannedTopics}
          onChange={(event) => setBannedTopics(event.target.value)}
          placeholder="nudity, explicit dating, dangerous pranks, alcohol-heavy party content, gambling"
        />
      </Field>

      {message ? <p className="text-sm text-cyan-200">{message}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleSave}>
          Save Project
        </Button>
        <Button href="/character/setup" variant="secondary">
          Continue to Character Setup
        </Button>
      </div>
    </Card>
  );
}
