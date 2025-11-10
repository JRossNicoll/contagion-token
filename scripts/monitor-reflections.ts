import { ethers } from "ethers"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

// Configuration
const RPC_URL = process.env.RPC_URL!
const PRIVATE_KEY = process.env.PRIVATE_KEY!
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SNAPSHOT_THRESHOLD = Number.parseInt(process.env.SNAPSHOT_THRESHOLD || "1")
const MIN_HOLDER_BALANCE = BigInt(process.env.MIN_HOLDER_BALANCE || "100000000000") // 100 tokens with 9 decimals
const SCAN_INTERVAL = Number.parseInt(process.env.SCAN_INTERVAL || "30000")

if (!SUPABASE_URL) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL is missing from .env.local")
  process.exit(1)
}
if (!SUPABASE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing from .env.local")
  process.exit(1)
}
if (!RPC_URL) {
  console.error("❌ RPC_URL is missing from .env.local")
  process.exit(1)
}
if (!CONTRACT_ADDRESS) {
  console.error("❌ CONTRACT_ADDRESS is missing from .env.local")
  process.exit(1)
}
if (!PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY is missing from .env.local")
  process.exit(1)
}

console.log("✓ Environment variables loaded successfully")
console.log(`✓ Contract: ${CONTRACT_ADDRESS}`)
console.log(`✓ RPC: ${RPC_URL}`)
console.log(`✓ Snapshot Threshold: ${SNAPSHOT_THRESHOLD}%`)

// Known CEX addresses
const KNOWN_CEX_ADDRESSES = new Set([
  "0x28c6c06298d514db089934071355e5743bf21d60", // Binance
  "0x21a31ee1afc51d94c2efccaa2092ad1028285549", // Binance 2
  "0xdfd5293d8e347dfe59e90efd55b2956a1343963d", // Binance 3
  "0x564286362092d8e7936f0549571a803b203aaced", // Binance 4
  "0x0681d8db095565fe8a346fa0277bffde9c0edbbf", // Binance 5
  // Add more CEX addresses as needed
])

// Initialize providers
const provider = new ethers.JsonRpcProvider(RPC_URL)
const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Contract ABI (minimal required functions)
const CONTRACT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function baseBalanceOf(address) view returns (uint256)",
  "function reflectionBalanceOf(address) view returns (uint256)",
  "function takeSnapshot() returns (uint256, uint256)",
  "function setProxyWallets(address, address[4])",
  "function distributeReflections(address[], uint256[])",
  "function reflectionPool() view returns (address)",
  "function TOTAL_SUPPLY() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet)

// Types
interface Holder {
  holder_address: string
  balance: string
  base_balance: string
  reflection_balance: string
  first_seen_block: number
  first_seen_time: string
  proxy_count: number
  locked: boolean
  last_scanned: string | null
  virtual_reflection_balance?: string
}

interface ProxyWallet {
  proxy_address: string
  proxy_type: "pre_purchase" | "post_purchase"
  transaction_hash: string
  detected_at: string
}

interface Snapshot {
  snapshot_id: number
  amount: string
  taken_at: string
  status: "pending" | "distributed"
  holder_count: number
}

