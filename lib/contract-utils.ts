import { createPublicClient, http, formatUnits } from "viem"
import { bsc } from "viem/chains"
import { TOKEN_CONFIG } from "./token-config"

const publicClient = createPublicClient({
  chain: bsc,
  transport: http(),
})

export async function getTokenBalance(address: string): Promise<string> {
  try {
    const balance = await publicClient.readContract({
      address: TOKEN_CONFIG.address as `0x${string}`,
      abi: TOKEN_CONFIG.abi,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    })

    return formatUnits(balance as bigint, TOKEN_CONFIG.decimals)
  } catch (error) {
    console.error("[v0] Error fetching token balance:", error)
    return "0"
  }
}

export async function getTokenInfo() {
  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      publicClient.readContract({
        address: TOKEN_CONFIG.address as `0x${string}`,
        abi: TOKEN_CONFIG.abi,
        functionName: "name",
      }),
      publicClient.readContract({
        address: TOKEN_CONFIG.address as `0x${string}`,
        abi: TOKEN_CONFIG.abi,
        functionName: "symbol",
      }),
      publicClient.readContract({
        address: TOKEN_CONFIG.address as `0x${string}`,
        abi: TOKEN_CONFIG.abi,
        functionName: "decimals",
      }),
      publicClient.readContract({
        address: TOKEN_CONFIG.address as `0x${string}`,
        abi: TOKEN_CONFIG.abi,
        functionName: "totalSupply",
      }),
    ])

    return {
      name: name as string,
      symbol: symbol as string,
      decimals: decimals as number,
      totalSupply: formatUnits(totalSupply as bigint, decimals as number),
    }
  } catch (error) {
    console.error("[v0] Error fetching token info:", error)
    return null
  }
}
