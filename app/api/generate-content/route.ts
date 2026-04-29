import { generateMockContent } from "@/lib/mockGenerator";
import type { Character, ContentItem, GenerateContentRequest, Project } from "@/lib/types";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

function contentSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["items"],
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
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
          ],
          properties: {
            dayNumber: { type: "integer" },
            format: { type: "string" },
            topic: { type: "string" },
            hook: { type: "string" },
            script: { type: "string" },
            caption: { type: "string" },
            hashtags: {
              type: "array",
              items: { type: "string" },
            },
            coverTitle: { type: "string" },
            visualPrompt: { type: "string" },
            titlePlacement: { type: "string" },
          },
        },
      },
    },
  };
}

function extractOutputText(payload: Record<string, unknown>) {
  const direct = payload.output_text;
  if (typeof direct === "string" && direct.trim().length > 0) {
    return direct;
  }

  const output = Array.isArray(payload.output) ? payload.output : [];
  const chunks: string[] = [];

  for (const entry of output) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const typedEntry = entry as {
      type?: string;
      refusal?: string;
      content?: Array<{ type?: string; text?: string; refusal?: string }>;
    };

    if (typedEntry.type === "refusal" && typedEntry.refusal) {
      throw new Error(typedEntry.refusal);
    }

    if (!Array.isArray(typedEntry.content)) {
      continue;
    }

    for (const content of typedEntry.content) {
      if (content.type === "refusal" && content.refusal) {
        throw new Error(content.refusal);
      }

      if (content.type === "output_text" && typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("\n").trim();
}

function normalizeGeneratedItems(
  project: Project,
  character: Character,
  items: ContentItem[],
): ContentItem[] {
  return items.map((item, index) => ({
    ...item,
    projectId: project.id,
    characterId: character.id,
    dayNumber: index + 1,
  }));
}

function normalizeOpenAIItems(
  project: Project,
  character: Character,
  rawItems: Array<{
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
  }>,
) {
  const fallback = generateMockContent(project, character, rawItems.length || 1);

  return fallback.map((item, index) => {
    const raw = rawItems[index];

    if (!raw) {
      return item;
    }

    return {
      ...item,
      dayNumber: raw.dayNumber || index + 1,
      format: raw.format,
      topic: raw.topic,
      hook: raw.hook,
      script: raw.script,
      caption: raw.caption,
      hashtags: raw.hashtags,
      coverTitle: raw.coverTitle,
      visualPrompt: raw.visualPrompt,
      titlePlacement: raw.titlePlacement,
    };
  });
}

async function generateWithOpenAI(project: Project, character: Character, count: number) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "You generate mainstream TikTok-safe drafts for a fictional adult lifestyle creator workflow.",
                "Return JSON only via the provided schema.",
                "Never create minors, nudity, erotic framing, fetish language, dangerous challenges, illegal activity, or spammy TikTok language.",
                "Bella is fictional and adult. Never imply the character is an exact clone of a real person.",
                "Mix formats and avoid repetitive topics.",
              ].join(" "),
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                count,
                project,
                character,
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "content_calendar",
          strict: true,
          schema: contentSchema(),
        },
      },
    }),
  });

  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(
      typeof payload.error === "object" &&
        payload.error &&
        "message" in payload.error &&
        typeof payload.error.message === "string"
        ? payload.error.message
        : "OpenAI request failed.",
    );
  }

  const text = extractOutputText(payload);

  if (!text) {
    throw new Error("OpenAI returned no structured output.");
  }

  const parsed = JSON.parse(text) as {
    items: Array<{
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
    }>;
  };

  return normalizeOpenAIItems(project, character, parsed.items);
}

export async function POST(request: Request) {
  const body = (await request.json()) as GenerateContentRequest;
  const project = body.project;
  const character = body.character;
  const count = Math.min(Math.max(body.count || 30, 1), 60);

  if (!project || !character) {
    return Response.json(
      {
        items: [],
        source: "mock",
        error: "Project and character are required.",
      },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({
      items: normalizeGeneratedItems(project, character, generateMockContent(project, character, count)),
      source: "mock",
      error: null,
    });
  }

  try {
    const items = await generateWithOpenAI(project, character, count);

    return Response.json({
      items: normalizeGeneratedItems(project, character, items),
      source: "openai",
      error: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "OpenAI generation failed unexpectedly.";

    return Response.json({
      items: normalizeGeneratedItems(project, character, generateMockContent(project, character, count)),
      source: "mock",
      error: message,
    });
  }
}
