import type { Metadata } from "next";
import Script from "next/script";
import PendoInit from "@/components/PendoInit";
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(apiKey){(function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];v=['initialize','identify','updateOptions','pageLoad','track','trackAgent'];for(w=0,x=v.length;w<x;++w)(function(m){o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');})('382759e1-6484-46ef-8c07-87d1041244b6');`,
          }}
        />
      </head>
      <body className="antialiased bg-background text-gray-200">
        <PendoInit />
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
