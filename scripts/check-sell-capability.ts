import dotenv from "dotenv"
import { ethers } from "ethers"

dotenv.config({ path: ".env.local" })

const RPC_URL = process.env.RPC_URL!
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!
const WALLET_TO_CHECK = "0x0eaad124e67804b273cb18a08550f3ff9258f600"

const CONTRACT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function maxTransactionAmount() view returns (uint256)",
  "function maxWallet() view returns (uint256)",
  "function isExcludedFromLimits(address) view returns (bool)",
  "function dexRouter() view returns (address)",
  "function owner() view returns (address)",
  "function tradingEnabled() view returns (bool)",
  "function totalSupply() view returns (uint256)",
]

async function checkSellCapability() {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

  console.log("\n🔍 CONTAGION TOKEN SELL DIAGNOSTIC")
  console.log("=====================================\n")

  try {
    // Get wallet balance
    const balance = await contract.balanceOf(WALLET_TO_CHECK)
    const balanceFormatted = ethers.formatUnits(balance, 9)

    console.log("📊 WALLET INFORMATION")
    console.log(`Address: ${WALLET_TO_CHECK}`)
    console.log(`Balance: ${balanceFormatted} CONTAGION\n`)

    if (balance === 0n) {
      console.log("❌ PROBLEM FOUND: Wallet has zero balance!")
      console.log("   You need tokens to sell.\n")
      return
    }

    // Get contract limits
    const maxTx = await contract.maxTransactionAmount()
    const maxTxFormatted = ethers.formatUnits(maxTx, 9)

    const maxWallet = await contract.maxWallet()
    const maxWalletFormatted = ethers.formatUnits(maxWallet, 9)

    const totalSupply = await contract.totalSupply()
    const totalSupplyFormatted = ethers.formatUnits(totalSupply, 9)

    console.log("⚙️  CONTRACT LIMITS")
    console.log(
      `Max Transaction: ${maxTxFormatted} CONTAGION (${((Number(maxTx) * 100) / Number(totalSupply)).toFixed(2)}% of supply)`,
    )
    console.log(
      `Max Wallet: ${maxWalletFormatted} CONTAGION (${((Number(maxWallet) * 100) / Number(totalSupply)).toFixed(2)}% of supply)`,
    )
    console.log(`Total Supply: ${totalSupplyFormatted} CONTAGION\n`)

    // Check if wallet is excluded from limits
    const isExcluded = await contract.isExcludedFromLimits(WALLET_TO_CHECK)
    console.log("🔓 EXCLUSION STATUS")
    console.log(`Excluded from limits: ${isExcluded ? "YES ✓" : "NO ✗"}`)

    if (isExcluded) {
      console.log("   This wallet can trade without limits.\n")
    } else {
      console.log("   This wallet is subject to transaction limits.\n")
    }

    // Check trading status
    const tradingEnabled = await contract.tradingEnabled()
    console.log("🔄 TRADING STATUS")
    console.log(`Trading enabled: ${tradingEnabled ? "YES ✓" : "NO ✗"}`)

    if (!tradingEnabled) {
      console.log("❌ PROBLEM FOUND: Trading is not enabled on the contract!")
      console.log("   The owner needs to enable trading first.\n")
    } else {
      console.log("   Trading is active.\n")
    }

    // Get DEX router
    const dexRouter = await contract.dexRouter()
    console.log("🏪 DEX CONFIGURATION")
    console.log(`DEX Router: ${dexRouter}`)
    console.log(`Expected (Testnet): 0xD99D1c33F9fC3444f8101754aBC46c52416550D1\n`)

    // Get owner
    const owner = await contract.owner()
    console.log("👑 OWNERSHIP")
    console.log(`Contract Owner: ${owner}\n`)

    // Calculate how much they can sell
    console.log("💡 SELL RECOMMENDATIONS")

    if (!isExcluded && balance > maxTx) {
      const maxSellAmount = ethers.formatUnits(maxTx, 9)
      console.log(`⚠️  Your balance exceeds max transaction limit!`)
      console.log(`   Maximum you can sell at once: ${maxSellAmount} CONTAGION`)
      console.log(`   Your balance: ${balanceFormatted} CONTAGION`)
      console.log(`   You need to sell in multiple transactions or get excluded from limits.\n`)
    } else {
      console.log(`✓ You can sell your full balance in one transaction.\n`)
    }

    // Check if they need to set slippage
    console.log("🎯 PANCAKESWAP SETTINGS")
    console.log("When selling on PancakeSwap:")
    console.log("  - Set slippage to at least 10-12% (6% tax + DEX slippage)")
    console.log("  - Make sure you're using the correct router")
    console.log("  - Ensure you have enough BNB for gas fees\n")

    // Get recent transaction to check for errors
    console.log("🔎 CHECKING RECENT TRANSACTION...")
    const txHash = "0xdf2444f4829ae41ccfb2ec26bf587453dc16aa7e12983aa4d2bb541236bb106b"

    try {
      const tx = await provider.getTransaction(txHash)
      if (tx) {
        console.log(`Transaction found: ${txHash}`)
        const receipt = await provider.getTransactionReceipt(txHash)

        if (receipt) {
          if (receipt.status === 0) {
            console.log("❌ Transaction FAILED")
            console.log("\nPossible reasons:")
            console.log("  1. Slippage too low (increase to 12%)")
            console.log("  2. Amount exceeds max transaction limit")
            console.log("  3. Insufficient BNB for gas")
            console.log("  4. Trading not enabled")
            console.log("  5. Anti-bot protection triggered\n")
          } else {
            console.log("✓ Transaction succeeded\n")
          }
        }
      }
    } catch (e) {
      console.log("Could not fetch transaction details\n")
    }

    // Summary
    console.log("📋 SUMMARY & NEXT STEPS")
    console.log("=====================================")

    if (!tradingEnabled) {
      console.log("1. Enable trading on the contract (owner only)")
      console.log("   Run: contract.enableTrading()")
    } else if (!isExcluded && balance > maxTx) {
      console.log("1. Option A: Exclude your wallet from limits")
      console.log('   Run: contract.excludeFromLimits("0x0eaad124e67804b273cb18a08550f3ff9258f600", true)')
      console.log("2. Option B: Sell in smaller amounts")
      console.log(`   Max per transaction: ${maxTxFormatted} CONTAGION`)
    } else {
      console.log("1. Go to PancakeSwap Testnet")
      console.log("2. Set slippage to 12%")
      console.log("3. Try selling a small amount first (100 tokens)")
      console.log("4. If successful, increase the amount")
    }

    console.log("\n")
  } catch (error: any) {
    console.error("Error running diagnostic:", error.message)
  }
}

checkSellCapability()
