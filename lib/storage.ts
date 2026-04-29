'use client';

import { useSyncExternalStore } from "react";

import { APP_STORAGE_KEY, sortContentItems } from "@/lib/core";
import type { AppState } from "@/lib/types";

export const defaultAppState: AppState = {
  project: null,
  characters: [],
  selectedCharacterId: null,
  contentItems: [],
  settings: {
    preferredGenerationCount: 30,
    lastGenerator: null,
    lastGeneratorError: null,
  },
};

let cachedRaw: string | null | undefined;
let cachedState: AppState = defaultAppState;

const listeners = new Set<() => void>();
let isStorageListenerAttached = false;

function mergeWithDefaults(value: unknown): AppState {
  if (!value || typeof value !== "object") {
    return defaultAppState;
  }

  const parsed = value as Partial<AppState>;

  return {
    project: parsed.project ?? null,
    characters: Array.isArray(parsed.characters) ? parsed.characters : [],
    selectedCharacterId: parsed.selectedCharacterId ?? null,
    contentItems: Array.isArray(parsed.contentItems)
      ? sortContentItems(parsed.contentItems)
      : [],
    settings: {
      ...defaultAppState.settings,
      ...(parsed.settings ?? {}),
    },
  };
}

function readRawState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(APP_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setCachedSnapshot(raw: string | null, state: AppState) {
  cachedRaw = raw;
  cachedState = state;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function syncCacheFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedState;
  }

  if (!raw) {
    setCachedSnapshot(raw, defaultAppState);
    return cachedState;
  }

  try {
    setCachedSnapshot(raw, mergeWithDefaults(JSON.parse(raw)));
  } catch {
    setCachedSnapshot(raw, defaultAppState);
  }

  return cachedState;
}

function handleStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== APP_STORAGE_KEY) {
    return;
  }

  const nextRaw = event.key === null ? readRawState() : event.newValue;

  if (nextRaw === cachedRaw) {
    return;
  }

  syncCacheFromRaw(nextRaw);
  notify();
}

function ensureStorageListener() {
  if (typeof window === "undefined" || isStorageListenerAttached) {
    return;
  }

  window.addEventListener("storage", handleStorage);
  isStorageListenerAttached = true;
}

function cleanupStorageListener() {
  if (typeof window === "undefined" || !isStorageListenerAttached || listeners.size > 0) {
    return;
  }

  window.removeEventListener("storage", handleStorage);
  isStorageListenerAttached = false;
}

export function getSnapshot() {
  if (typeof window === "undefined") {
    return defaultAppState;
  }

  const raw = readRawState();
  return syncCacheFromRaw(raw);
}

export function loadAppState() {
  return getSnapshot();
}

export function saveAppState(state: AppState) {
  const raw = JSON.stringify(state);
  setCachedSnapshot(raw, state);

  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_STORAGE_KEY, raw);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureStorageListener();

  return () => {
    listeners.delete(listener);
    cleanupStorageListener();
  };
}

export function usePersistentAppState() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => defaultAppState);

  function updateState(updater: AppState | ((current: AppState) => AppState)) {
    const current = getSnapshot();
    const next =
      typeof updater === "function"
        ? (updater as (current: AppState) => AppState)(current)
        : updater;
    saveAppState(next);
    notify();
  }

  function resetState() {
    updateState(defaultAppState);
  }

  return {
    state,
    isHydrated: typeof window !== "undefined",
    updateState,
    resetState,
  };
}
