# dark_chat

**Muallif / Author:** [Abdurahmon Rashidov](https://instagram.com/rashidov_21)  

Oʻzbekiston uchun anonim, maxfiylikni qoʻriqlovchi vaqtinchalik chat. Interfeys toʻliq oʻzbek tilida.
Anonymous, privacy-first ephemeral chat for Uzbekistan. UI is fully in Uzbek. No accounts, no message storage — only Realtime channels and client-side encryption.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **TailwindCSS** dark UI + **Framer Motion**
- **Supabase Realtime** for messaging (no database storage)
- **Web Crypto API** (AES-GCM) for E2EE

## Features

- **Anonymous rooms:** Create or join via `/room/{id}`. No login.
- **Ephemeral messages:** Messages are not stored; they only flow through Supabase Realtime. Refresh or leave → history is gone.
- **Client-side encryption:** Messages are encrypted in the browser before send; Supabase only relays ciphertext.

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup (Realtime only)

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API** copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. No tables or storage are required. Realtime is enabled by default for new projects.
4. (Optional) In **Project Settings → API**, ensure **Realtime** is enabled.

### Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

Add these in `.env.local` for local dev and in **Vercel → Project → Settings → Environment Variables** for production.

## Deploy on Vercel

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the project’s Environment Variables.
4. Deploy.

## Project structure

```
app/
  page.tsx          # Home: create room, join room
  room/[id]/page.tsx # Room: ephemeral chat UI
lib/
  supabase.ts       # Realtime channel helpers (no DB)
  crypto.ts         # AES-GCM encrypt/decrypt
  room.ts           # Room ID generation
```

## Important

- **No messages are stored** in Supabase. Only Realtime broadcast is used.
- Room “secret” for E2EE in this MVP is the room ID (share the room URL with others to decrypt).
- For production E2EE you’d exchange keys per room or per peer; this MVP keeps the flow minimal.

## License

MIT
