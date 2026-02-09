import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://dark-chat-nine.vercel.app";

export const metadata: Metadata = {
  title: "dark_chat — Vaqtinchalik anonim chat",
  description:
    "Maxfiylikni qoʻriqlovchi vaqtinchalik chat. Chiqib ketsangiz xabarlar yoʻqoladi.",
  authors: [{ name: "Abdurahmon Rashidov", url: "https://instagram.com/rashidov_21" }],
  openGraph: {
    title: "dark_chat — Vaqtinchalik anonim chat",
    description: "Maxfiylikni qoʻriqlovchi vaqtinchalik chat. Oʻzbekiston.",
    url: siteUrl,
    siteName: "dark_chat",
    locale: "uz_Latn",
  },
  twitter: {
    card: "summary_large_image",
    title: "dark_chat — Vaqtinchalik anonim chat",
    description: "Maxfiylikni qoʻriqlovchi vaqtinchalik chat. Oʻzbekiston.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz-Latn" suppressHydrationWarning>
      <body className="min-h-screen bg-dark-bg font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
