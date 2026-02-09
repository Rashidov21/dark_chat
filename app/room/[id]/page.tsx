"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Copy, Share2, ArrowLeft, Send, MessageCircle } from "lucide-react";
import { createRoomChannel } from "@/lib/supabase";
import { encrypt, decrypt, generateSenderId } from "@/lib/crypto";
import { isValidRoomId } from "@/lib/room";

type Message = {
  id: string;
  ciphertext: string;
  iv: string;
  senderId: string;
  timestamp: number;
  plaintext?: string;
  error?: boolean;
};

const SCROLL_THRESHOLD = 150;

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = typeof params.id === "string" ? params.id : "";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [senderId] = useState(() => generateSenderId());
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [copyIdStatus, setCopyIdStatus] = useState<"idle" | "copied" | "error">("idle");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");
  const listRef = useRef<HTMLDivElement>(null);
  const roomSecretRef = useRef<string>(roomId);
  const sendRef = useRef<((payload: { ciphertext: string; iv: string; senderId: string; timestamp: number }) => Promise<void>) | null>(null);
  const reduceMotion = useReducedMotion();

  const isNearBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return true;
    const { scrollHeight, scrollTop, clientHeight } = el;
    return scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
  }, []);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [reduceMotion]);

  useEffect(() => {
    if (!roomId || !isValidRoomId(roomId)) {
      router.replace("/");
      return;
    }
    roomSecretRef.current = roomId;
  }, [roomId, router]);

  useEffect(() => {
    if (!roomId || !isValidRoomId(roomId)) return;

    const { send, unsubscribe } = createRoomChannel(roomId, async (payload) => {
      const id = `${payload.senderId}-${payload.timestamp}`;
      try {
        const plaintext = await decrypt(
          payload.ciphertext,
          payload.iv,
          roomSecretRef.current
        );
        setMessages((prev) => {
          if (prev.some((m) => m.id === id)) return prev;
          return [
            ...prev,
            {
              id,
              ciphertext: payload.ciphertext,
              iv: payload.iv,
              senderId: payload.senderId,
              timestamp: payload.timestamp,
              plaintext,
            },
          ];
        });
        setDecryptError(null);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id,
            ciphertext: payload.ciphertext,
            iv: payload.iv,
            senderId: payload.senderId,
            timestamp: payload.timestamp,
            error: true,
          },
        ]);
        setDecryptError("Baʼzi xabarlar shifrdan ochilmadi (notoʻgʻri xona).");
      }
    });

    sendRef.current = send;
    return () => {
      sendRef.current = null;
      unsubscribe();
    };
  }, [roomId]);

  useEffect(() => {
    if (messages.length && isNearBottom()) {
      scrollToBottom();
    }
  }, [messages, isNearBottom, scrollToBottom]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !roomId) return;

    setInput("");
    const send = sendRef.current;
    if (!send) return;
    try {
      const { ciphertext, iv } = await encrypt(text, roomSecretRef.current);
      await send({
        ciphertext,
        iv,
        senderId,
        timestamp: Date.now(),
      });
    } catch (err) {
      setDecryptError("Yuborish muvaffaqiyatsiz. Internetingizni tekshiring.");
    }
  };

  const roomLink = typeof window !== "undefined" ? `${window.location.origin}/room/${roomId}` : "";

  const handleCopyId = useCallback(() => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomLink || roomId).then(
      () => {
        setCopyIdStatus("copied");
        setTimeout(() => setCopyIdStatus("idle"), 2000);
      },
      () => setCopyIdStatus("error")
    );
  }, [roomId, roomLink]);

  const handleShare = useCallback(async () => {
    if (!roomLink) return;
    const shareData = { title: "dark_chat xonasi", text: `Xonaga qoʻshiling: ${roomId}`, url: roomLink };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 1500);
      } catch (err) {
        navigator.clipboard.writeText(roomLink).then(
          () => {
            setShareStatus("copied");
            setTimeout(() => setShareStatus("idle"), 2000);
          },
          () => setShareStatus("error")
        );
      }
    } else {
      navigator.clipboard.writeText(roomLink).then(
        () => {
          setShareStatus("copied");
          setTimeout(() => setShareStatus("idle"), 2000);
        },
        () => setShareStatus("error")
      );
    }
  }, [roomId, roomLink]);

  if (!roomId || !isValidRoomId(roomId)) {
    return null;
  }

  return (
    <main className="h-screen flex flex-col bg-dark-bg">
      <header className="flex-none flex items-center justify-between px-2 py-3 border-b border-dark-border bg-dark-surface/80 gap-2">
        <motion.button
          type="button"
          onClick={() => router.push("/")}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-dark-muted hover:text-white transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-surface"
          whileTap={reduceMotion ? {} : { scale: 0.95 }}
          title="Orqaga"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden />
          <span className="sr-only">Orqaga</span>
        </motion.button>
        <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
          <span className="text-sm font-medium text-white truncate">Xona {roomId}</span>
          <button
            type="button"
            onClick={handleCopyId}
            className="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-dark-muted hover:text-white hover:bg-dark-border/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-surface"
            title="ID ni nusxalash"
          >
            {copyIdStatus === "copied" ? (
              <span className="text-green-400 text-xs">✓</span>
            ) : (
              <Copy className="w-4 h-4" aria-hidden />
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="min-h-[44px] px-3 flex items-center justify-center gap-1.5 rounded-lg text-dark-muted hover:text-white hover:bg-dark-border/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-surface text-xs font-medium"
          title="Ulashish"
        >
          <Share2 className="w-4 h-4 flex-shrink-0" aria-hidden />
          {shareStatus === "copied" ? (
            <span className="text-green-400">Yuborildi</span>
          ) : (
            "Ulashish"
          )}
        </button>
      </header>

      <div className="flex-none px-3 py-2 bg-dark-surface/50 border-b border-dark-border">
        <p className="text-xs text-dark-muted text-center">
          Chiqib ketsangiz xabarlar yoʻqoladi. Tarix saqlanmaydi.
        </p>
        {decryptError && (
          <p className="text-xs text-amber-400/90 text-center mt-1">
            {decryptError}
          </p>
        )}
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-4">
            <MessageCircle className="w-12 h-12 text-dark-border" aria-hidden />
            <p className="text-dark-muted text-sm max-w-[260px]">
              Xabarlar shu yerda koʻrinadi. Doʻstlaringizni xonaga taklif qiling — ular havolani ochgach, suhbat boshlanadi.
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : {}}
              className={`flex ${msg.senderId === senderId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.senderId === senderId
                    ? "bg-dark-accent text-white rounded-br-md"
                    : "bg-dark-surface border border-dark-border text-white rounded-bl-md"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-xs opacity-70">
                    {msg.senderId === senderId ? "Siz" : msg.senderId.slice(0, 8)}…
                  </p>
                  <span className="text-[10px] opacity-60">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                {msg.error ? (
                  <p className="text-sm italic text-dark-muted">
                    [Shifrdan ochib boʻlmadi]
                  </p>
                ) : (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.plaintext}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form
        onSubmit={handleSend}
        className="flex-none p-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-dark-border bg-dark-surface"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Xabar yozing…"
            className="flex-1 min-h-[44px] py-3 px-4 rounded-xl bg-dark-bg border border-dark-border
                       text-white placeholder-dark-muted focus:outline-none focus-visible:ring-2
                       focus-visible:ring-dark-accent/50 focus-visible:border-dark-accent"
          />
          <motion.button
            type="submit"
            disabled={!input.trim()}
            title={!input.trim() ? "Avval matn kiriting" : "Yuborish"}
            className="min-h-[44px] px-4 py-3 rounded-xl bg-dark-accent text-white font-medium flex items-center justify-center gap-2
                       hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-accent focus-visible:ring-offset-2
                       focus-visible:ring-offset-dark-surface"
            whileTap={reduceMotion ? {} : { scale: 0.97 }}
          >
            <Send className="w-4 h-4" aria-hidden />
            <span>Yuborish</span>
          </motion.button>
        </div>
      </form>
    </main>
  );
}