// Logging utility
function log(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${message}`, data || "")

  // Log to database
  supabase
    .from("script_logs")
    .insert({
      log_type: "info",
      message,
      details: data || {},
    })
    .then()
}

function logError(message: string, error: any) {
  const timestamp = new Date().toISOString()
  console.error(`[${timestamp}] ERROR: ${message}`, error)

  // Log to database
  supabase
    .from("script_logs")
    .insert({
      log_type: "error",
      message,
      details: { error: error.message, stack: error.stack },
    })
    .then()
}

// Check if address is a contract
async function isContract(address: string): Promise<boolean> {
  try {
    const code = await provider.getCode(address)
    return code !== "0x"
  } catch (error) {
    logError(`Failed to check if ${address} is contract`, error)
    return false
  }
}

// Check if address is CEX deposit
async function isCEXDeposit(address: string): Promise<boolean> {
  try {
    // Check if address is in known CEX list
    if (KNOWN_CEX_ADDRESSES.has(address.toLowerCase())) {
      return true
    }

    // Check recent transactions from target address
    try {
      const history = await provider.getHistory(address)
      const recentTxs = history.slice(-10) // Last 10 transactions

      for (const tx of recentTxs) {
        if (tx.to && KNOWN_CEX_ADDRESSES.has(tx.to.toLowerCase())) {
          return true
        }
      }
    } catch (historyError) {
      // If getHistory fails, just check known addresses
      logError(`getHistory failed for ${address}, skipping history check`, historyError)
    }

    return false
  } catch (error) {
    logError(`Failed to check if ${address} is CEX deposit`, error)
    return false // Err on the side of inclusion
  }
}

async function getTransactionHistory(address: string, limit = 100): Promise<any[]> {
  try {
    // Try getHistory first
    const history = await provider.getHistory(address, undefined, limit)
    return history
  } catch (error) {
    logError(`Failed to get history for ${address} via getHistory, trying fallback`, error)

    // Fallback: use getLogs with Transfer events
    try {
      const latestBlock = await provider.getBlockNumber()
      const fromBlock = Math.max(0, latestBlock - 100000) // Last ~100k blocks

      const filter = {
        address: CONTRACT_ADDRESS,
        topics: [ethers.id("Transfer(address,address,uint256)"), ethers.zeroPadValue(address, 32)],
        fromBlock,
        toBlock: "latest",
      }

      const logs = await provider.getLogs(filter)
      const transactions = []

      for (const logEntry of logs.slice(-limit)) {
        try {
          const tx = await provider.getTransaction(logEntry.transactionHash)
          if (tx) transactions.push(tx)
        } catch (txError) {
          // Skip this tx if it fails
          continue
        }
      }

      return transactions
    } catch (fallbackError) {
      logError(`Fallback history fetch also failed for ${address}`, fallbackError)
      return []
    }
  }
}

// Find pre-purchase proxy wallets
async function findPrePurchaseProxies(holderAddress: string, purchaseTimestamp: number): Promise<ProxyWallet[]> {
  try {
    const proxies: ProxyWallet[] = []
    const lookbackTime = purchaseTimestamp - 30 * 24 * 60 * 60 // 30 days back

    const history = await getTransactionHistory(holderAddress)

    // Filter outgoing transactions before purchase
    const outgoingTxs = history.filter((tx) => {
      const txTime = tx.timestamp || 0
      return (
        tx.from?.toLowerCase() === holderAddress.toLowerCase() && txTime >= lookbackTime && txTime <= purchaseTimestamp
      )
    })

    // Get last 2 outgoing transactions
    const lastTwoTxs = outgoingTxs.slice(-2)

    for (const tx of lastTwoTxs) {
      if (!tx.to) continue

      const recipient = tx.to

      // Apply filters
      const isContractAddress = await isContract(recipient)
      const isCEX = await isCEXDeposit(recipient)

      if (!isContractAddress && !isCEX) {
        proxies.push({
          proxy_address: recipient,
          proxy_type: "pre_purchase",
          transaction_hash: tx.hash,
          detected_at: new Date().toISOString(),
        })
      }
    }

    return proxies
  } catch (error) {
    logError(`Failed to find pre-purchase proxies for ${holderAddress}`, error)
    return []
  }
}

// Find post-purchase proxy wallets
async function findPostPurchaseProxies(holderAddress: string, purchaseTimestamp: number): Promise<ProxyWallet[]> {
  try {
    const proxies: ProxyWallet[] = []
    const monitorUntil = purchaseTimestamp + 7 * 24 * 60 * 60 // 7 days forward
    const currentTime = Math.floor(Date.now() / 1000)

    if (currentTime < monitorUntil) {
      log(`Still monitoring ${holderAddress} for post-purchase proxies`)
    }

    const history = await getTransactionHistory(holderAddress)

    // Filter outgoing transactions after purchase
    const outgoingTxs = history.filter((tx) => {
      const txTime = tx.timestamp || 0
      return (
        tx.from?.toLowerCase() === holderAddress.toLowerCase() &&
        txTime >= purchaseTimestamp &&
        txTime <= Math.min(currentTime, monitorUntil)
      )
    })

    // Get first 2 outgoing transactions
    const firstTwoTxs = outgoingTxs.slice(0, 2)

    for (const tx of firstTwoTxs) {
      if (!tx.to) continue

      const recipient = tx.to

      // Apply filters
      const isContractAddress = await isContract(recipient)
      const isCEX = await isCEXDeposit(recipient)

      if (!isContractAddress && !isCEX) {
        proxies.push({
          proxy_address: recipient,
          proxy_type: "post_purchase",
          transaction_hash: tx.hash,
          detected_at: new Date().toISOString(),
        })
      }
    }

    return proxies
  } catch (error) {
    logError(`Failed to find post-purchase proxies for ${holderAddress}`, error)
    return []
  }
}

// Scan holder for proxy wallets
async function scanHolder(holder: Holder): Promise<ProxyWallet[]> {
  try {
    const purchaseTimestamp = Math.floor(new Date(holder.first_seen_time).getTime() / 1000)

    // Get pre-purchase proxies (2)
    const preProxies = await findPrePurchaseProxies(holder.holder_address, purchaseTimestamp)

    // Get post-purchase proxies (2)
    const postProxies = await findPostPurchaseProxies(holder.holder_address, purchaseTimestamp)

    const allProxies = [...preProxies, ...postProxies]

    // Save proxies to database
    for (const proxy of allProxies) {
      await supabase.from("proxy_wallets").upsert({
        holder_address: holder.holder_address,
        proxy_address: proxy.proxy_address,
        proxy_type: proxy.proxy_type,
        transaction_hash: proxy.transaction_hash,
        detected_at: proxy.detected_at,
      })
    }

    return allProxies
  } catch (error) {
    logError(`Failed to scan holder ${holder.holder_address}`, error)
    return []
  }
}

// Set proxy wallets on-chain
async function setProxyWalletsOnChain(holder: string, proxies: string[]): Promise<void> {
  try {
    // Pad proxies array to length 4 with zero addresses
    const paddedProxies: string[] = [...proxies]
    while (paddedProxies.length < 4) {
      paddedProxies.push(ethers.ZeroAddress)
    }

    log(`Setting proxy wallets for ${holder}`, { proxies: paddedProxies })

    const tx = await contract.setProxyWallets(holder, paddedProxies)
    await tx.wait()

    log(`Successfully set proxy wallets for ${holder}`, { txHash: tx.hash })
  } catch (error) {
    logError(`Failed to set proxy wallets for ${holder}`, error)
    throw error
  }
}

// Calculate distributions for a snapshot
async function calculateDistributions(snapshotId: number): Promise<{
  recipients: string[]
  amounts: bigint[]
}> {
  try {
    // Get snapshot data
    const { data: snapshot } = await supabase.from("snapshots").select("*").eq("snapshot_id", snapshotId).single()

    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`)
    }

    const snapshotAmount = BigInt(snapshot.amount)

    const { data: holders } = await supabase
      .from("holders")
      .select("*")
      .eq("locked", true)
      .gte("balance", MIN_HOLDER_BALANCE.toString())

    if (!holders || holders.length === 0) {
      log("No eligible holders found for distribution")
      return { recipients: [], amounts: [] }
    }

    log(`Calculating distributions for ${holders.length} holders`)

    let totalEligibleBalance = 0n
    const holderData: Array<{
      address: string
      balance: bigint
      proxies: string[]
    }> = []

    for (const holder of holders) {
      // Get proxies for holder
      const { data: proxies } = await supabase
        .from("proxy_wallets")
        .select("proxy_address")
        .eq("holder_address", holder.holder_address)

      if (!proxies || proxies.length === 0) {
        log(`Holder ${holder.holder_address} has no proxies, skipping`)
        continue
      }

      const holderBalance = BigInt(holder.balance)
      totalEligibleBalance += holderBalance

      holderData.push({
        address: holder.holder_address,
        balance: holderBalance,
        proxies: proxies.map((p) => p.proxy_address),
      })
    }

    if (totalEligibleBalance === 0n) {
      log("No eligible balance for distribution")
      return { recipients: [], amounts: [] }
    }

    log(`Total eligible balance: ${totalEligibleBalance.toString()}`)

    const distributions = new Map<string, bigint>()
    const distributionRecords: Array<{
      snapshot_id: number
      recipient_address: string
      holder_source: string
      amount: string
    }> = []

    for (const holder of holderData) {
      // Calculate holder's share of the snapshot amount
      const holderShare = (holder.balance * snapshotAmount) / totalEligibleBalance

      if (holderShare === 0n) continue

      // Distribute equally to proxies
      const amountPerProxy = holderShare / BigInt(holder.proxies.length)

      if (amountPerProxy === 0n) continue

      for (const proxy of holder.proxies) {
        const current = distributions.get(proxy) || 0n
        distributions.set(proxy, current + amountPerProxy)

        distributionRecords.push({
          snapshot_id: snapshotId,
          recipient_address: proxy,
          holder_source: holder.address,
          amount: amountPerProxy.toString(),
        })
      }

      log(`Holder ${holder.address}: ${holderShare.toString()} total, ${amountPerProxy.toString()} per proxy`, {
        proxies: holder.proxies.length,
      })
    }

    if (distributionRecords.length > 0) {
      const { error } = await supabase.from("distributions").insert(distributionRecords)

      if (error) {
        logError("Failed to save distribution records", error)
      } else {
        log(`Saved ${distributionRecords.length} distribution records`)
      }
    }

    await supabase
      .from("snapshots")
      .update({
        holder_count: holderData.length,
      })
      .eq("snapshot_id", snapshotId)

    // Convert to arrays
    const recipients = Array.from(distributions.keys())
    const amounts = Array.from(distributions.values())

    log(`Distribution summary`, {
      totalRecipients: recipients.length,
      totalAmount: amounts.reduce((a, b) => a + b, 0n).toString(),
    })

    return { recipients, amounts }
  } catch (error) {
    logError(`Failed to calculate distributions for snapshot ${snapshotId}`, error)
    throw error
  }
}

