import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "dark_chat — Vaqtinchalik anonim chat",
  description:
    "Maxfiylikni qoʻriqlovchi vaqtinchalik chat. Chiqib ketsangiz xabarlar yoʻqoladi.",
  authors: [{ name: "Abdurahmon Rashidov", url: "https://instagram.com/rashidov_21" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="min-h-screen bg-dark-bg font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
