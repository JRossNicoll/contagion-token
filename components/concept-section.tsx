"use client"

import { TypewriterTitle } from "./typewriter-title"

function VirusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.2" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <path
        d="M12 2v3M12 19v3M22 12h-3M5 12H2M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12M19.07 19.07l-2.12-2.12M7.05 7.05L4.93 4.93"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function NetworkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
      <circle cx="9" cy="19" r="1.5" fill="currentColor" />
      <circle cx="15" cy="19" r="1.5" fill="currentColor" />
      <path
        d="M12 6.5v3M10.5 9.5L7.5 11M13.5 9.5l3 1.5M7.5 13l1.5 4M16.5 13l-1.5 4M11 19h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
      <path d="M12 2s-4 4-4 8c0 2.21 1.79 4 4 4s4-1.79 4-4c0-4-4-8-4-8z" fill="currentColor" opacity="0.2" />
      <path d="M12 14s-3 2-3 4.5C9 20.43 10.57 22 12.5 22s3.5-1.57 3.5-3.5c0-2.5-4-4.5-4-4.5z" fill="currentColor" />
      <path
        d="M12 2s3 3 3 6c0 1.66-1.34 3-3 3s-3-1.34-3-3c0-3 3-6 3-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ConceptSection() {
  return (
    <section className="py-8 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(239,68,68,0.12),transparent_70%)] animate-pulse" />
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(239, 68, 68, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(239, 68, 68, 0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-6">
          <TypewriterTitle
            text="How The Virus Spreads"
            className="mb-1.5 text-red-500 text-xl md:text-2xl font-bold tracking-tight"
          />
          <p className="text-gray-400 text-xs max-w-2xl mx-auto font-light">
            A revolutionary reflection mechanism that targets wallets you interact with
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-red-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <div className="relative h-full bg-black/60 backdrop-blur-sm border border-red-900/20 rounded-lg p-4 hover:border-red-500/40 transition-all duration-300">
              <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg bg-red-500/10 border border-red-500/20 mb-3 text-red-400">
                <VirusIcon />
              </div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight text-center font-mono">
                Automatic Infection
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed font-light text-center">
                Every transaction you make spreads the token to wallets you interact with. The virus propagates through
                the network autonomously.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-red-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <div className="relative h-full bg-black/60 backdrop-blur-sm border border-red-900/20 rounded-lg p-4 hover:border-red-500/40 transition-all duration-300">
              <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg bg-red-500/10 border border-red-500/20 mb-3 text-red-400">
                <NetworkIcon />
              </div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight text-center font-mono">
                Network Mapping
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed font-light text-center">
                Watch the contagion spread in real-time. Larger nodes represent super-spreaders who infected more
                wallets.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-red-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <div className="relative h-full bg-black/60 backdrop-blur-sm border border-red-900/20 rounded-lg p-4 hover:border-red-500/40 transition-all duration-300">
              <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg bg-red-500/10 border border-red-500/20 mb-3 text-red-400">
                <FlameIcon />
              </div>
              <h3 className="text-base font-bold text-white mb-2 tracking-tight text-center font-mono">
                Burn to Contain
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed font-light text-center">
                Stop the spread by burning your tokens. Those who help contain the outbreak will be rewarded in
                mysterious ways...
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
