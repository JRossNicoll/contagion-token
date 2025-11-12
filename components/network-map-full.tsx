"use client"

import { useEffect, useRef, useState } from "react"
import { X, ArrowRight } from "lucide-react"

interface Node {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  infected_count: number
  is_patient_zero: boolean
  label?: string
}

interface NetworkLink {
  source: string
  target: string
}

interface HolderDetails {
  address: string
  balance: string
  base_balance: string
  reflection_balance: string
  infections_count: number
  spread_rate: number
  rank: number
  first_seen_time: string
}

interface InfectedWallet {
  infected_address: string
  infection_amount: string
  created_at: string
}

export function NetworkMapFull() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [links, setLinks] = useState<NetworkLink[]>([])
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [holderDetails, setHolderDetails] = useState<HolderDetails | null>(null)
  const [infectedWallets, setInfectedWallets] = useState<InfectedWallet[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] Fetching real infection chain data from API...")
    fetch("/api/infection-chain?limit=200")
      .then((res) => res.json())
      .then((data) => {
        console.log("[v0] Received real infection data:", data.infections?.length, "infections")
        const nodeMap = new Map<string, Node>()
        const linkList: NetworkLink[] = []

        data.infections?.forEach((infection: any) => {
          const infectedAddr = infection.infected_wallet?.toLowerCase()
          const infectorAddr = infection.infected_by_wallet?.toLowerCase()

          if (!infectedAddr) return

          console.log("[v0] Processing real infection:", {
            infected: infectedAddr.slice(0, 8) + "...",
            infectedBy: infectorAddr ? infectorAddr.slice(0, 8) + "..." : "None (Patient Zero)",
          })

          // Add infected wallet as node
          if (!nodeMap.has(infectedAddr)) {
            nodeMap.set(infectedAddr, {
              id: infectedAddr,
              x: Math.random() * 1600 + 160,
              y: Math.random() * 800 + 140,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              infected_count: 0,
              is_patient_zero: !infectorAddr,
              label: `${infectedAddr.slice(0, 6)}...${infectedAddr.slice(-4)}`,
            })
          }

          // Add infector wallet as node if exists
          if (infectorAddr && !nodeMap.has(infectorAddr)) {
            nodeMap.set(infectorAddr, {
              id: infectorAddr,
              x: Math.random() * 1600 + 160,
              y: Math.random() * 800 + 140,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              infected_count: 1,
              is_patient_zero: false,
              label: `${infectorAddr.slice(0, 6)}...${infectorAddr.slice(-4)}`,
            })
          }

          // Create link between infector and infected
          if (infectorAddr) {
            linkList.push({
              source: infectorAddr,
              target: infectedAddr,
            })

            // Increment infected count for infector
            const infectorNode = nodeMap.get(infectorAddr)
            if (infectorNode) {
              infectorNode.infected_count++
            }
          }
        })

        const nodeArray = Array.from(nodeMap.values())
        console.log(
          "[v0] Built network with",
          nodeArray.length,
          "real wallet nodes and",
          linkList.length,
          "real infection links",
        )
        setNodes(nodeArray)
        setLinks(linkList)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error fetching infection chain:", err)
        setLoading(false)
      })
  }, [])

  const handleNodeClick = async (node: Node) => {
    console.log("[v0] Clicked on real wallet:", node.id)
    setSelectedNode(node)
    setLoadingDetails(true)
    setInfectedWallets([])

    try {
      console.log("[v0] Fetching real data for wallet:", node.id.slice(0, 8) + "...")
      const [statsRes, holderRes, infectionsRes] = await Promise.all([
        fetch(`/api/user-stats?address=${node.id}`),
        fetch(`/api/holders?limit=1000`),
        fetch(`/api/infections?address=${node.id}&limit=100`),
      ])

      const statsData = await statsRes.json()
      const holderData = await holderRes.json()
      const infectionsData = await infectionsRes.json()

      console.log("[v0] Real wallet stats:", {
        address: node.id.slice(0, 8) + "...",
        infections: statsData.infections_count,
        rank: statsData.rank,
      })

      const holder = holderData.holders?.find((h: any) => h.holder_address.toLowerCase() === node.id)

      const infected =
        infectionsData.infections?.filter((inf: any) => inf.infector_address?.toLowerCase() === node.id) || []

      console.log("[v0] Found", infected.length, "real wallets infected by this wallet")

      setInfectedWallets(infected)

      setHolderDetails({
        address: node.id,
        balance: holder?.balance || "0",
        base_balance: holder?.base_balance || "0",
        reflection_balance: holder?.reflection_balance || "0",
        infections_count: statsData.infections_count || 0,
        spread_rate: statsData.spread_rate || 0,
        rank: statsData.rank || 0,
        first_seen_time: holder?.first_seen_time || "",
      })
    } catch (error) {
      console.error("[v0] Error fetching holder details:", error)
    } finally {
      setLoadingDetails(false)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      const hovered = nodes.find((node) => {
        const dx = x - node.x
        const dy = y - node.y
        const radius = node.is_patient_zero ? 10 : Math.max(5, Math.min(12, node.infected_count + 5))
        return Math.sqrt(dx * dx + dy * dy) < radius
      })

      setHoveredNode(hovered || null)
      canvas.style.cursor = hovered ? "pointer" : "default"
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      const clicked = nodes.find((node) => {
        const dx = x - node.x
        const dy = y - node.y
        const radius = node.is_patient_zero ? 10 : Math.max(5, Math.min(12, node.infected_count + 5))
        return Math.sqrt(dx * dx + dy * dy) < radius
      })

      if (clicked) {
        handleNodeClick(clicked)
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("click", handleClick)

    const animate = () => {
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      links.forEach((link) => {
        const sourceNode = nodes.find((n) => n.id === link.source)
        const targetNode = nodes.find((n) => n.id === link.target)

        if (sourceNode && targetNode) {
          const isConnected = selectedNode && (selectedNode.id === link.source || selectedNode.id === link.target)

          ctx.strokeStyle = isConnected ? "#ef4444" : "#7f1d1d"
          ctx.lineWidth = isConnected ? 2.5 : 1.5
          ctx.globalAlpha = isConnected ? 1 : 0.6
          ctx.beginPath()
          ctx.moveTo(sourceNode.x, sourceNode.y)
          ctx.lineTo(targetNode.x, targetNode.y)
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      })

      nodes.forEach((node) => {
        const radius = node.is_patient_zero ? 10 : Math.max(5, Math.min(12, node.infected_count + 5))
        const isHovered = hoveredNode?.id === node.id
        const isSelected = selectedNode?.id === node.id

        // Glow effect
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2.5)
        gradient.addColorStop(
          0,
          isSelected
            ? "rgba(239, 68, 68, 1)"
            : isHovered
              ? "rgba(248, 113, 113, 0.8)"
              : node.is_patient_zero
                ? "rgba(239, 68, 68, 0.6)"
                : "rgba(220, 38, 38, 0.4)",
        )
        gradient.addColorStop(1, "transparent")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius * 2.5, 0, Math.PI * 2)
        ctx.fill()

        // Node circle
        ctx.fillStyle = isSelected ? "#ef4444" : isHovered ? "#f87171" : node.is_patient_zero ? "#ef4444" : "#dc2626"
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fill()

        // Border for patient zero or selected
        if (node.is_patient_zero || isSelected) {
          ctx.strokeStyle = isSelected ? "#fca5a5" : "#fca5a5"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Show label on hover (only if not selected to avoid overlap with modal)
        if (isHovered && !isSelected && node.label) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
          ctx.fillRect(node.x - 55, node.y - 35, 110, 24)
          ctx.fillStyle = "#ef4444"
          ctx.font = "11px monospace"
          ctx.textAlign = "center"
          ctx.fillText(node.label, node.x, node.y - 17)
          ctx.fillStyle = "#9ca3af"
          ctx.font = "9px monospace"
          ctx.fillText(`Infected: ${node.infected_count}`, node.x, node.y - 17 + 12)
        }

        node.vx *= 0.98
        node.vy *= 0.98
        node.x += node.vx
        node.y += node.vy

        // Bounce off walls
        if (node.x < 20) {
          node.x = 20
          node.vx *= -0.8
        }
        if (node.x > canvas.width - 20) {
          node.x = canvas.width - 20
          node.vx *= -0.8
        }
        if (node.y < 20) {
          node.y = 20
          node.vy *= -0.8
        }
        if (node.y > canvas.height - 20) {
          node.y = canvas.height - 20
          node.vy *= -0.8
        }
      })

      // Apply repulsion forces between nodes
      nodes.forEach((node1, i) => {
        nodes.slice(i + 1).forEach((node2) => {
          const dx = node2.x - node1.x
          const dy = node2.y - node1.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150 && dist > 0) {
            const force = (150 - dist) * 0.002
            node1.vx -= (dx / dist) * force
            node1.vy -= (dy / dist) * force
            node2.vx += (dx / dist) * force
            node2.vy += (dy / dist) * force
          }
        })
      })

      // Apply attraction forces along links
      links.forEach((link) => {
        const sourceNode = nodes.find((n) => n.id === link.source)
        const targetNode = nodes.find((n) => n.id === link.target)

        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x
          const dy = targetNode.y - sourceNode.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist > 80) {
            const force = (dist - 80) * 0.001
            sourceNode.vx += (dx / dist) * force
            sourceNode.vy += (dy / dist) * force
            targetNode.vx -= (dx / dist) * force
            targetNode.vy -= (dy / dist) * force
          }
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("click", handleClick)
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [nodes, links, hoveredNode, selectedNode])

  const formatNumber = (value: string | number) => {
    const num = typeof value === "string" ? Number.parseFloat(value) : value
    if (isNaN(num)) return "0"
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 })
  }

  const formatBalance = (value: string | number) => {
    const num = typeof value === "string" ? BigInt(value) : BigInt(value)
    const formatted = Number(num) / 1e9
    return formatNumber(formatted)
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-black via-zinc-950 to-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-red-400 font-medium">Loading live infection network...</p>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} width={1920} height={1080} className="w-full h-full" />

      {selectedNode && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 overflow-y-auto">
          <div className="relative bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl max-w-3xl w-full my-8">
            <button
              onClick={() => {
                setSelectedNode(null)
                setHolderDetails(null)
                setInfectedWallets([])
              }}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <h2 className="text-2xl font-bold text-red-500 mb-6">Wallet Details</h2>

            {loadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : holderDetails ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-400">Address</span>
                    <span className="text-white font-mono text-sm">
                      {holderDetails.address.slice(0, 10)}...{holderDetails.address.slice(-8)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-400">Total Balance</span>
                    <span className="text-red-400 font-bold">{formatBalance(holderDetails.balance)} RPLC</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-400">Base Balance</span>
                    <span className="text-white">{formatBalance(holderDetails.base_balance)} RPLC</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-400">Reflection Balance</span>
                    <span className="text-green-400">{formatBalance(holderDetails.reflection_balance)} RPLC</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-400">Wallets Infected</span>
                    <span className="text-red-400 font-bold">{holderDetails.infections_count}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-400">Spread Rate</span>
                    <span className="text-white">{holderDetails.spread_rate.toFixed(2)} per day</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-400">Global Rank</span>
                    <span className="text-yellow-400 font-bold">#{holderDetails.rank}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-gray-400">Status</span>
                    <span className={selectedNode.is_patient_zero ? "text-red-500 font-bold" : "text-gray-300"}>
                      {selectedNode.is_patient_zero ? "PATIENT ZERO" : "Infected"}
                    </span>
                  </div>

                  {holderDetails.first_seen_time && (
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-gray-400">First Seen</span>
                      <span className="text-white text-sm">
                        {new Date(holderDetails.first_seen_time).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {infectedWallets.length > 0 && (
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                      <ArrowRight className="w-5 h-5" />
                      Infection Spread ({infectedWallets.length} wallets)
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {infectedWallets.map((infected, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-red-950/20 border border-red-900/30 rounded-lg hover:bg-red-950/30 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-mono text-sm text-white">
                              {infected.infected_address.slice(0, 8)}...{infected.infected_address.slice(-6)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(infected.created_at).toLocaleDateString()} •{" "}
                              {formatBalance(infected.infection_amount)} tokens
                            </div>
                          </div>
                          <a
                            href={`https://testnet.bscscan.com/address/${infected.infected_address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300 text-xs font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View →
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <a
                    href={`https://testnet.bscscan.com/address/${holderDetails.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-center text-red-400 font-medium transition-colors"
                  >
                    View on BSCScan
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">Failed to load holder details</div>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-6 flex items-center gap-6 text-sm bg-black/40 backdrop-blur-2xl border border-white/10 rounded-xl px-6 py-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-300 shadow-lg shadow-red-500/50"></div>
          <span className="text-gray-300 font-medium">Patient Zero</span>
        </div>
        <div className="w-px h-6 bg-white/20" />
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-600 shadow-lg shadow-red-600/50"></div>
          <span className="text-gray-300 font-medium">Infected Wallet</span>
        </div>
        <div className="w-px h-6 bg-white/20" />
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-red-800/60"></div>
          <span className="text-gray-300 font-medium">Transmission Path</span>
        </div>
        <div className="w-px h-6 bg-white/20" />
        <div className="text-gray-400 font-mono text-sm">
          <span className="text-red-400 font-semibold">{nodes.length}</span> wallets •{" "}
          <span className="text-red-400 font-semibold">{links.length}</span> transmissions
        </div>
        <div className="w-px h-6 bg-white/20" />
        <div className="text-gray-500 text-xs italic">Click any wallet to view details</div>
      </div>
    </div>
  )
}
