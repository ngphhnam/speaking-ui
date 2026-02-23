# AI Speaking / IELTS Speaking Practice (Next.js)

Web app for **self-practice IELTS Speaking**: practice by Part 1/2/3, manage topics & questions, take a full **mock test**, review **learning history**, and maintain a **personal vocabulary book**. The UI is built with Next.js App Router and integrates with an external backend API for authentication and data.

![App preview](./banner.png)

## Features

- **Practice by Questions** (`/practice-by-questions`): pick a Part, select a topic, and practice question-by-question.
- **Topics & Questions management** (`/topics`, `/topics/manage`, `/topics/create`): create/edit topics and questions (includes “Part 2 & Part 3” mapping support).
- **Mock Test** (`/mock-test`): start a full speaking mock test and view results.
- **Learning History** (`/learning-history`): sessions list, score filters, progress statistics.
- **Profile & Settings** (`/my-profile`, `/settings`): profile updates, practice preferences, notification preferences.
- **Vocabulary Book** (`/vocabulary-book`): save and review vocabulary items.
- **OAuth login**: Google / GitHub via NextAuth; backend social-login is triggered from `/social-callback`.
- **i18n**: English/Vietnamese strings via `react-i18next`.

## Tech stack

- Next.js **15** (App Router) + React **19** + TypeScript
- Tailwind CSS **v4**
- Redux Toolkit + RTK Query
- NextAuth (Google/GitHub providers)

## Getting started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- A running backend API (see `NEXT_PUBLIC_API_BASE_URL` below)

### Install & run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Environment variables

Copy `env.example` to `.env.local` and fill in your values.

If you use `npm run prod`, copy `env.pro.example` to `.env.pro`.

### Required (frontend → backend)

- `NEXT_PUBLIC_API_BASE_URL`  
  Base URL of your backend API (the app calls endpoints like `/api/auth/me`, `/api/topics`, `/api/mock-tests`, etc.).

### Required (NextAuth OAuth)

- `NEXTAUTH_URL`  
  Your Next.js site URL (example: `http://localhost:3000` in local dev).
- `NEXTAUTH_SECRET`  
  Long random string.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

For production values and OAuth redirect URLs, see `ENVIRONMENT.md`.

### Optional (local AI services)

These have defaults (see `src/lib/api/speaking.ts`) and are only needed if you run those services:

- `NEXT_PUBLIC_LLAMA_API_BASE_URL` (default `http://localhost:11435`)
- `NEXT_PUBLIC_LANGUAGE_TOOL_API_BASE_URL` (default `http://localhost:8010`)

## Useful scripts

- `npm run dev`: start dev server
- `npm run build`: build
- `npm run start`: start production server
- `npm run prod`: build using `.env.pro` (see `package.json`)
- `npm run import-data`: import `sample-data.json` into your backend (see `README-SAMPLE-DATA.md`)

## Sample data (topics/questions)

If you want quick data to test the Topics/Questions and practice flows:

- Read `README-SAMPLE-DATA.md`
- Run:

```bash
npm run import-data
```

The import script uses `API_URL` (defaults to `http://localhost:5000/api`) — see `scripts/import-data.js`.

## Credits

This project started from the **TailAdmin free Next.js dashboard template**, then was adapted and extended into an IELTS Speaking practice product.

## License

MIT — see `LICENSE`.

