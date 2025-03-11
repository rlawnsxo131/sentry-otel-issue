import type { Metadata } from "next";

import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "sentry-otel-issue",
  description: "issue demo project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Link href="/">
          <h1>home</h1>
        </Link>
        {children}
      </body>
    </html>
  );
}
