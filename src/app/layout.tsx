import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "이경진 업무포털",
  description: "이경진 개인 업무 관리 포털 - Dia Browser Style",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
