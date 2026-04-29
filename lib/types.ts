export type CharacterMode = "strict_bella" | "bella_inspired" | "open_cast";

export type ContentStatus =
  | "idea"
  | "draft"
  | "approved"
  | "exported"
  | "posted";

export type VisualCheckStatus = "not_checked" | "pass" | "warning" | "fail";

export interface Project {
  id: string;
  accountName: string;
  niche: string;
  audience: string;
  tone: string;
  contentGoals: string[];
  contentPillars: string[];
  bannedTopics: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  mode: CharacterMode;
  consistencyLevel: number;
  appearanceDescription: string;
  personality: string;
  wardrobeStyle: string;
  visualRules: string;
  promptRules: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  projectId: string;
  characterId: string;
  dayNumber: number;
  format: string;
  topic: string;
  hook: string;
  script: string;
  caption: string;
  hashtags: string[];
  coverTitle: string;
  visualPrompt: string;
  titlePlacement: string;
  status: ContentStatus;
  visualCheckStatus: VisualCheckStatus;
  visualWarnings: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  preferredGenerationCount: number;
  lastGenerator: "mock" | "openai" | null;
  lastGeneratorError: string | null;
}

export interface AppState {
  project: Project | null;
  characters: Character[];
  selectedCharacterId: string | null;
  contentItems: ContentItem[];
  settings: AppSettings;
}

export interface GenerateContentRequest {
  project: Project;
  character: Character;
  count: number;
}

export interface GenerateContentResponse {
  items: ContentItem[];
  source: "mock" | "openai";
  error?: string | null;
}
