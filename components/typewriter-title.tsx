"use client"

import { useEffect, useState } from "react"

interface TypewriterTitleProps {
  text: string
  subtitle?: string
  className?: string
}

export function TypewriterTitle({ text, subtitle, className = "" }: TypewriterTitleProps) {
  const [displayText, setDisplayText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayText("")
    setIsComplete(false)
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex))
        currentIndex++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [text])

  return (
    <div className={`relative ${className}`}>
      <div className="relative inline-block">
        {/* Subtle left accent */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-gradient-to-b from-red-500/60 via-red-500 to-red-500/60 rounded-full" />

        <div className="pl-4">
          <h2 className="text-xl md:text-3xl font-bold text-white font-mono tracking-tight uppercase">
            <span className="text-shadow-[0_0_10px_rgba(239,68,68,0.2)]">{displayText}</span>
            {!isComplete && <span className="animate-pulse ml-1 text-red-500">▐</span>}
          </h2>

          {subtitle && (
            <div className="flex items-center gap-2 mt-1">
              <div className="h-px w-8 bg-gradient-to-r from-red-500/50 to-transparent" />
              <p className="text-xs md:text-sm text-gray-400 font-mono tracking-wide uppercase">{subtitle}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
