"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, Activity } from "lucide-react"

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
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="container mx-auto flex h-12 items-center justify-between px-6">
        {/* Logo/Branding */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-500/20">
            <Activity className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">CONTAGION</h1>
            <p className="text-[9px] text-red-400/60 font-mono uppercase tracking-wider">Viral Protocol</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl px-3 py-1.5 text-xs font-medium text-gray-300 transition-all hover:border-red-500/30 hover:bg-white/10 hover:text-white shadow-lg"
          >
            <Image
              src={selectedLang.flag || "/placeholder.svg"}
              alt={selectedLang.name}
              width={16}
              height={16}
              className="h-4 w-4 rounded"
            />
            <span>{selectedLang.name}</span>
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isLangOpen ? "rotate-180" : ""}`} />
          </button>

          {isLangOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-white/10 bg-black/90 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLang(lang)
                      setIsLangOpen(false)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white"
                  >
                    <Image
                      src={lang.flag || "/placeholder.svg"}
                      alt={lang.name}
                      width={16}
                      height={16}
                      className="h-4 w-4 rounded"
                    />
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
