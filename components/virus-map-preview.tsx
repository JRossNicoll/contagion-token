"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TypewriterTitle } from "./typewriter-title"
import Link from "next/link"
import dynamic from "next/dynamic"

const VirusMap = dynamic(() => import("./virus-map").then((mod) => mod.VirusMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-black border border-red-500/20 rounded-lg">
      <div className="text-red-500 font-mono">Loading map...</div>
    </div>
  ),
})

export function VirusMapPreview() {
  return (
    <section className="py-8 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(239,68,68,0.12),transparent_70%)] animate-pulse" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-6">
          <TypewriterTitle
            text="Track The Outbreak"
            className="mb-2 text-red-500 text-xl md:text-2xl font-bold tracking-tight"
          />
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Real-time visualization of token spread across the network
          </p>
        </div>

        <Card className="bg-black/80 backdrop-blur-sm border-red-900/30 p-4 overflow-hidden group hover:border-red-500/40 transition-all duration-300">
          <div className="relative">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
              <Badge className="bg-black/90 text-red-400 border-red-500/30 font-mono text-xs">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                NETWORK STATUS: SPREADING
              </Badge>
            </div>

            <div className="absolute top-4 right-4 z-10">
              <Link href="/map">
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs shadow-lg shadow-red-500/20"
                >
                  VIEW FULL MAP
                </Button>
              </Link>
            </div>

            <div className="w-full h-[500px] rounded-lg overflow-hidden border border-red-900/20">
              <VirusMap isPaused={false} />
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
