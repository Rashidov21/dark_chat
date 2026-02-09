# Supabase setup for dark_chat

This project uses **Supabase Realtime only**. No database tables or storage are used.

## Steps

1. **Create a project** at [https://app.supabase.com](https://app.supabase.com).

2. **Get API keys**  
   Go to **Project Settings → API** and copy:
   - **Project URL** → use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Enable Realtime**  
   Realtime is usually enabled by default. To confirm: **Project Settings → API** and ensure Realtime is on. No tables need to be created for broadcast channels.

4. **Configure the app**
   - Copy `.env.example` to `.env.local`
   - Set in `.env.local`:
     ```bash
     NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
     ```

5. **Deploy on Vercel**  
   Add the same two variables in **Project → Settings → Environment Variables**.

## What we use

- **Realtime channels** with name pattern `room:{roomId}`
- **Broadcast** event `msg` with payload: `{ ciphertext, iv, senderId, timestamp }`
- No Supabase tables; no message storage

## Security note

The anon key is public (client-side). Row Level Security and tables are not used; only Realtime broadcast is. Restrict abuse via Vercel/Supabase rate limits and, if needed, Supabase auth or custom checks later.
