export default function RoomLoading() {
  return (
    <main className="h-screen flex flex-col items-center justify-center bg-dark-bg">
      <div className="w-10 h-10 rounded-full border-2 border-dark-accent border-t-transparent animate-spin" aria-hidden />
      <p className="mt-4 text-dark-muted text-sm">Xona yuklanmoqda…</p>
    </main>
  );
}
