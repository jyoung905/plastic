import type { AppState, Character, ContentItem } from "@/lib/types";

export const APP_STORAGE_KEY = "consistent-creator-state-v1";

export function isoNow() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function splitList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugifyTag(value: string) {
  const compact = value.replace(/[^a-zA-Z0-9\s]/g, " ").trim();
  const words = compact.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return null;
  }

  return `#${words
    .slice(0, 3)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")}`;
}

export function sortContentItems(items: ContentItem[]) {
  return [...items].sort((left, right) => left.dayNumber - right.dayNumber);
}

export function includesBannedTerm(text: string, bannedTopics: string[]) {
  const lowerText = text.toLowerCase();
  return bannedTopics.some((topic) => {
    const value = topic.trim().toLowerCase();
    return value.length > 0 && lowerText.includes(value);
  });
}

export function selectCurrentCharacter(state: AppState): Character | null {
  if (state.characters.length === 0) {
    return null;
  }

  return (
    state.characters.find((character) => character.id === state.selectedCharacterId) ??
    state.characters[0]
  );
}
