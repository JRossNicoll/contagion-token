"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatBalance, formatDate } from "@/lib/format-utils"

export function SnapshotsTable() {
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchSnapshots()
  }, [page])

  const fetchSnapshots = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/snapshots?page=${page}&limit=20`)
      const data = await response.json()
      setSnapshots(data.snapshots || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error("Failed to fetch snapshots:", error)
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
        <h2 className="text-2xl font-bold">Reflection Snapshots</h2>
        <p className="text-sm text-muted-foreground">History of reflection pool snapshots and distributions</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Snapshot ID</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Taken At</TableHead>
              <TableHead>Distributed At</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshots.map((snapshot) => (
              <TableRow key={snapshot.snapshot_id}>
                <TableCell className="font-bold">#{snapshot.snapshot_id}</TableCell>
                <TableCell className="text-right">{formatBalance(snapshot.amount)}</TableCell>
                <TableCell>{formatDate(snapshot.taken_at)}</TableCell>
                <TableCell>{snapshot.distributed_at ? formatDate(snapshot.distributed_at) : "-"}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      snapshot.status === "distributed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {snapshot.status}
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
