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

Copy `env.example` to `.env.local` for development, or `env.pro.example` to `.env.pro` for production builds.

### Required (frontend → backend)

- `NEXT_PUBLIC_API_BASE_URL`  
  Base URL of your backend API (the app calls endpoints like `/api/auth/me`, `/api/topics`, `/api/mock-tests`, etc.).
  
  - **Development**: `http://localhost:5000` (or your local API URL)
  - **Production**: Your production API URL (e.g., `https://api.yourdomain.com`)

### Required (NextAuth OAuth)

- `NEXTAUTH_URL`  
  Your Next.js site URL.
  - **Development**: `http://localhost:3000`
  - **Production**: Your production domain (e.g., `https://yourdomain.com`)
  
- `NEXTAUTH_SECRET`  
  Long random string used for encrypting JWT tokens. Generate one using:
  ```bash
  openssl rand -base64 32
  ```

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`  
  OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
  
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`  
  OAuth credentials from [GitHub Developer Settings](https://github.com/settings/developers)

#### OAuth Redirect URLs

Make sure to configure these redirect URLs in your OAuth provider settings:

**Google:**
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://yourdomain.com/api/auth/callback/google`

**GitHub:**
- Development: `http://localhost:3000/api/auth/callback/github`
- Production: `https://yourdomain.com/api/auth/callback/github`

### Optional (local AI services)

These have defaults (see `src/lib/api/speaking.ts`) and are only needed if you run those services locally:

- `NEXT_PUBLIC_LLAMA_API_BASE_URL` (default: `http://localhost:11435`)
- `NEXT_PUBLIC_LANGUAGE_TOOL_API_BASE_URL` (default: `http://localhost:8010`)

## Available scripts

- `npm run dev` - Start development server on `http://localhost:3000`
- `npm run build` - Build the application for production
- `npm run start` - Start production server (requires build first)
- `npm run prod` - Build using `.env.pro` environment file
- `npm run lint` - Run ESLint to check code quality
- `npm run import-data` - Import sample topics and questions from `sample-data.json` into your backend

## Sample data (topics/questions)

If you want quick data to test the Topics/Questions and practice flows:

1. Read `README-SAMPLE-DATA.md` for detailed instructions
2. Make sure your backend API is running
3. Run the import script:

```bash
npm run import-data
```

The import script uses `API_URL` (defaults to `http://localhost:5000/api`) — see `scripts/import-data.js` for configuration.

This will import sample topics and questions from `sample-data.json` into your backend database.

## Project structure

```
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   │   ├── (admin)/      # Admin routes (topics, practice, etc.)
│   │   └── api/          # API routes (NextAuth, etc.)
│   ├── components/       # React components
│   │   ├── topics/       # Topic management components
│   │   ├── practice/     # Practice session components
│   │   ├── mock-test/    # Mock test components
│   │   └── ...
│   ├── store/            # Redux store and API slices
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── i18n/             # Internationalization config
├── public/               # Static assets
├── scripts/              # Utility scripts (import-data, etc.)
└── sample-data.json      # Sample data for testing
```

## Credits

This project started from the **TailAdmin free Next.js dashboard template**, then was adapted and extended into an IELTS Speaking practice product.

## License

MIT — see `LICENSE`.

