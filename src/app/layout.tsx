import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";

export const metadata: Metadata = {
  title: "Jaja-Rent | Fleet Operations Platform",
  description: "Internal Enterprise Fleet Operations & Rent-to-Rent Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-neutral-50/70 text-neutral-900 antialiased font-sans">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
