"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatBalance, formatAddress } from "@/lib/format-utils"

export function HoldersTable() {
  const [holders, setHolders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchHolders()
  }, [page])

  const fetchHolders = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/holders?page=${page}&limit=50`)
      const data = await response.json()
      setHolders(data.holders || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error("Failed to fetch holders:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Token Holders</h2>
        <p className="text-sm text-muted-foreground">All holders with proxy wallet information</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-center">Proxies</TableHead>
              <TableHead className="text-right">Reflections</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holders.map((holder) => (
              <TableRow key={holder.holder_address}>
                <TableCell className="font-mono">{formatAddress(holder.holder_address)}</TableCell>
                <TableCell className="text-right">{formatBalance(holder.balance)}</TableCell>
                <TableCell className="text-center">{holder.proxy_count}/4</TableCell>
                <TableCell className="text-right">{formatBalance(holder.total_reflections_received || 0)}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      holder.locked ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {holder.locked ? "Locked" : "Scanning"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
