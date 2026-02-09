"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-dark-bg">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Nimadir xato ketti
        </h2>
        <p className="text-dark-muted text-sm">
          Kutilmagan xatolik yuz berdi. Sahifani yangilab ko‘ring yoki keyinroq qaytaring.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-dark-accent text-white font-medium hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg"
        >
          Qayta urinish
        </button>
      </div>
    </main>
  );
}