// Distribute snapshot off-chain (database only)
async function distributeSnapshotOffChain(snapshotId: number): Promise<void> {
  try {
    log(`Distributing snapshot ${snapshotId} OFF-CHAIN (database only)`)

    const { recipients, amounts } = await calculateDistributions(snapshotId)

    if (recipients.length === 0) {
      log(`No distributions to execute for snapshot ${snapshotId}`)
      return
    }

    const updates = recipients.map((address, i) => ({
      holder_address: address.toLowerCase(),
      virtual_reflection_balance: amounts[i].toString(),
      last_updated: new Date().toISOString(),
    }))

    for (const update of updates) {
      const { data: existing } = await supabase
        .from("holders")
        .select("virtual_reflection_balance")
        .eq("holder_address", update.holder_address)
        .single()

      const currentBalance = existing?.virtual_reflection_balance ? BigInt(existing.virtual_reflection_balance) : 0n

      const newBalance = currentBalance + BigInt(update.virtual_reflection_balance)

      await supabase.from("holders").upsert({
        holder_address: update.holder_address,
        virtual_reflection_balance: newBalance.toString(),
        last_updated: update.last_updated,
      })
    }

    // Update snapshot status
    await supabase
      .from("snapshots")
      .update({
        status: "distributed",
        distributed_at: new Date().toISOString(),
      })
      .eq("snapshot_id", snapshotId)

    log(`Snapshot ${snapshotId} distributed OFF-CHAIN to ${recipients.length} addresses`)
    log(`Total amount distributed: ${amounts.reduce((a, b) => a + b, 0n).toString()} (virtual balance)`)
  } catch (error) {
    logError(`Failed to distribute snapshot ${snapshotId}`, error)
    throw error
  }
}

