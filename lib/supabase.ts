import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

/**
 * Supabase client for Realtime only (lazy-init for build without env).
 * We do NOT use Supabase for database storage — only Realtime channels.
 */
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export const CHANNEL_EVENT = "msg" as const;

export type BroadcastPayload = {
  ciphertext: string;
  iv: string;
  senderId: string;
  timestamp: number;
};

/**
 * One channel per room: subscribe and send on the same channel (required by Supabase).
 * Returns unsubscribe and send helpers. onError called on subscription/channel failure.
 */
export function createRoomChannel(
  roomId: string,
  onMessage: (payload: BroadcastPayload) => void,
  onError?: () => void
): { send: (payload: BroadcastPayload) => Promise<void>; unsubscribe: () => void } {
  const channel = getSupabase().channel(`room:${roomId}`, {
    config: {
      broadcast: { self: true },
    },
  });

  channel.on("broadcast", { event: CHANNEL_EVENT }, ({ payload }) => {
    if (payload && typeof payload === "object" && "ciphertext" in payload) {
      onMessage(payload as BroadcastPayload);
    }
  });

  channel.subscribe((status) => {
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      onError?.();
    }
  });

  return {
    async send(payload: BroadcastPayload) {
      await channel.send({
        type: "broadcast",
        event: CHANNEL_EVENT,
        payload,
      });
    },
    unsubscribe() {
      channel.unsubscribe();
    },
  };
}
