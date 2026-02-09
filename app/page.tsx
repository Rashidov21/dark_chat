"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PlusCircle, LogIn, ExternalLink } from "lucide-react";
import { generateRoomId, isValidRoomId } from "@/lib/room";

export default function HomePage() {
  const router = useRouter();
  const [joinId, setJoinId] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleCreateRoom = () => {
    setIsCreatingRoom(true);
    const id = generateRoomId();
    router.push(`/room/${id}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");
    const trimmed = joinId.trim();
    if (!trimmed) {
      setJoinError("Xona ID kiriting.");
      return;
    }
    if (!isValidRoomId(trimmed)) {
      setJoinError("Xona ID 6–20 belgidan iborat boʻlishi kerak (harf va raqam).");
      return;
    }
    router.push(`/room/${trimmed}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-dark-bg">
      <motion.div
        className="w-full max-w-md flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.4 }}
      >
        <motion.header
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.1 }}
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">
            dark_chat
          </h1>
          <p className="mt-2 text-dark-muted text-sm">
            Vaqtinchalik anonim chat · Oʻzbekiston
          </p>
          <p className="mt-1 text-dark-muted/80 text-xs">
            Muallif:{" "}
            <a
              href="https://instagram.com/rashidov_21"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-dark-accent hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg"
            >
              Abdurahmon Rashidov
              <ExternalLink className="w-3 h-3" aria-hidden />
            </a>
          </p>
        </motion.header>

        <div className="w-full flex flex-col gap-4">
          <motion.button
            type="button"
            onClick={handleCreateRoom}
            disabled={isCreatingRoom}
            className="w-full min-h-[44px] py-3.5 px-4 rounded-xl bg-dark-accent text-white font-medium
                       hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-wait
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg
                       flex items-center justify-center gap-2"
            whileHover={reduceMotion ? {} : { scale: 1.02 }}
            whileTap={reduceMotion ? {} : { scale: 0.98 }}
          >
            <PlusCircle className="w-5 h-5 flex-shrink-0" aria-hidden />
            <span>{isCreatingRoom ? "Yuklanmoqda…" : "Xona yaratish"}</span>
          </motion.button>

          <form onSubmit={handleJoinRoom} className="flex flex-col gap-2">
            <input
              type="text"
              value={joinId}
              onChange={(e) => {
                setJoinId(e.target.value);
                setJoinError("");
              }}
              placeholder="Xona ID"
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-dark-surface border border-dark-border
                         text-white placeholder-dark-muted focus:outline-none focus-visible:ring-2
                         focus-visible:ring-dark-accent/50 focus-visible:border-dark-accent"
              aria-invalid={!!joinError}
              aria-describedby={joinError ? "join-error" : undefined}
            />
            {joinError && (
              <p id="join-error" className="text-xs text-amber-400/90 px-1">
                {joinError}
              </p>
            )}
          <motion.button
            type="submit"
            className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-dark-surface border border-dark-border
                         text-white font-medium hover:bg-dark-border/50 active:scale-[0.98]
                         transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-accent/50
                         focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg disabled:opacity-50
                         flex items-center justify-center gap-2"
              disabled={!joinId.trim()}
              whileHover={reduceMotion ? {} : { scale: 1.01 }}
              whileTap={reduceMotion ? {} : { scale: 0.98 }}
            >
              <LogIn className="w-5 h-5 flex-shrink-0" aria-hidden />
              <span>Xonaga qoʻshilish</span>
            </motion.button>
          </form>
        </div>

        <motion.p
          className="text-dark-muted text-xs text-center max-w-[320px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.3 }}
        >
          Roʻyxatdan oʻtish yoʻq. Xabarlar shifrlanadi va faqat bu sessiyada saqlanadi. Chiqib ketsangiz ular yoʻqoladi.
        </motion.p>
      </motion.div>
    </main>
  );
}
