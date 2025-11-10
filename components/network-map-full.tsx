"use client"

import { useEffect, useRef, useState } from "react"

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

export function NetworkMapFull() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [links, setLinks] = useState<NetworkLink[]>([])
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] Fetching infection chain data for map...")

    fetch("/api/infection-chain?limit=100")
      .then((res) => {
        console.log("[v0] Infection chain API response status:", res.status)
        return res.json()
      })
      .then((data) => {
        console.log("[v0] Infection chain data received:", data)

        const nodeMap = new Map<string, Node>()
        const linkList: NetworkLink[] = []

        data.infections?.forEach((infection: any, index: number) => {
          const infectedAddr = infection.infected_wallet?.toLowerCase()
          const infectorAddr = infection.infected_by_wallet?.toLowerCase()

          if (!infectedAddr) return

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
        console.log("[v0] Processed nodes:", nodeArray.length, "links:", linkList.length)

        setNodes(nodeArray)
        setLinks(linkList)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error fetching infection chain:", err)
        setLoading(false)
      })
  }, [])

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
    }

    canvas.addEventListener("mousemove", handleMouseMove)

    const animate = () => {
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      links.forEach((link) => {
        const sourceNode = nodes.find((n) => n.id === link.source)
        const targetNode = nodes.find((n) => n.id === link.target)

        if (sourceNode && targetNode) {
          ctx.strokeStyle = "#7f1d1d"
          ctx.lineWidth = 1.5
          ctx.globalAlpha = 0.6
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

        // Glow effect
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2.5)
        gradient.addColorStop(
          0,
          isHovered
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
        ctx.fillStyle = isHovered ? "#f87171" : node.is_patient_zero ? "#ef4444" : "#dc2626"
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fill()

        // Border for patient zero
        if (node.is_patient_zero) {
          ctx.strokeStyle = "#fca5a5"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Show label on hover
        if (isHovered && node.label) {
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
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [nodes, links, hoveredNode])

  return (
    <div className="relative w-full h-full bg-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-red-500 font-mono">Loading infection network...</div>
        </div>
      )}

      <canvas ref={canvasRef} width={1920} height={1080} className="w-full h-full" />

      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs bg-black/80 backdrop-blur-sm border border-red-900/30 rounded px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 border border-red-300"></div>
          <span className="text-gray-400">Patient Zero</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
          <span className="text-gray-400">Infected Wallet</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-red-800"></div>
          <span className="text-gray-400">Transmission Path</span>
        </div>
        <div className="text-gray-500">|</div>
        <div className="text-gray-400">
          {nodes.length} wallets • {links.length} transmissions
        </div>
      </div>
    </div>
  )
}
