import { GlobalPresenceSection } from "@/components/global-presence-section";

/**
 * This Next.js page replaces / wraps the static index.html once the project
 * is migrated to Next.js.  The GlobalPresenceSection is rendered immediately
 * after the hero (scroll position ~100vh).
 *
 * Migration path:
 *  1. Convert existing GSAP hero to a React component in /components/hero-section.tsx
 *  2. Import and render it here above <GlobalPresenceSection />
 *  3. Continue converting each section (dissection, fire, finishes, etc.)
 */
export default function Home() {
  return (
    <main>
      {/*
        ── HERO (existing vanilla section) ──────────────────────────────
        Temporarily keep index.html as the entry point while migrating.
        Once the hero is ported to React, replace this comment with:
          <HeroSection />
      */}

      {/* ── GLOBAL PRESENCE — rendered directly below hero ── */}
      <GlobalPresenceSection />

      {/*
        Remaining sections to port:
          <DissectionSection />
          <FireRatingSection />
          <FinishesSection />
          <ApplicationsSection />
          <GallerySection />
          <FooterSection />
      */}
    </main>
  );
}
