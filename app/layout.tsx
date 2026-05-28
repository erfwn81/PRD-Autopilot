import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRD Autopilot — Turn ideas into PRDs in 5 minutes",
  description:
    "AI-powered conversational interview that turns a vague feature idea into a complete, professional Product Requirements Document.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900">
        {children}
        {/* Novus.ai analytics — required for hackathon prize eligibility */}
        <Script
          src="https://cdn.novus.ai/tracker.js"
          data-project-id={process.env.NEXT_PUBLIC_NOVUS_PROJECT_ID}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
