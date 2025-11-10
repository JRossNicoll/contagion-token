"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { formatBalance, formatAddress, formatDate } from "@/lib/format-utils"

export function InfectionsTable() {
  const [infections, setInfections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchInfections()
  }, [page])

  const fetchInfections = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/infections?page=${page}&limit=50`)
      const data = await response.json()
      setInfections(data.infections || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error("Failed to fetch infections:", error)
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
        <h2 className="text-2xl font-bold">Infection History</h2>
        <p className="text-sm text-muted-foreground">Track how tokens spread through the network</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Infector</TableHead>
              <TableHead>Infected</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Tx</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {infections.map((infection) => (
              <TableRow key={infection.id}>
                <TableCell className="font-mono">{formatAddress(infection.infector_address)}</TableCell>
                <TableCell className="font-mono">{formatAddress(infection.infected_address)}</TableCell>
                <TableCell className="text-right">{formatBalance(infection.infection_amount)}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                    {infection.infection_type}
                  </span>
                </TableCell>
                <TableCell>{formatDate(infection.created_at)}</TableCell>
                <TableCell className="text-center">
                  <a
                    href={`https://bscscan.com/tx/${infection.transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
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
