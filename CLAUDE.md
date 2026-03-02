# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MenteViva is a Next.js 16 application that provides an accessible AI chatbot assistant for elderly users. The frontend communicates with a separate FastAPI backend for AI chat functionality and voice processing.

**Key Technologies:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Supabase (Authentication & Database)
- TailwindCSS 4
- FastAPI backend (separate service)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (default: http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Variables

Required variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend APIs
BACKEND_URL=http://localhost:8000  # FastAPI chat endpoint
VOICE_API_URL=https://menteviva-bwc9ejdthjhsfecn.swedencentral-01.azurewebsites.net/voice
```

## Architecture

### Frontend-Backend Communication

The Next.js app acts as a proxy to external services:

1. **Chat Flow**: Client → `/api/chat` → FastAPI backend (`BACKEND_URL/chat`)
2. **Voice Flow**: Client → `/api/voice` → Voice API (`VOICE_API_URL`)
3. **Alert Flow**: Client → `/api/alert` → FastAPI backend (`BACKEND_URL/alert`)

All API routes in `app/api/` are proxies that forward requests with error handling and timeouts.

### Authentication & Data Flow

- **Client Auth**: `lib/supabase/client.ts` - Browser-side Supabase client
- **Server Auth**: `lib/supabase/server.ts` - Server-side Supabase client (currently minimal usage)
- **Auth Context**: `lib/auth-context.tsx` - React Context providing `user`, `session`, `loading`, `error`
- **Protected Routes**: Client-side protection via `useAuth()` hook in page components (middleware.ts currently bypassed)

### User Profile System

- **Database**: `user_profile` table in Supabase with fields: `id`, `name`, `number`, `description`, `interests`, `city`
- **Profile Functions**: `lib/profile.ts` exports `getUserProfile()` and `hasProfile()`
- **Flow**: New users are redirected to `/auth/profile` if no profile exists
- **Usage**: Profile data is sent to chat API to personalize responses

### Path Aliases

TypeScript paths configured in `tsconfig.json`:
- `@/*` maps to root directory (e.g., `@/lib/supabase/client`)

## Key Pages & Routes

```
/                           # Landing page (public)
/auth/login                 # Login page
/auth/register              # Registration page
/auth/callback              # OAuth callback handler
/auth/profile               # Profile creation/editing (protected)
/chatbot                    # Main chat interface (protected)
```

## API Routes

### POST /api/chat
Forwards chat messages to FastAPI backend.

**Request:**
```json
{
  "message": "string",
  "history": [{"role": "user|assistant", "content": "string"}],
  "user_profile": {
    "name": "string",
    "number": "string|null",
    "description": "string|null",
    "interests": "string|null",
    "city": "string|null"
  }
}
```

**Response:** `{ "response": "string" }`

### POST /api/voice
Processes voice recordings via external voice API.

**Request:** FormData with `audio` blob (webm format)

**Response:**
```json
{
  "text": "string",           // Transcribed text
  "response": "string",       // Chatbot response
  "audio": "base64",          // Audio response
  "audioType": "audio/mpeg"
}
```

### POST /api/alert
Sends emergency alert to backend.

**Request:** `{ "user": "email", "timestamp": "ISO string" }` (optional body)

**Response:** Backend-defined JSON

## Chatbot Features

The main chatbot (`app/chatbot/page.tsx`) supports:
- **Text chat** with message history
- **Voice input** via MediaRecorder API (WebM format)
- **Audio responses** (base64-encoded audio playback)
- **Emergency alerts** with status feedback
- **Suggestion chips** for quick queries
- **Profile integration** for personalized responses

## Important Implementation Notes

### Backend Connectivity
- All backend calls include 15-60 second timeouts with AbortController
- Error messages distinguish between timeout, connection refused, and not found errors
- Backend URL must be configured in environment variables (no hardcoded fallbacks for chat/alert)

### Voice Processing
- Voice API URL defaults to Azure deployment if not set in env
- Audio is recorded as WebM and sent via FormData
- Backend returns both transcription and audio response in single call

### Auth Flow
- Client-side auth verification in protected pages (not middleware)
- Auth state managed via React Context (`AuthProvider` in root layout)
- New users without profile are redirected to profile creation

### Accessibility
- Large font sizes (18px base)
- High contrast color scheme defined in CSS variables
- Keyboard navigation support (Enter to send, Shift+Enter for newline)
- ARIA labels on interactive elements
- Skip to main content functionality

## Styling System

TailwindCSS with custom CSS variables in `app/globals.css`:
- `--color-primary`, `--color-primary-light`, `--color-primary-muted`
- `--color-bg-main`, `--color-bg-secondary`, `--color-bg-card`
- `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- `--shadow-sm`, `--shadow-md`

Custom classes: `.message-user`, `.message-bot`, `.chat-input-wrapper`, `.chat-send-button`

## Testing the Application

1. Start the FastAPI backend separately (must be running on `BACKEND_URL`)
2. Ensure Supabase project is configured with email auth enabled
3. Create a user account and complete profile setup
4. Test chat with text messages first
5. Test voice input (requires microphone permissions)
6. Test emergency alert functionality
