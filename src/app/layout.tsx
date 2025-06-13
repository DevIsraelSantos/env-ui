import { NotificationContextProvider } from "@/components/notification";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gerenciador de Arquivos .env",
  description: "Gerencie seus arquivos .env com facilidade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <NotificationContextProvider>{children}</NotificationContextProvider>
      </body>
    </html>
  );
}
