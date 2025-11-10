import { exec } from "child_process"
import { promisify } from "util"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const execAsync = promisify(exec)

async function verifyContract() {
  const contractAddress = process.env.CONTRACT_ADDRESS
  const bscscanApiKey = process.env.BSCSCAN_API_KEY

  if (!contractAddress) {
    console.error("❌ CONTRACT_ADDRESS not found in environment variables")
    process.exit(1)
  }

  if (!bscscanApiKey) {
    console.error("❌ BSCSCAN_API_KEY not found. Get one from https://bscscan.com/myapikey")
    process.exit(1)
  }

  console.log("[v0] Starting contract verification...")
  console.log("[v0] Contract Address:", contractAddress)
  console.log("[v0] Network: BSC Testnet")

  try {
    // Install hardhat-verify plugin
    console.log("[v0] Installing verification tools...")
    await execAsync("npm install --save-dev @nomicfoundation/hardhat-verify")

    // Create hardhat config for verification
    const hardhatConfig = `
require('@nomicfoundation/hardhat-verify')

module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    bscTestnet: {
      url: '${process.env.RPC_URL}',
      chainId: 97
    }
  },
  etherscan: {
    apiKey: {
      bscTestnet: '${bscscanApiKey}'
    }
  }
}
`

    // Write hardhat config
    await execAsync(`echo '${hardhatConfig}' > hardhat.config.js`)

    // Run verification
    const { stdout, stderr } = await execAsync(
      `npx hardhat verify --network bscTestnet ${contractAddress} "Contagion Token" "CONTAGION" [REFLECTION_POOL] [GAS_POOL] [DEX_ROUTER]`,
    )

    console.log("[v0] Verification output:", stdout)
    if (stderr) console.log("[v0] Warnings:", stderr)

    console.log("✓ Contract verified successfully!")
    console.log(`View on BSCScan: https://testnet.bscscan.com/address/${contractAddress}#code`)
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✓ Contract is already verified!")
    } else {
      console.error("❌ Verification failed:", error.message)
      console.log("\n📝 Manual verification steps:")
      console.log("1. Go to: https://testnet.bscscan.com/verifyContract")
      console.log("2. Enter contract address:", contractAddress)
      console.log("3. Compiler: 0.8.20")
      console.log("4. Optimization: Yes (200 runs)")
      console.log("5. Flatten contract in Remix and paste code")
    }
  }
}

verifyContract()
