import { ethers } from "ethers"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const RPC_URL = process.env.RPC_URL!
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const provider = new ethers.JsonRpcProvider(RPC_URL)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const CONTRACT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function reflectionPool() view returns (address)",
  "function TOTAL_SUPPLY() view returns (uint256)",
  "function currentSnapshotId() view returns (uint256)",
]

async function testSystem() {
  console.log("🧪 Testing Contagion Token System\n")

  try {
    // Test 1: Contract Connection
    console.log("1️⃣ Testing Contract Connection...")
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
    const totalSupply = await contract.TOTAL_SUPPLY()
    const reflectionPool = await contract.reflectionPool()
    console.log("✅ Contract connected")
    console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, 9)} tokens`)
    console.log(`   Reflection Pool: ${reflectionPool}`)

    // Test 2: Database Connection
    console.log("\n2️⃣ Testing Database Connection...")
    const { count, error } = await supabase.from("holders").select("*", { count: "exact", head: true })
    if (error) throw error
    console.log("✅ Database connected")
    console.log(`   Total holders in DB: ${count}`)

    // Test 3: Check Views
    console.log("\n3️⃣ Testing Database Views...")
    const { data: stats, error: statsError } = await supabase.from("holder_statistics").select("*").limit(1)
    if (statsError) {
      console.log("❌ holder_statistics view not found")
      console.log("   Run: scripts/create-views.sql in Supabase SQL Editor")
    } else {
      console.log("✅ holder_statistics view exists")
    }

    const { data: distSummary, error: distError } = await supabase.from("distribution_summary").select("*").limit(1)
    if (distError) {
      console.log("❌ distribution_summary view not found")
      console.log("   Run: scripts/create-views.sql in Supabase SQL Editor")
    } else {
      console.log("✅ distribution_summary view exists")
    }

    // Test 4: Check Reflection Pool Balance
    console.log("\n4️⃣ Checking Reflection Pool Balance...")
    const poolBalance = await contract.balanceOf(reflectionPool)
    const threshold = (totalSupply * BigInt(process.env.SNAPSHOT_THRESHOLD || "1")) / 100n
    const percentOfSupply = (poolBalance * 100n) / totalSupply

    console.log(`   Pool Balance: ${ethers.formatUnits(poolBalance, 9)} tokens`)
    console.log(`   Threshold: ${ethers.formatUnits(threshold, 9)} tokens`)
    console.log(`   Current: ${percentOfSupply}% of supply`)

    if (poolBalance >= threshold) {
      console.log("⚠️  Pool ready for snapshot!")
    }

    // Test 5: Check Recent Logs
    console.log("\n5️⃣ Checking Recent Script Logs...")
    const { data: logs, error: logsError } = await supabase
      .from("script_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    if (logsError) {
      console.log("❌ No script logs found")
      console.log("   Make sure monitoring scripts are running")
    } else {
      console.log(`✅ Found ${logs.length} recent logs`)
      logs.forEach((log) => {
        console.log(`   [${log.created_at}] ${log.log_type}: ${log.message}`)
      })
    }

    // Test 6: Check Snapshots
    console.log("\n6️⃣ Checking Snapshots...")
    const currentSnapshotId = await contract.currentSnapshotId()
    console.log(`   Current Snapshot ID on chain: ${currentSnapshotId}`)

    const { data: dbSnapshots, error: snapError } = await supabase
      .from("snapshots")
      .select("*")
      .order("snapshot_id", { ascending: false })
      .limit(3)

    if (snapError || !dbSnapshots || dbSnapshots.length === 0) {
      console.log("ℹ️  No snapshots in database yet")
    } else {
      console.log(`✅ Found ${dbSnapshots.length} snapshots in database`)
      dbSnapshots.forEach((snap) => {
        console.log(`   #${snap.snapshot_id}: ${snap.status} - ${ethers.formatUnits(snap.amount, 9)} tokens`)
      })
    }

    // Summary
    console.log("\n" + "=".repeat(50))
    console.log("📊 System Status Summary")
    console.log("=".repeat(50))
    console.log(`Contract: ✅ Connected`)
    console.log(`Database: ✅ Connected`)
    console.log(`Holders: ${count} in database`)
    console.log(`Pool: ${ethers.formatUnits(poolBalance, 9)} tokens (${percentOfSupply}% of supply)`)
    console.log(`Snapshots: ${currentSnapshotId} on-chain, ${dbSnapshots?.length || 0} in DB`)
    console.log("\n✨ System test complete!")
  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message)
    process.exit(1)
  }
}

testSystem()
