"use client"

import { useState } from "react"
import { Activity } from "lucide-react"

const languages = [
  { code: "gb", name: "English", flag: "/flags/gb.svg" },
  { code: "es", name: "Español", flag: "/flags/es.svg" },
  { code: "fr", name: "Français", flag: "/flags/fr.svg" },
  { code: "cn", name: "中文", flag: "/flags/cn.svg" },
  { code: "ru", name: "Русский", flag: "/flags/ru.svg" },
  { code: "tr", name: "Türkçe", flag: "/flags/tr.svg" },
  { code: "uk", name: "Українська", flag: "/flags/uk.svg" },
]

export function SiteHeader() {
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState(languages[0])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-transparent bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(139,0,139,0.3)]">
      <div className="container mx-auto flex h-12 items-center justify-between px-6">
        {/* Logo/Branding */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-pink-600/20 to-purple-900/20 border border-pink-500/30 shadow-lg shadow-pink-500/20">
            <Activity className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight leading-none">
              REPLICATOR
            </h1>
            <p className="text-[9px] text-pink-400/60 font-mono uppercase tracking-wider">Viral Protocol</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-medium text-gray-400">{/* Additional header content */}</div>
        </div>
      </div>
    </header>
  )
}
