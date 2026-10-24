import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pelantikan Petugas SPM Selangor",
  description: "Sistem Pelantikan Petugas SPM Negeri Selangor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body className="antialiased">{children}</body>
    </html>
  );
}
