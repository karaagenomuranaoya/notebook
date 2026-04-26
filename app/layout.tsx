import type { Metadata } from "next";
import { Zen_Kurenaido } from "next/font/google";
import "./globals.css";

const zenKurenaido = Zen_Kurenaido({
  weight: "400",
  subsets: ["latin", "japanese"],
  variable: "--font-zen-kurenaido",
});

export const metadata: Metadata = {
  title: "Yamikoi Notebook",
  description: "Digital handwritten diary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${zenKurenaido.variable} antialiased bg-[#2a2530]`}>
        {children}
      </body>
    </html>
  );
}