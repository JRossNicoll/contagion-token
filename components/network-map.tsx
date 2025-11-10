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
}

interface Link {
  source: string
  target: string
}

export function NetworkMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [links, setLinks] = useState<Link[]>([])

  useEffect(() => {
    // Fetch infection chain data
    fetch("/api/infection-chain?limit=50")
      .then((res) => res.json())
      .then((data) => {
        const nodeMap = new Map<string, Node>()
        const linkList: Link[] = []

        data.infections?.forEach((infection: any) => {
          // Add infected wallet
          if (!nodeMap.has(infection.infected_wallet)) {
            nodeMap.set(infection.infected_wallet, {
              id: infection.infected_wallet,
              x: Math.random() * 600,
              y: Math.random() * 400,
              vx: 0,
              vy: 0,
              infected_count: infection.infected_count || 0,
              is_patient_zero: !infection.infected_by_wallet,
            })
          }

          // Add infector wallet if exists
          if (infection.infected_by_wallet && !nodeMap.has(infection.infected_by_wallet)) {
            nodeMap.set(infection.infected_by_wallet, {
              id: infection.infected_by_wallet,
              x: Math.random() * 600,
              y: Math.random() * 400,
              vx: 0,
              vy: 0,
              infected_count: 0,
              is_patient_zero: false,
            })
          }

          // Add link
          if (infection.infected_by_wallet) {
            linkList.push({
              source: infection.infected_by_wallet,
              target: infection.infected_wallet,
            })
          }
        })

        setNodes(Array.from(nodeMap.values()))
        setLinks(linkList)
      })
      .catch((err) => console.error("Error fetching infection chain:", err))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number

    const animate = () => {
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw links
      ctx.strokeStyle = "#7f1d1d"
      ctx.lineWidth = 1
      links.forEach((link) => {
        const sourceNode = nodes.find((n) => n.id === link.source)
        const targetNode = nodes.find((n) => n.id === link.target)

        if (sourceNode && targetNode) {
          ctx.beginPath()
          ctx.moveTo(sourceNode.x, sourceNode.y)
          ctx.lineTo(targetNode.x, targetNode.y)
          ctx.stroke()
        }
      })

      // Draw nodes
      nodes.forEach((node) => {
        const radius = node.is_patient_zero ? 8 : Math.max(4, Math.min(10, node.infected_count + 4))

        // Glow effect
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2)
        gradient.addColorStop(0, node.is_patient_zero ? "#ef4444" : "#dc2626")
        gradient.addColorStop(1, "transparent")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2)
        ctx.fill()

        // Node
        ctx.fillStyle = node.is_patient_zero ? "#ef4444" : "#dc2626"
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fill()

        // Apply simple physics
        node.vx *= 0.95
        node.vy *= 0.95
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 10 || node.x > canvas.width - 10) node.vx *= -1
        if (node.y < 10 || node.y > canvas.height - 10) node.vy *= -1
      })

      // Apply forces between nodes
      nodes.forEach((node1, i) => {
        nodes.slice(i + 1).forEach((node2) => {
          const dx = node2.x - node1.x
          const dy = node2.y - node1.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 100 && dist > 0) {
            const force = (100 - dist) * 0.001
            node1.vx -= (dx / dist) * force
            node1.vy -= (dy / dist) * force
            node2.vx += (dx / dist) * force
            node2.vy += (dy / dist) * force
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [nodes, links])

  return (
    <div className="relative w-full max-w-5xl mx-auto bg-gradient-to-br from-red-950/20 to-black border border-red-900/30 rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/80 backdrop-blur-sm border border-red-900/30 rounded px-3 py-2 text-xs">
          <div className="text-red-500 font-bold mb-1">NETWORK STATUS</div>
          <div className="text-gray-400">Tracking...</div>
        </div>
      </div>

      <canvas ref={canvasRef} width={800} height={400} className="w-full h-[400px]" />

      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-400">Infected Wallet</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-red-800"></div>
          <span className="text-gray-400">Transmission Path</span>
        </div>
      </div>
    </div>
  )
}
