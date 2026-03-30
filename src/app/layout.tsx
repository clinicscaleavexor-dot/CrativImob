import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CriativImob — Criativos Imobiliários com IA",
  description:
    "Transforme fotos e informações do seu imóvel em criativos profissionais prontos para anúncio em segundos. Sem designer, sem complicação.",
  keywords: ["criativos imobiliários", "IA imóveis", "anúncios imobiliários", "corretor de imóveis"],
  openGraph: {
    title: "CriativImob — Criativos Imobiliários com IA",
    description: "Crie criativos profissionais para seus imóveis em segundos com IA.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
