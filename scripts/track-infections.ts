import { ethers } from "ethers"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const RPC_URL = process.env.RPC_URL!
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

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

console.log("✓ Environment variables loaded successfully")
console.log(`✓ Contract: ${CONTRACT_ADDRESS}`)
console.log(`✓ RPC: ${RPC_URL}`)

const provider = new ethers.JsonRpcProvider(RPC_URL)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const CONTRACT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function balanceOf(address) view returns (uint256)",
  "function baseBalanceOf(address) view returns (uint256)",
  "function reflectionBalanceOf(address) view returns (uint256)",
]

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

let lastProcessedBlock = 0

function log(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${message}`, data || "")
}

async function handleTransfer(from: string, to: string, amount: bigint, txHash: string, blockNumber: number) {
  try {
    if (from === ethers.ZeroAddress || to === ethers.ZeroAddress) {
      return
    }

    const { data: existingTx } = await supabase
      .from("infections")
      .select("transaction_hash")
      .eq("transaction_hash", txHash)
      .single()

    if (existingTx) {
      return // Already processed
    }

    await supabase.from("infections").insert({
      infector_address: from,
      infected_address: to,
      infection_amount: amount.toString(),
      infection_type: "transfer",
      transaction_hash: txHash,
      block_number: blockNumber,
      created_at: new Date().toISOString(),
    })

    const [balance, baseBalance, reflectionBalance] = await Promise.all([
      contract.balanceOf(to),
      contract.baseBalanceOf(to),
      contract.reflectionBalanceOf(to),
    ])

    const { data: existingHolder } = await supabase
      .from("holders")
      .select("holder_address")
      .eq("holder_address", to)
      .single()

    if (existingHolder) {
      await supabase
        .from("holders")
        .update({
          balance: balance.toString(),
          base_balance: baseBalance.toString(),
          reflection_balance: reflectionBalance.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq("holder_address", to)
    } else {
      await supabase.from("holders").insert({
        holder_address: to,
        balance: balance.toString(),
        base_balance: baseBalance.toString(),
        reflection_balance: reflectionBalance.toString(),
        first_seen_block: blockNumber,
        first_seen_time: new Date().toISOString(),
        proxy_count: 0,
        locked: false,
        last_scanned: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    log("Tracked infection", {
      from,
      to,
      amount: amount.toString(),
      block: blockNumber,
      tx: txHash,
    })
  } catch (error: any) {
    console.error("Error handling transfer:", error.message)

    await supabase.from("script_logs").insert({
      log_type: "error",
      message: "Failed to track infection",
      details: { error: error.message, from, to, amount: amount.toString() },
    })
  }
}

async function pollForEvents() {
  try {
    const currentBlock = await provider.getBlockNumber()

    // Initialize lastProcessedBlock if not set
    if (lastProcessedBlock === 0) {
      lastProcessedBlock = currentBlock - 1
      log(`Starting from block ${lastProcessedBlock}`)
    }

    // Query events from last processed block to current
    if (currentBlock > lastProcessedBlock) {
      const events = await contract.queryFilter(contract.filters.Transfer(), lastProcessedBlock + 1, currentBlock)

      if (events.length > 0) {
        log(`Found ${events.length} transfer(s) in blocks ${lastProcessedBlock + 1} to ${currentBlock}`)

        for (const event of events) {
          const [from, to, amount] = event.args as [string, string, bigint]
          await handleTransfer(from, to, amount, event.transactionHash, event.blockNumber)
        }
      }

      lastProcessedBlock = currentBlock
    }
  } catch (error: any) {
    console.error("@TODO Error:", error.message)

    await supabase.from("script_logs").insert({
      log_type: "error",
      message: "Polling error",
      details: { error: error.message, stack: error.stack },
    })
  }
}

async function startTracking() {
  log("Starting infection tracking with polling method...")

  setInterval(async () => {
    await pollForEvents()
  }, 3000)

  log("Infection tracking active (polling every 3 seconds)")
}

process.on("SIGTERM", () => {
  log("Received SIGTERM, shutting down")
  process.exit(0)
})

process.on("SIGINT", () => {
  log("Received SIGINT, shutting down")
  process.exit(0)
})

startTracking().catch(async (error) => {
  console.error("Fatal error:", error)

  await supabase.from("script_logs").insert({
    log_type: "error",
    message: "Fatal error in infection tracker",
    details: { error: error.message, stack: error.stack },
  })

  process.exit(1)
})
