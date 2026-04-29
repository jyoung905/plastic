import type {
  Character,
  ContentItem,
  GenerateContentResponse,
  Project,
} from "@/lib/types";

export async function generateContentDrafts(
  project: Project,
  character: Character,
  count: number,
) {
  const response = await fetch("/api/generate-content", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project,
      character,
      count,
    }),
  });

  const payload = (await response.json()) as GenerateContentResponse;

  if (!response.ok) {
    throw new Error(payload.error || "Content generation failed.");
  }

  return payload;
}

export function transplantGeneratedItem(
  generated: ContentItem,
  original: ContentItem,
): ContentItem {
  return {
    ...generated,
    id: original.id,
    dayNumber: original.dayNumber,
    createdAt: original.createdAt,
    status: original.status === "posted" ? "posted" : "draft",
  };
}