// Check pool balance and trigger snapshot
async function checkPoolBalance(): Promise<void> {
  try {
    const reflectionPoolAddress = await contract.reflectionPool()
    const poolBalance = await contract.balanceOf(reflectionPoolAddress)
    const totalSupply = await contract.TOTAL_SUPPLY()
    const threshold = (totalSupply * BigInt(SNAPSHOT_THRESHOLD)) / 100n

    log("Pool balance check", {
      poolBalance: poolBalance.toString(),
      threshold: threshold.toString(),
      percentOfSupply: ((poolBalance * 100n) / totalSupply).toString() + "%",
    })

    if (poolBalance >= threshold) {
      log("Threshold reached! Creating OFF-CHAIN snapshot...")

      // Get next snapshot ID from database
      const { data: lastSnapshot } = await supabase
        .from("snapshots")
        .select("snapshot_id")
        .order("snapshot_id", { ascending: false })
        .limit(1)
        .single()

      const nextSnapshotId = lastSnapshot ? lastSnapshot.snapshot_id + 1 : 1

      // Create snapshot in database only (no on-chain transaction)
      const { error: insertError } = await supabase.from("snapshots").insert({
        snapshot_id: nextSnapshotId,
        amount: poolBalance.toString(),
        taken_at: new Date().toISOString(),
        status: "pending",
      })

      if (insertError) {
        logError("Failed to create snapshot in database", insertError)
        return
      }

      log("OFF-CHAIN snapshot created", {
        snapshotId: nextSnapshotId,
        amount: poolBalance.toString(),
      })

      // Scan holders before distributing
      await scanHolders()

      // Distribute the current snapshot
      await distributeSnapshotOffChain(nextSnapshotId)
    }
  } catch (error) {
    logError("Failed to check pool balance", error)
  }
}

