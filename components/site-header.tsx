"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown } from "lucide-react"

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
    <header className="sticky top-0 z-50 w-full border-b border-red-500/20 bg-black/90 backdrop-blur-lg shadow-lg shadow-red-950/10">
      <div className="container mx-auto flex h-10 items-center justify-end px-4">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 rounded border border-red-950/30 bg-red-950/10 px-2.5 py-1 text-xs font-mono tracking-tight text-red-400 transition-all hover:border-red-500/40 hover:bg-red-950/20 hover:text-red-300 hover:shadow-[0_0_8px_rgba(239,68,68,0.15)]"
          >
            <Image
              src={selectedLang.flag || "/placeholder.svg"}
              alt={selectedLang.name}
              width={16}
              height={16}
              className="h-4 w-4 rounded-sm"
            />
            <span className="font-medium">{selectedLang.name}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
          </button>

          {isLangOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-red-500/20 bg-black/95 backdrop-blur-lg shadow-xl shadow-red-950/20">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLang(lang)
                      setIsLangOpen(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-mono font-medium tracking-tight text-gray-300 transition-all hover:bg-red-950/30 hover:text-red-400 first:rounded-t-md last:rounded-b-md"
                  >
                    <Image
                      src={lang.flag || "/placeholder.svg"}
                      alt={lang.name}
                      width={16}
                      height={16}
                      className="h-4 w-4 rounded-sm"
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
