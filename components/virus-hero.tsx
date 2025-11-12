"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { AnimatedCounter } from "@/components/animated-counter"
import { useEffect, useState } from "react"
import { useTokenStats } from "@/hooks/use-token-stats"

export function VirusHero() {
  const [mounted, setMounted] = useState(false)
  const { stats, isLoading } = useTokenStats()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-40" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[150px] animate-pulse" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/15 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-400/20 rounded-full blur-[100px] animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center">
        {/* Social Links */}
        <div className="flex items-center justify-center gap-3 mb-8 pt-16">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 bg-gradient-to-br from-red-950/30 to-red-900/20 backdrop-blur-md transition-all duration-300 hover:border-red-500/50 hover:bg-gradient-to-br hover:from-red-950/50 hover:to-red-900/30 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:scale-110"
            aria-label="X (Twitter)"
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-red-500/5 transition-all duration-300" />
            <svg
              className="relative h-4 w-4 text-red-400 transition-all duration-300 group-hover:text-red-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 bg-gradient-to-br from-red-950/30 to-red-900/20 backdrop-blur-md transition-all duration-300 hover:border-red-500/50 hover:bg-gradient-to-br hover:from-red-950/50 hover:to-red-900/30 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:scale-110"
            aria-label="Telegram"
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-red-500/5 transition-all duration-300" />
            <svg
              className="relative h-4 w-4 text-red-400 transition-all duration-300 group-hover:text-red-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
          </a>
          <a
            href="https://bscscan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 bg-gradient-to-br from-red-950/30 to-red-900/20 backdrop-blur-md transition-all duration-300 hover:border-red-500/50 hover:bg-gradient-to-br hover:from-red-950/50 hover:to-red-900/30 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:scale-110"
            aria-label="Binance Smart Chain"
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-red-500/5 transition-all duration-300" />
            <svg
              className="relative h-5 w-5 text-red-400 transition-all duration-300 group-hover:text-red-300"
              fill="currentColor"
              viewBox="0 0 126.61 126.61"
            >
              <g>
                <polygon points="38.73,53.2 38.73,73.41 58.95,73.41 58.95,93.62 79.16,93.62 79.16,73.41 99.38,73.41 99.38,53.2 79.16,53.2 79.16,33 58.95,33 58.95,53.2" />
                <polygon points="24.49,67.45 24.49,87.66 44.71,87.66 44.71,67.45" />
                <polygon points="81.9,67.45 81.9,87.66 102.12,87.66 102.12,67.45" />
                <polygon points="38.73,101.85 38.73,122.07 58.95,122.07 58.95,101.85" />
                <polygon points="67.67,101.85 67.67,122.07 87.88,122.07 87.88,101.85" />
                <polygon points="38.73,4.54 38.73,24.76 58.95,24.76 58.95,4.54" />
                <polygon points="67.67,4.54 67.67,24.76 87.88,24.76 87.88,4.54" />
              </g>
            </svg>
          </a>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 text-balance tracking-tight">
          <span className="bg-gradient-to-b from-white via-white to-red-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]">
            THE CONTAGION
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-3 max-w-2xl mx-auto text-balance font-light">
          A token that spreads itself. Unstoppable. Untraceable. Inevitable.
        </p>

        <p className="text-xs sm:text-sm text-gray-500 mb-8 max-w-xl mx-auto font-mono px-4 leading-relaxed">
          Every transaction infects new wallets. Every holder becomes a carrier. Watch the virus spread across the
          blockchain in real-time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4 mb-12">
          <Link href="/map" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="group relative w-full sm:w-[180px] h-10 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:via-red-600 hover:to-red-500 text-white font-medium text-xs border border-red-400/20 shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all duration-300 tracking-wide overflow-hidden rounded-md backdrop-blur-sm"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <svg
                  className="w-3 h-3 transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                VIEW OUTBREAK MAP
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-500 skew-x-12" />
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="group relative w-full sm:w-[180px] h-10 border border-red-500/25 text-red-300 hover:text-red-200 hover:bg-red-950/30 hover:border-red-400/50 font-medium text-xs bg-black/50 backdrop-blur-xl transition-all duration-300 tracking-wide hover:shadow-[0_0_20px_rgba(220,38,38,0.25)] overflow-hidden rounded-md"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <svg
                  className="w-3 h-3 transition-transform duration-300 group-hover:rotate-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                YOUR DASHBOARD
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-500 skew-x-12" />
            </Button>
          </Link>
          <div className="w-full sm:w-auto">
            <WalletConnectButton className="group relative w-full sm:w-[180px] h-10 border border-red-500/25 text-red-300 hover:text-red-200 hover:bg-red-950/30 hover:border-red-400/50 font-medium text-xs bg-black/50 backdrop-blur-xl transition-all duration-300 tracking-wide hover:shadow-[0_0_20px_rgba(220,38,38,0.25)] rounded-md" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-2xl mx-auto px-4">
          <div className="group relative rounded-xl border border-red-500/20 bg-gradient-to-br from-red-950/20 to-red-900/10 backdrop-blur-md p-4 transition-all duration-300 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-600/20 hover:scale-105">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-red-500/5 transition-all duration-300" />
            <div className="relative">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400 font-mono mb-2">
                {mounted && !isLoading ? <AnimatedCounter end={stats?.totalHolders || 0} duration={2500} /> : "0"}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-medium">
                Infected Wallets
              </div>
            </div>
          </div>
          <div className="group relative rounded-xl border border-red-500/20 bg-gradient-to-br from-red-950/20 to-red-900/10 backdrop-blur-md p-4 transition-all duration-300 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-600/20 hover:scale-105">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-red-500/5 transition-all duration-300" />
            <div className="relative">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400 font-mono mb-2">
                {mounted && !isLoading ? (
                  <AnimatedCounter
                    end={stats?.totalHolders ? Math.min(Math.round((stats.totalHolders / 100) * 89), 99) : 89}
                    suffix="%"
                    duration={2500}
                  />
                ) : (
                  "0%"
                )}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-medium">
                Transmission Rate
              </div>
            </div>
          </div>
          <div className="group relative rounded-xl border border-red-500/20 bg-gradient-to-br from-red-950/20 to-red-900/10 backdrop-blur-md p-4 transition-all duration-300 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-600/20 hover:scale-105">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-red-500/5 transition-all duration-300" />
            <div className="relative">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400 font-mono mb-2">
                {mounted && !isLoading ? <AnimatedCounter end={stats?.activeProxies || 0} duration={2500} /> : "0"}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-medium">
                Patient Zeros
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
