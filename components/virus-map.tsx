"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Node {
  id: string
  x: number
  y: number
  radius: number
  connections: number
  address: string
  infected: number
  vx: number
  vy: number
  selected: boolean
  balance: string
  tier: "super" | "active" | "carrier" | "infected"
  pulsePhase: number
}

interface VirusMapProps {
  tokenAddress?: string
  isPaused?: boolean
  zoom?: number
  onRefresh?: () => void
}

export function VirusMap({ tokenAddress, isPaused = false, zoom = 1, onRefresh }: VirusMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const [loading, setLoading] = useState(true)
  const animationRef = useRef<number>()
  const lastFrameTime = useRef<number>(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const spatialGrid = useRef<Map<string, Node[]>>(new Map())
  const GRID_SIZE = 150

  const getGridKey = (x: number, y: number) => {
    const gridX = Math.floor(x / GRID_SIZE)
    const gridY = Math.floor(y / GRID_SIZE)
    return `${gridX},${gridY}`
  }

  const updateSpatialGrid = useCallback((nodeList: Node[]) => {
    spatialGrid.current.clear()
    nodeList.forEach((node) => {
      const key = getGridKey(node.x, node.y)
      if (!spatialGrid.current.has(key)) {
        spatialGrid.current.set(key, [])
      }
      spatialGrid.current.get(key)!.push(node)
    })
  }, [])

  const getNearbyNodes = useCallback((node: Node) => {
    const nearby: Node[] = []
    const gridX = Math.floor(node.x / GRID_SIZE)
    const gridY = Math.floor(node.y / GRID_SIZE)

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${gridX + dx},${gridY + dy}`
        const gridNodes = spatialGrid.current.get(key)
        if (gridNodes) nearby.push(...gridNodes)
      }
    }
    return nearby
  }, [])

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, width, height)

    // Grid pattern
    ctx.strokeStyle = "rgba(239, 68, 68, 0.03)"
    ctx.lineWidth = 1
    const gridSpacing = 50

    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Scanline effect
    ctx.strokeStyle = "rgba(239, 68, 68, 0.05)"
    ctx.lineWidth = 2
    for (let y = 0; y < height; y += 4) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Corner markers
    const cornerSize = 40
    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)"
    ctx.lineWidth = 2

    // Top-left
    ctx.beginPath()
    ctx.moveTo(20, 20 + cornerSize)
    ctx.lineTo(20, 20)
    ctx.lineTo(20 + cornerSize, 20)
    ctx.stroke()

    // Top-right
    ctx.beginPath()
    ctx.moveTo(width - 20 - cornerSize, 20)
    ctx.lineTo(width - 20, 20)
    ctx.lineTo(width - 20, 20 + cornerSize)
    ctx.stroke()

    // Bottom-left
    ctx.beginPath()
    ctx.moveTo(20, height - 20 - cornerSize)
    ctx.lineTo(20, height - 20)
    ctx.lineTo(20 + cornerSize, height - 20)
    ctx.stroke()

    // Bottom-right
    ctx.beginPath()
    ctx.moveTo(width - 20 - cornerSize, height - 20)
    ctx.lineTo(width - 20, height - 20)
    ctx.lineTo(width - 20, height - 20 - cornerSize)
    ctx.stroke()
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (onRefresh) {
      const refresh = () => setRefreshTrigger((prev) => prev + 1)
      ;(window as any).__virusMapRefresh = refresh
    }
  }, [onRefresh])

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const bgCanvas = bgCanvasRef.current
    if (!canvas || !bgCanvas || !isMounted) return

    const ctx = canvas.getContext("2d", { alpha: false })
    const bgCtx = bgCanvas.getContext("2d", { alpha: false })
    if (!ctx || !bgCtx) return

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()

      if (rect.width === 0 || rect.height === 0) return

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      bgCanvas.width = rect.width * dpr
      bgCanvas.height = rect.height * dpr

      ctx.scale(dpr, dpr)
      bgCtx.scale(dpr, dpr)

      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      bgCanvas.style.width = `${rect.width}px`
      bgCanvas.style.height = `${rect.height}px`

      drawBackground(bgCtx, rect.width, rect.height)
    }

    setTimeout(updateSize, 0)
    window.addEventListener("resize", updateSize)

    const fetchHolders = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/token-holders?address=${tokenAddress}`)
        const data = await response.json()

        if (data && data.holders && Array.isArray(data.holders) && data.holders.length > 0) {
          const rect = canvas.getBoundingClientRect()
          const maxNodes = isMobile ? 50 : 150

          const holderNodes: Node[] = data.holders
            .slice(0, maxNodes)
            .map((holder: any) => {
              try {
                const infected = holder.infectedCount || 0
                const tier = infected > 50 ? "super" : infected > 25 ? "active" : infected > 10 ? "carrier" : "infected"

                let address: string
                if (holder.address && typeof holder.address === "string" && holder.address.length >= 10) {
                  address = `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`
                } else {
                  address = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
                }

                return {
                  id: holder.address || `node-${Math.random()}`,
                  x: Math.random() * rect.width,
                  y: Math.random() * rect.height,
                  radius: Math.min(Math.max(infected * 1.5 + 5, 5), 25),
                  connections: infected,
                  address,
                  infected,
                  balance: holder.balance || "0",
                  vx: (Math.random() - 0.5) * 0.4,
                  vy: (Math.random() - 0.5) * 0.4,
                  selected: false,
                  tier,
                  pulsePhase: Math.random() * Math.PI * 2,
                }
              } catch (err) {
                console.error("[v0] Error mapping holder:", err)
                return null
              }
            })
            .filter((node): node is Node => node !== null) // Remove any null entries

          if (holderNodes.length > 0) {
            setNodes(holderNodes)
            setLoading(false)
          } else {
            console.error("[v0] No valid holder data available")
            setLoading(false)
          }
        } else {
          console.error("[v0] No holders data from API")
          setLoading(false)
        }
      } catch (error) {
        console.error("[v0] Error loading holders:", error)
        setLoading(false)
      }
    }

    if (!tokenAddress) {
      console.log("[v0] No token address provided")
      setLoading(false)
    } else {
      fetchHolders()
    }

    return () => {
      window.removeEventListener("resize", updateSize)
    }
  }, [tokenAddress, drawBackground, refreshTrigger, isMobile, isMounted])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return

    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()

    const handleInteraction = (x: number, y: number) => {
      const clickedNode = nodes.find((node) => {
        const dx = node.x - x
        const dy = node.y - y
        return Math.sqrt(dx * dx + dy * dy) < node.radius + 5
      })

      setSelectedNode(clickedNode || null)
    }

    const handleClick = (e: MouseEvent) => {
      const canvasRect = canvas.getBoundingClientRect()
      const x = e.clientX - canvasRect.left
      const y = e.clientY - canvasRect.top
      handleInteraction(x, y)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0]
        const canvasRect = canvas.getBoundingClientRect()
        const x = touch.clientX - canvasRect.left
        const y = touch.clientY - canvasRect.top
        handleInteraction(x, y)
      }
    }

    let hoverTimeout: NodeJS.Timeout
    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return // Skip hover on mobile

      clearTimeout(hoverTimeout)
      hoverTimeout = setTimeout(() => {
        const canvasRect = canvas.getBoundingClientRect()
        const x = e.clientX - canvasRect.left
        const y = e.clientY - canvasRect.top

        const hovered = nodes.find((node) => {
          const dx = node.x - x
          const dy = node.y - y
          return Math.sqrt(dx * dx + dy * dy) < node.radius + 5
        })

        setHoveredNode(hovered || null)
        canvas.style.cursor = hovered ? "pointer" : "default"
      }, 16)
    }

    canvas.addEventListener("click", handleClick)
    canvas.addEventListener("touchend", handleTouchEnd)
    canvas.addEventListener("mousemove", handleMouseMove)

    const animate = (currentTime: number) => {
      if (!lastFrameTime.current) lastFrameTime.current = currentTime
      const deltaTime = currentTime - lastFrameTime.current
      lastFrameTime.current = currentTime

      if (isPaused) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.save()
      ctx.scale(zoom, zoom)

      ctx.fillStyle = "rgba(0, 0, 0, 0.15)"
      ctx.fillRect(0, 0, rect.width / zoom, rect.height / zoom)

      updateSpatialGrid(nodes)

      nodes.forEach((node) => {
        const nearbyNodes = getNearbyNodes(node)

        nearbyNodes.forEach((other) => {
          if (node.id >= other.id) return

          const dx = other.x - node.x
          const dy = other.y - node.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 180) {
            const opacity = 0.25 * (1 - distance / 180)
            const isHighlighted =
              selectedNode?.id === node.id ||
              selectedNode?.id === other.id ||
              hoveredNode?.id === node.id ||
              hoveredNode?.id === other.id

            ctx.strokeStyle = isHighlighted ? `rgba(239, 68, 68, ${opacity * 2})` : `rgba(239, 68, 68, ${opacity})`
            ctx.lineWidth = isHighlighted ? 2 : 1

            if (isHighlighted) {
              ctx.shadowColor = "rgba(239, 68, 68, 0.5)"
              ctx.shadowBlur = 10
            }

            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.stroke()

            ctx.shadowBlur = 0
          }
        })
      })

      nodes.forEach((node) => {
        if (!isPaused) {
          node.x += node.vx * (deltaTime / 16)
          node.y += node.vy * (deltaTime / 16)
          node.pulsePhase += 0.05

          if (node.x < node.radius || node.x > rect.width / zoom - node.radius) {
            node.vx *= -0.95
            node.x = Math.max(node.radius, Math.min(rect.width / zoom - node.radius, node.x))
          }
          if (node.y < node.radius || node.y > rect.height / zoom - node.radius) {
            node.vy *= -0.95
            node.y = Math.max(node.radius, Math.min(rect.height / zoom - node.radius, node.y))
          }
        }

        const isSelected = selectedNode?.id === node.id
        const isHovered = hoveredNode?.id === node.id

        const pulseIntensity = Math.sin(node.pulsePhase) * 0.3 + 0.7
        const glowRadius = node.radius + (isSelected || isHovered ? 25 : 15) * pulseIntensity

        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius)

        if (node.tier === "super") {
          glowGradient.addColorStop(0, `rgba(239, 68, 68, ${0.6 * pulseIntensity})`)
          glowGradient.addColorStop(0.5, `rgba(239, 68, 68, ${0.3 * pulseIntensity})`)
          glowGradient.addColorStop(1, "rgba(239, 68, 68, 0)")
        } else if (node.tier === "active") {
          glowGradient.addColorStop(0, `rgba(239, 68, 68, ${0.4 * pulseIntensity})`)
          glowGradient.addColorStop(1, "rgba(239, 68, 68, 0)")
        } else {
          glowGradient.addColorStop(0, `rgba(239, 68, 68, ${0.2 * pulseIntensity})`)
          glowGradient.addColorStop(1, "rgba(239, 68, 68, 0)")
        }

        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2)
        ctx.fill()

        const nodeGradient = ctx.createRadialGradient(
          node.x - node.radius * 0.3,
          node.y - node.radius * 0.3,
          0,
          node.x,
          node.y,
          node.radius,
        )

        if (node.tier === "super") {
          nodeGradient.addColorStop(0, "rgba(255, 100, 100, 1)")
          nodeGradient.addColorStop(0.5, "rgba(239, 68, 68, 1)")
          nodeGradient.addColorStop(1, "rgba(185, 28, 28, 0.9)")
        } else if (node.tier === "active") {
          nodeGradient.addColorStop(0, "rgba(239, 68, 68, 1)")
          nodeGradient.addColorStop(0.7, "rgba(220, 38, 38, 0.9)")
          nodeGradient.addColorStop(1, "rgba(185, 28, 28, 0.7)")
        } else {
          nodeGradient.addColorStop(0, "rgba(220, 38, 38, 0.9)")
          nodeGradient.addColorStop(0.7, "rgba(185, 28, 28, 0.8)")
          nodeGradient.addColorStop(1, "rgba(153, 27, 27, 0.6)")
        }

        ctx.fillStyle = nodeGradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fill()

        if (isSelected) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
          ctx.lineWidth = 3
          ctx.shadowColor = "rgba(255, 255, 255, 0.5)"
          ctx.shadowBlur = 8
        } else if (isHovered) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"
          ctx.lineWidth = 2
          ctx.shadowColor = "rgba(255, 255, 255, 0.3)"
          ctx.shadowBlur = 5
        } else {
          ctx.strokeStyle = "rgba(239, 68, 68, 0.6)"
          ctx.lineWidth = 1.5
          ctx.shadowBlur = 0
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius + 1, 0, Math.PI * 2)
        ctx.stroke()
        ctx.shadowBlur = 0

        if (node.radius > 8) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius * 0.6, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = "white"
          ctx.font = `bold ${Math.min(node.radius * 0.8, 14)}px monospace`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(node.infected.toString(), node.x, node.y)
        }

        if (node.tier === "super") {
          ctx.strokeStyle = `rgba(255, 200, 0, ${0.6 * pulseIntensity})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2)
          ctx.stroke()
        }
      })

      ctx.restore()

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      canvas.removeEventListener("click", handleClick)
      canvas.removeEventListener("touchend", handleTouchEnd)
      canvas.removeEventListener("mousemove", handleMouseMove)
      clearTimeout(hoverTimeout)
    }
  }, [nodes, selectedNode, hoveredNode, isPaused, zoom, updateSpatialGrid, getNearbyNodes, isMobile])

  const getTierBadge = (tier: string) => {
    const badges = {
      super: { label: "SUPER SPREADER", variant: "destructive" as const, icon: "🦠" },
      active: { label: "ACTIVE CARRIER", variant: "destructive" as const, icon: "⚠️" },
      carrier: { label: "CARRIER", variant: "secondary" as const, icon: "📍" },
      infected: { label: "INFECTED", variant: "outline" as const, icon: "•" },
    }
    const badge = badges[tier as keyof typeof badges]
    return (
      <Badge variant={badge.variant} className="font-mono text-xs">
        {badge.icon} {badge.label}
      </Badge>
    )
  }

  return (
    <div className="relative w-full h-full">
      <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full" />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-red-500 font-mono text-sm">LOADING OUTBREAK DATA...</div>
          </div>
        </div>
      )}

      {!loading && nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="text-red-500/50 text-6xl">🦠</div>
            <div className="text-red-500 font-mono text-lg font-bold">NO OUTBREAK DATA</div>
            <div className="text-gray-400 text-sm">Connect to database to view real wallet data</div>
          </div>
        </div>
      )}

      {selectedNode && (
        <Card className="absolute top-4 left-4 md:top-6 md:left-6 bg-black/95 backdrop-blur-md border-red-500/40 p-4 md:p-5 max-w-[calc(100vw-2rem)] md:max-w-sm shadow-2xl shadow-red-500/20">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-start justify-between gap-2 md:gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-mono">WALLET ADDRESS</div>
                <div className="text-xs md:text-sm font-mono text-white break-all">{selectedNode.address}</div>
              </div>
              {getTierBadge(selectedNode.tier)}
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <div className="bg-zinc-900/50 rounded-lg p-2 md:p-3 border border-zinc-800">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-mono">Infected</div>
                <div className="text-xl md:text-2xl font-bold text-red-500 font-mono">{selectedNode.infected}</div>
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-2 md:p-3 border border-zinc-800">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-mono">Links</div>
                <div className="text-xl md:text-2xl font-bold text-red-500 font-mono">{selectedNode.connections}</div>
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-2 md:p-3 border border-zinc-800">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-mono">Size</div>
                <div className="text-xl md:text-2xl font-bold text-red-500 font-mono">
                  {selectedNode.radius.toFixed(0)}
                </div>
              </div>
            </div>

            <div className="pt-2 md:pt-3 border-t border-zinc-800">
              <div className="text-xs text-gray-400 font-mono">
                {selectedNode.tier === "super" && "⚠️ Critical threat level - Maximum containment priority"}
                {selectedNode.tier === "active" && "⚠️ High transmission rate detected"}
                {selectedNode.tier === "carrier" && "📊 Moderate spread activity"}
                {selectedNode.tier === "infected" && "📍 Standard infection detected"}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="hidden sm:block absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-black/95 backdrop-blur-md border-zinc-800 p-4 md:p-5 shadow-xl">
        <div className="space-y-2 md:space-y-3">
          <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-[0.15em] font-mono mb-3 md:mb-4 font-semibold">
            THREAT LEVELS
          </div>
          <div className="space-y-2.5 md:space-y-3">
            <div className="flex items-center gap-3 md:gap-3.5">
              <div className="relative w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-red-700 shadow-lg shadow-red-500/50 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-white/90" />
                <div className="absolute inset-0 rounded-full border border-red-300/30" />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-200 font-mono text-[11px] md:text-xs font-medium tracking-wide">
                  Super Spreader
                </span>
                <span className="text-gray-500 font-mono text-[10px] tracking-wider">50+ INFECTED</span>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-3.5">
              <div className="relative w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-red-500 to-red-800 shadow-md shadow-red-500/30 flex-shrink-0">
                <div className="absolute inset-0 rounded-full border border-red-400/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-300 font-mono text-[11px] md:text-xs font-medium tracking-wide">
                  Active Carrier
                </span>
                <span className="text-gray-500 font-mono text-[10px] tracking-wider">25+ INFECTED</span>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-3.5">
              <div className="relative w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex-shrink-0">
                <div className="absolute inset-0 rounded-full border border-red-500/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 font-mono text-[11px] md:text-xs font-medium tracking-wide">
                  Carrier
                </span>
                <span className="text-gray-500 font-mono text-[10px] tracking-wider">10+ INFECTED</span>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-3.5">
              <div className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-red-700/80 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-gray-500 font-mono text-[11px] md:text-xs font-medium tracking-wide">
                  Infected
                </span>
                <span className="text-gray-600 font-mono text-[10px] tracking-wider">STANDARD</span>
              </div>
            </div>
          </div>
          <div className="pt-3 md:pt-4 border-t border-zinc-800/80 mt-3 md:mt-4">
            <div className="flex items-center gap-3 md:gap-3.5">
              <div className="w-10 md:w-14 h-[2px] bg-gradient-to-r from-red-500/60 via-red-500/30 to-transparent rounded-full flex-shrink-0" />
              <span className="text-gray-500 font-mono text-[10px] md:text-xs tracking-[0.12em] uppercase font-medium">
                Transmission Path
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-black/80 backdrop-blur-sm border border-zinc-800 px-2 py-1 md:px-3 md:py-2 rounded font-mono text-xs text-gray-500">
        NODES: {nodes.length}
      </div>
    </div>
  )
}
