import { VirusHero } from "@/components/virus-hero"
import { ConceptSection } from "@/components/concept-section"
import { GamificationSection } from "@/components/gamification-section"
import { VirusMapPreview } from "@/components/virus-map-preview"
import { SiteFooter } from "@/components/site-footer" // Import global SiteFooter

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <VirusHero />
      <div className="relative py-12">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
      </div>
      <ConceptSection />
      <div className="relative py-12">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
      </div>
      <VirusMapPreview />
      <div className="relative py-12">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
      </div>
      <GamificationSection />
      {/* Footer */}
      <SiteFooter /> {/* Using global SiteFooter instead of local footer */}
    </main>
  )
}