// Scan all unlocked holders
async function scanHolders(): Promise<void> {
  try {
    log("Scanning holders...")

    // Get unlocked holders
    const { data: holders } = await supabase
      .from("holders")
      .select("*")
      .eq("locked", false)
      .gte("balance", MIN_HOLDER_BALANCE.toString())

    if (!holders || holders.length === 0) {
      log("No unlocked holders to scan")
      return
    }

    log(`Found ${holders.length} unlocked holders to scan`)

    // Process holders in smaller batches to avoid overwhelming RPC
    const batchSize = 10
    for (let i = 0; i < holders.length; i += batchSize) {
      const batch = holders.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (holder) => {
          try {
            const proxies = await scanHolder(holder)

            const purchaseTimestamp = Math.floor(new Date(holder.first_seen_time).getTime() / 1000)
            const currentTime = Math.floor(Date.now() / 1000)
            const monitoringEnded = currentTime >= purchaseTimestamp + 7 * 24 * 60 * 60
            const hasMaxProxies = proxies.length >= 4

            if (hasMaxProxies || monitoringEnded) {
              await supabase
                .from("holders")
                .update({
                  locked: true,
                  proxy_count: proxies.length,
                  last_scanned: new Date().toISOString(),
                })
                .eq("holder_address", holder.holder_address)

              if (proxies.length > 0) {
                const proxyAddresses = proxies.map((p) => p.proxy_address)
                await setProxyWalletsOnChain(holder.holder_address, proxyAddresses)
              }

              log(`Locked holder ${holder.holder_address}`, {
                proxyCount: proxies.length,
                reason: hasMaxProxies ? "max_proxies" : "monitoring_ended",
              })
            } else {
              await supabase
                .from("holders")
                .update({
                  proxy_count: proxies.length,
                  last_scanned: new Date().toISOString(),
                })
                .eq("holder_address", holder.holder_address)
            }
          } catch (holderError) {
            logError(`Error scanning holder ${holder.holder_address}`, holderError)
          }
        }),
      )

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    log("Holder scanning complete")
  } catch (error) {
    logError("Failed to scan holders", error)
  }
}

// Main loop
async function mainLoop(): Promise<void> {
  log("Starting Contagion reflection monitor")

  let running = true
  let reconnectAttempts = 0
  const MAX_RECONNECT_ATTEMPTS = 10

  provider.on("error", async (error) => {
    logError("Provider connection error", error)
    reconnectAttempts++

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      logError("Max reconnection attempts reached, exiting", error)
      process.exit(1)
    }

    await new Promise((resolve) => setTimeout(resolve, 5000 * reconnectAttempts))
    log(`Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`)
  })

  process.on("SIGTERM", () => {
    log("Received SIGTERM, shutting down gracefully")
    running = false
  })

  process.on("SIGINT", () => {
    log("Received SIGINT, shutting down gracefully")
    running = false
  })

  while (running) {
    try {
      await checkPoolBalance()
      reconnectAttempts = 0
    } catch (error) {
      logError("Error in main loop", error)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    await new Promise((resolve) => setTimeout(resolve, SCAN_INTERVAL))
  }

  provider.removeAllListeners()
  log("Monitor stopped")
}

mainLoop().catch((error) => {
  logError("Fatal error in main loop", error)
  process.exit(1)
})
