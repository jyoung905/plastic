# Consistent Creator

Consistent Creator is a private, local-first TikTok content engine for building a consistent fictional adult lifestyle creator called Bella, plus optional Bella-inspired variants and open-cast variants. It does not include SaaS features, billing, TikTok publishing, or fake connection states.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- LocalStorage persistence
- Optional OpenAI-backed API route with a local mock fallback

## Core Workflow

1. Open the dashboard at `/`.
2. Create a project at `/project/new`.
3. Create or select a character at `/character/setup`.
4. Generate the calendar at `/calendar`.
5. Edit and approve items at `/content/[id]`.
6. Run the visual safe-zone checker at `/checker`.
7. Copy exports at `/export`.
8. Review local storage and env guidance at `/settings`.

## Safety Boundaries

- Fictional adult creator only
- No minors
- No nudity
- No explicit or erotic content
- No fetish language
- No body-part-focused prompts
- No dangerous challenges
- No illegal activity
- No fake TikTok connection or publishing state

## Environment Variables

Create `.env.local` in the project root only if you want to use the OpenAI-backed route:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

If `OPENAI_API_KEY` is missing, the app still works by using the local mock generator.

## Exact Run Steps

1. Install dependencies:

```bash
npm install
```

2. Optionally create `.env.local` using `.env.example`.

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Verification Commands

Run these after changes:

```bash
npm run typecheck
npm run lint
```

## Local Persistence

- App data is stored in `localStorage`.
- Refreshing the page keeps the project, character, and content items in the same browser profile.
- The Settings page includes a local reset button.

## API Route

- Route: `/api/generate-content`
- Input: `project`, `character`, `count`
- Output: `items`, `source`, and optional `error`
- Behavior:
  - Uses the OpenAI Responses API when `OPENAI_API_KEY` exists
  - Falls back to the local mock generator if the key is missing or the request fails

## Notes

- This is a personal-use local app, not a SaaS product.
- There is no TikTok API integration yet.
- There is no billing implementation.
