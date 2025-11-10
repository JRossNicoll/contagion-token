"use client"

import { useEffect, useState } from "react"

interface TokenStats {
  totalHolders: number
  transmissionRate: number
  activeProxies: number
}

export function useTokenStats() {
  const [stats, setStats] = useState<TokenStats>({
    totalHolders: 0,
    transmissionRate: 0,
    activeProxies: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats")
        const data = await response.json()
        setStats({
          totalHolders: data.totalHolders || 0,
          transmissionRate: data.transmissionRate || 0,
          activeProxies: data.patientZeros || 0,
        })
        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Failed to fetch stats:", error)
        setIsLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return { stats, isLoading }
}
