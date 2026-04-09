# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack
npm run build        # Production build (requires NODE_OPTIONS for node-compat.cjs)
npm run lint         # ESLint via Next.js
npm test             # Run Vitest tests
npm run db:reset     # Reset database (destructive)
```

Run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Environment

Requires `ANTHROPIC_API_KEY` in `.env`. Without it, the app falls back to a `MockLanguageModel` that returns static component templates — useful for UI development without API costs.

The `node-compat.cjs` shim is required for production builds and the `dev:daemon` script to polyfill Node.js APIs not available in the Next.js edge runtime.

## Architecture

UIGen is an AI-powered React component generator. Users describe a component in chat; Claude generates/edits files in a virtual file system; the result renders live in an iframe.

### Data Flow

1. User sends message → `POST /api/chat` with full serialized file system + project ID
2. Server reconstructs `VirtualFileSystem`, calls Claude (streaming) with two tools
3. Claude uses tools to create/edit files → tool results stream back to client
4. Client applies file changes via `FileSystemContext` → `PreviewFrame` re-renders
5. Authenticated users: project state (messages + files as JSON strings) saved to SQLite via Prisma

### Virtual File System (`src/lib/file-system.ts`)

All files live in memory — no disk I/O. Serialized as JSON and round-tripped through the API on every request. The `VirtualFileSystem` class handles CRUD and rename; `serialize()`/`deserialize()` handle persistence.

### AI Tools (`src/lib/tools/`)

Claude is given two tools at the API route level:
- **`str_replace_editor`** — view, create, str_replace, insert operations on files
- **`file_manager`** — rename and delete files/directories

### JSX Transformer (`src/lib/transform/jsx-transformer.ts`)

Client-side Babel standalone transforms JSX → executable ES modules. Dependencies (React, React DOM, etc.) are loaded from `esm.sh` CDN via import maps. CSS imports are stripped before execution.

### Live Preview (`src/components/preview/PreviewFrame.tsx`)

Renders the virtual file system in a sandboxed `<iframe>`. Entry point is always `/App.jsx`. The transformer resolves `@/` imports against the virtual file system.

### State Management

Two React Contexts own global state:
- **`ChatContext`** (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK's `useChat`, holds message history, exposes send/stop
- **`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`) — owns the `VirtualFileSystem` instance, selected file, handles tool call results from the AI stream

### Authentication (`src/lib/auth.ts`, `src/middleware.ts`)

JWT sessions (7-day expiry) stored in cookies, verified in middleware. Passwords hashed with bcrypt. Anonymous users can use the app freely; their work is tracked in localStorage via `anon-work-tracker.ts`. Authenticated users get projects persisted to the database.

### Database (`prisma/schema.prisma`)

SQLite via Prisma. Two tables:
- `User` — email + bcrypt password
- `Project` — belongs to optional User; `messages` and `data` columns store JSON strings

### System Prompt (`src/lib/prompts/generation.tsx`)

Instructs Claude to always produce `/App.jsx` as the entry point, use Tailwind CSS for styling, and use `@/` alias for cross-file imports within the virtual file system.

### AI Model (`src/lib/provider.ts`)

Uses `claude-haiku-4-5` via `@ai-sdk/anthropic`. Prompt caching is enabled on the system message (ephemeral cache). Switch model here to test with different Claude versions.

## Style

Use comments sparingly. Only comment complex code.
