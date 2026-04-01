import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Erizon Social AI",
  description: "Central operacional premium para o agente social da Erizon."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
