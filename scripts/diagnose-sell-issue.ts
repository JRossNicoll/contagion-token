import dotenv from "dotenv"
import { ethers } from "ethers"

dotenv.config({ path: ".env.local" })

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!
const RPC_URL = process.env.RPC_URL!

const WALLET_TO_CHECK = "0x0eaad124e67804b273cb18a08550f3ff9258f600"

const CONTRACT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function baseBalanceOf(address) view returns (uint256)",
  "function reflectionBalanceOf(address) view returns (uint256)",
  "function maxTransactionAmount() view returns (uint256)",
  "function maxWalletAmount() view returns (uint256)",
  "function limitsRemoved() view returns (bool)",
  "function isExcludedFromLimits(address) view returns (bool)",
  "function isExcludedFromTax(address) view returns (bool)",
  "function dexRouter() view returns (address)",
  "function MAX_SELLS_PER_BLOCK() view returns (uint256)",
]

async function diagnoseSellIssue() {
  console.log("=== Sell Issue Diagnostic ===\n")

  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

  try {
    // Get wallet balances
    const balance = await contract.balanceOf(WALLET_TO_CHECK)
    const baseBalance = await contract.baseBalanceOf(WALLET_TO_CHECK)
    const reflectionBalance = await contract.reflectionBalanceOf(WALLET_TO_CHECK)

    console.log("Wallet Balances:")
    console.log(`  Total: ${ethers.formatUnits(balance, 9)} CONTAGION`)
    console.log(`  Base: ${ethers.formatUnits(baseBalance, 9)} CONTAGION`)
    console.log(`  Reflections: ${ethers.formatUnits(reflectionBalance, 9)} CONTAGION`)
    console.log()

    // Get limits
    const maxTx = await contract.maxTransactionAmount()
    const maxWallet = await contract.maxWalletAmount()
    const limitsRemoved = await contract.limitsRemoved()
    const excludedFromLimits = await contract.isExcludedFromLimits(WALLET_TO_CHECK)
    const excludedFromTax = await contract.isExcludedFromTax(WALLET_TO_CHECK)

    console.log("Transaction Limits:")
    console.log(`  Max Transaction: ${ethers.formatUnits(maxTx, 9)} CONTAGION`)
    console.log(`  Max Wallet: ${ethers.formatUnits(maxWallet, 9)} CONTAGION`)
    console.log(`  Limits Removed: ${limitsRemoved}`)
    console.log(`  Wallet Excluded from Limits: ${excludedFromLimits}`)
    console.log(`  Wallet Excluded from Tax: ${excludedFromTax}`)
    console.log()

    // Get DEX info
    const dexRouter = await contract.dexRouter()
    const maxSellsPerBlock = await contract.MAX_SELLS_PER_BLOCK()

    console.log("DEX Configuration:")
    console.log(`  Router Address: ${dexRouter}`)
    console.log(`  Max Sells Per Block: ${maxSellsPerBlock}`)
    console.log()

    // Check for issues
    console.log("Potential Issues:")

    if (balance === 0n) {
      console.log("  ❌ Wallet has ZERO balance - cannot sell")
    } else {
      console.log(`  ✅ Wallet has balance: ${ethers.formatUnits(balance, 9)} CONTAGION`)
    }

    if (!limitsRemoved && !excludedFromLimits) {
      console.log(`  ⚠️  Transaction limits active - max sell is ${ethers.formatUnits(maxTx, 9)} tokens`)
      if (balance > maxTx) {
        console.log(`  ❌ Your balance exceeds max transaction limit - sell in smaller amounts`)
      }
    }

    console.log("\nRecommendations:")
    console.log("  1. Make sure you are selling on PancakeSwap testnet")
    console.log("  2. Ensure you have BNB for gas fees")
    console.log(`  3. If selling more than ${ethers.formatUnits(maxTx, 9)} tokens, split into multiple transactions`)
    console.log("  4. Wait a few blocks between sells (max 3 sells per block)")
    console.log("  5. Check slippage settings (try 10-15% due to 6% tax)")
  } catch (error: any) {
    console.error("Error diagnosing issue:", error.message)
  }
}

diagnoseSellIssue()
