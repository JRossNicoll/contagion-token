import { ethers } from "ethers"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const rpcUrl = process.env.RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/"
const deploymentTxHash = "0x3d481a87990a750c6b036eb5d8fec0764cb46c51e96281e8b0b31db1cf36989f"

async function decodeDeployment() {
  console.log("🔍 Fetching deployment transaction...\n")

  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const tx = await provider.getTransaction(deploymentTxHash)

  if (!tx) {
    console.error("❌ Transaction not found")
    return
  }

  console.log("📋 Transaction Details:")
  console.log("From:", tx.from)
  console.log("To:", tx.to)
  console.log("Contract Address:", tx.creates || "N/A")
  console.log("\n📦 Input Data Length:", tx.data.length)

  // The constructor ABI for decoding
  const constructorABI = [
    "constructor(string memory name, string memory symbol, address _reflectionPool, address _gasPool, address _dexRouter)",
  ]

  const iface = new ethers.Interface([
    "constructor(string name, string symbol, address _reflectionPool, address _gasPool, address _dexRouter)",
  ])

  try {
    // Get the creation code and constructor args
    // Constructor args are at the end of the tx.data
    const bytecode = tx.data

    console.log("\n🔧 Raw Input Data (first 200 chars):")
    console.log(bytecode.substring(0, 200) + "...")

    // The constructor args are encoded at the end
    // We need to find where they start (after the contract bytecode)

    // For now, let's get the receipt to see the contract address
    const receipt = await provider.getTransactionReceipt(deploymentTxHash)
    if (receipt) {
      console.log("\n✅ Contract Deployed At:", receipt.contractAddress)
      console.log("Status:", receipt.status === 1 ? "Success" : "Failed")
      console.log("Block Number:", receipt.blockNumber)
      console.log("Gas Used:", receipt.gasUsed.toString())
    }

    // Try to extract constructor parameters
    // The last part of the data should be the ABI-encoded constructor args
    console.log("\n📝 To verify on BSCScan, use these settings:")
    console.log("Compiler: v0.8.20")
    console.log("Optimization: Yes (200 runs)")
    console.log("License: MIT")
    console.log("\nThen BSCScan will auto-detect constructor arguments from the transaction.")
    console.log("Or manually decode from Input Data in the transaction page.")
  } catch (error) {
    console.error("Error decoding:", error)
  }
}

decodeDeployment()
