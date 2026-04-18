import "./globals.css";
import { MainNavWrapper } from "@/components/layout";
import { Footer } from "@/components/layout";
import QuickViewProvider from "@/context/quick-view-modal";
import QuickViewModal from "@/components/quick-view/QuickViewModal";
import React, { Suspense } from "react";

// This app uses server-side cookies (via Supabase server client). Mark the
// root layout as dynamic so pages that rely on `cookies()` can be rendered.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "CineLog | Movie Discovery Platform",
  description: "Track movies you've watched. Save those you want to see. Tell your friends what's good.",
};

/**
 * * The RootLayout component is the top-level layout for the application.
 *  * It wraps the entire page content in a Suspense boundary to ensure consistent markup
 *  * between server and client rendering. It also includes a Quick View Modal and a Main Nav Wrapper.
 *  *
 *  * @param {Readonly<{ children: React.ReactNode }>} props - The component's properties.
 *  *   @param {React.ReactNode} props.children - The child elements of the RootLayout component.
 *  * @returns {JSX.Element} The rendered HTML element.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-brand-500 selection:text-white" suppressHydrationWarning>
        <QuickViewProvider>
          <MainNavWrapper transparent />

          {/*
            Wrap page content in an explicit Suspense boundary so the server
            and client render the same DOM shape. The hydration error showed
            the client expecting a <Suspense> boundary where the server had
            rendered the plain `div.flex-1` — providing an explicit boundary
            (with a matching fallback element) ensures consistent markup.
          */}
          <Suspense fallback={<div className="flex-1" />}> 
            <div className="flex-1">{children}</div>
          </Suspense>
          <Footer variant="full" />

          {/* Global Quick View Modal mounted at root so it overlays everything */}
          <QuickViewModal />
        </QuickViewProvider>
      </body>
    </html>
  );
}
