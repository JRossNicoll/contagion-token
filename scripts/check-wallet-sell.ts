import dotenv from "dotenv"
import { ethers } from "ethers"

dotenv.config({ path: ".env.local" })

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!
const RPC_URL = process.env.RPC_URL!
const WALLET_TO_CHECK = "0x0eaad124e67804b273cb18a08550f3ff9258f600"

const CONTRACT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function maxTransactionAmount() view returns (uint256)",
  "function maxWalletAmount() view returns (uint256)",
  "function isExcludedFromLimits(address) view returns (bool)",
  "function limitsRemoved() view returns (bool)",
  "function totalSupply() view returns (uint256)",
  "function dexRouter() view returns (address)",
  "function reflectionTaxRate() view returns (uint256)",
  "function gasTaxRate() view returns (uint256)",
]

async function checkWalletSellCapability() {
  console.log("\n🔍 Checking why wallet cannot sell...\n")
  console.log(`Wallet: ${WALLET_TO_CHECK}`)
  console.log(`Contract: ${CONTRACT_ADDRESS}\n`)

  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

  try {
    const [balance, maxTx, maxWallet, excluded, limitsRemoved, totalSupply, dexRouter, reflectionTax, gasTax] =
      await Promise.all([
        contract.balanceOf(WALLET_TO_CHECK),
        contract.maxTransactionAmount(),
        contract.maxWalletAmount(),
        contract.isExcludedFromLimits(WALLET_TO_CHECK),
        contract.limitsRemoved(),
        contract.totalSupply(),
        contract.dexRouter(),
        contract.reflectionTaxRate(),
        contract.gasTaxRate(),
      ])

    const balanceFormatted = ethers.formatUnits(balance, 9)
    const maxTxFormatted = ethers.formatUnits(maxTx, 9)
    const maxWalletFormatted = ethers.formatUnits(maxWallet, 9)
    const totalSupplyFormatted = ethers.formatUnits(totalSupply, 9)
    const totalTax = Number(reflectionTax) + Number(gasTax)

    console.log("📊 WALLET STATUS:")
    console.log(`   Balance: ${balanceFormatted} CONTAGION`)
    console.log(`   Excluded from limits: ${excluded}`)
    console.log("")

    console.log("📏 CONTRACT LIMITS:")
    console.log(`   Total Supply: ${totalSupplyFormatted} CONTAGION`)
    console.log(`   Max Transaction: ${maxTxFormatted} CONTAGION (2% of supply)`)
    console.log(`   Max Wallet: ${maxWalletFormatted} CONTAGION (2% of supply)`)
    console.log(`   Limits Removed: ${limitsRemoved}`)
    console.log(`   DEX Router: ${dexRouter}`)
    console.log(`   Total Tax: ${totalTax}% (${reflectionTax}% reflection + ${gasTax}% gas)`)
    console.log("")

    const issues = []

    if (balance === 0n) {
      issues.push("❌ ZERO BALANCE - This wallet has no tokens")
    }

    if (balance > maxTx && !excluded && !limitsRemoved) {
      issues.push(
        `❌ BALANCE EXCEEDS MAX TRANSACTION - You have ${balanceFormatted} but can only sell ${maxTxFormatted} per transaction`,
      )
      issues.push(
        `   Your balance is ${((Number(balance) / Number(maxTx)) * 100).toFixed(2)}% of the max transaction limit`,
      )
    }

    console.log("🔍 SELL CAPABILITY ANALYSIS:\n")

    if (issues.length > 0) {
      console.log("⚠️  ISSUES FOUND:")
      issues.forEach((issue) => console.log(`   ${issue}`))
      console.log("")
      console.log("💡 SOLUTIONS:")

      if (balance > maxTx && !excluded && !limitsRemoved) {
        console.log(`   Option 1: Sell in smaller amounts (max ${maxTxFormatted} per transaction)`)
        console.log(`   Option 2: Remove limits entirely: contract.removeLimits() (as owner)`)
        console.log(
          `   Option 3: Exclude wallet from limits: contract.excludeFromLimits("${WALLET_TO_CHECK}", true) (as owner)`,
        )
        console.log(`   Option 4: Increase max transaction: contract.setMaxTransaction(10) for 10% (as owner)`)
      }
    } else {
      console.log("✅ NO BLOCKING ISSUES FOUND")
      console.log("")
      console.log("📝 PANCAKESWAP CHECKLIST:")
      console.log(`   ✓ Set slippage to ${totalTax + 5}%-${totalTax + 7}% (${totalTax}% tax + price movement)`)
      console.log(`   ✓ Confirm you're selling TO the DEX router: ${dexRouter}`)
      console.log("   ✓ Gas limit: 300,000 - 500,000")
      console.log(`   ✓ Make sure you have enough BNB for gas fees`)
      console.log("")
      console.log("🔎 If still failing, check the BSCScan transaction error message")
    }
  } catch (error: any) {
    console.error("❌ Error checking wallet:", error.message)
    console.error("Stack:", error.stack)
  }
}

checkWalletSellCapability()
