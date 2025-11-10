export interface Holder {
  holder_address: string
  balance: bigint | string // Database stores as bigint, JS uses string
  base_balance: bigint | string
  reflection_balance: bigint | string
  first_seen_block: bigint | number
  first_seen_time: string
  proxy_count: number
  locked: boolean
  last_scanned: string | null
  created_at?: string
  updated_at?: string
}

export interface ProxyWallet {
  id: string
  holder_address: string
  proxy_address: string
  proxy_type: "pre_purchase" | "post_purchase"
  transaction_hash: string
  detected_at: string
  created_at?: string
}

export interface Snapshot {
  snapshot_id: number
  amount: bigint | string
  taken_at: string
  distributed_at: string | null
  status: "pending" | "distributed"
  holder_count: number
  distribution_tx: string | null
  error_message: string | null
  created_at?: string
  updated_at?: string
}

export interface Infection {
  id: string
  infector_address: string
  infected_address: string
  infection_amount: bigint | string
  infection_type: string
  transaction_hash: string
  block_number: bigint | number | null
  created_at: string
}

export interface HolderStatistics {
  holder_address: string
  balance: bigint
  base_balance: bigint
  reflection_balance: bigint
  proxy_count: number
  locked: boolean
  first_seen_time: string
  total_reflections_received: bigint
  total_distributions_received: bigint
}

export interface DistributionSummary {
  snapshot_id: number
  snapshot_amount: bigint
  taken_at: string
  distributed_at: string | null
  status: string
  distribution_tx: string | null
  total_distributed: bigint
  unique_recipients: bigint
  total_distributions: bigint
}

export interface Distribution {
  id: string
  snapshot_id: number
  recipient_address: string
  holder_source: string
  amount: bigint | string
  created_at: string
}
